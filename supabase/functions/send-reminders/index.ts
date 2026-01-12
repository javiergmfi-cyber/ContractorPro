import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Send Reminders Edge Function
 * Per product-strategy.md "Bad Cop" system
 *
 * Scheduled to run daily via Supabase cron:
 * SELECT cron.schedule('send-reminders', '0 9 * * *', $$
 *   SELECT net.http_post(
 *     url := 'https://your-project.supabase.co/functions/v1/send-reminders',
 *     headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
 *   ) AS request_id;
 * $$);
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for cron jobs
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all users with reminders enabled
    const { data: reminderSettings, error: settingsError } = await supabaseAdmin
      .from("reminder_settings")
      .select(`
        *,
        profiles!inner (
          id,
          business_name,
          full_name
        )
      `)
      .eq("enabled", true);

    if (settingsError) {
      console.error("Error fetching reminder settings:", settingsError);
      throw settingsError;
    }

    let remindersSent = 0;
    let remindersSkipped = 0;
    const errors: string[] = [];

    // Process each user's reminders
    for (const settings of reminderSettings || []) {
      try {
        const userId = settings.user_id;
        const dayIntervals = settings.day_intervals || [3, 7, 14];
        const businessName = settings.profiles?.business_name || settings.profiles?.full_name || "Your contractor";

        // Get overdue invoices for this user
        const { data: invoices, error: invoicesError } = await supabaseAdmin
          .from("invoices")
          .select(`
            *,
            clients!inner (
              name,
              email,
              phone
            )
          `)
          .eq("user_id", userId)
          .in("status", ["sent", "overdue"])
          .lt("due_date", today.toISOString());

        if (invoicesError) {
          console.error(`Error fetching invoices for user ${userId}:`, invoicesError);
          continue;
        }

        // Process each overdue invoice
        for (const invoice of invoices || []) {
          const dueDate = new Date(invoice.due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

          // Check if this is a reminder day
          if (!dayIntervals.includes(daysOverdue)) {
            continue;
          }

          // Check if we already sent a reminder today for this invoice
          const { data: existingReminder } = await supabaseAdmin
            .from("reminder_logs")
            .select("id")
            .eq("invoice_id", invoice.id)
            .gte("sent_at", today.toISOString())
            .limit(1);

          if (existingReminder && existingReminder.length > 0) {
            remindersSkipped++;
            continue;
          }

          // Update invoice status to overdue if not already
          if (invoice.status !== "overdue") {
            await supabaseAdmin
              .from("invoices")
              .update({ status: "overdue" })
              .eq("id", invoice.id);
          }

          // Prepare reminder message
          const message = generateReminderMessage(
            settings.message_template || DEFAULT_TEMPLATE,
            {
              invoice_number: invoice.invoice_number,
              business_name: businessName,
              total: formatCurrency(invoice.total, invoice.currency),
              days_overdue: daysOverdue,
              payment_link: invoice.stripe_hosted_invoice_url || "",
            }
          );

          // Send SMS if enabled and phone available
          if (settings.sms_enabled && invoice.clients?.phone && twilioAccountSid) {
            const smsResult = await sendTwilioSMS(
              twilioAccountSid,
              twilioAuthToken!,
              twilioPhoneNumber!,
              invoice.clients.phone,
              message
            );

            // Log the reminder
            await supabaseAdmin.from("reminder_logs").insert({
              invoice_id: invoice.id,
              reminder_type: "sms",
              status: smsResult.success ? "sent" : "failed",
              error_message: smsResult.error,
            });

            if (smsResult.success) {
              remindersSent++;
            } else {
              errors.push(`SMS failed for ${invoice.invoice_number}: ${smsResult.error}`);
            }
          }

          // Send email if enabled and email available
          if (settings.email_enabled && invoice.clients?.email) {
            // For now, log as pending - email would use SendGrid or similar
            await supabaseAdmin.from("reminder_logs").insert({
              invoice_id: invoice.id,
              reminder_type: "email",
              status: "pending",
            });
            // TODO: Implement SendGrid email sending
          }
        }
      } catch (userError: any) {
        errors.push(`Error processing user ${settings.user_id}: ${userError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        remindersSkipped,
        errors: errors.length > 0 ? errors : undefined,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

const DEFAULT_TEMPLATE = `This is an automated reminder for invoice {{invoice_number}} from {{business_name}}. Amount due: {{total}}. This invoice is {{days_overdue}} days overdue. Please pay at your earliest convenience.`;

function generateReminderMessage(
  template: string,
  variables: {
    invoice_number: string;
    business_name: string;
    total: string;
    days_overdue: number;
    payment_link: string;
  }
): string {
  let message = template;

  message = message.replace(/\{\{invoice_number\}\}/g, variables.invoice_number);
  message = message.replace(/\{\{business_name\}\}/g, variables.business_name);
  message = message.replace(/\{\{total\}\}/g, variables.total);
  message = message.replace(/\{\{days_overdue\}\}/g, String(variables.days_overdue));

  if (variables.payment_link) {
    message = message.replace(/\{\{payment_link\}\}/g, variables.payment_link);
    message += `\n\nPay now: ${variables.payment_link}`;
  }

  return message;
}

function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

async function sendTwilioSMS(
  accountSid: string,
  authToken: string,
  fromNumber: string,
  toNumber: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    // Format phone number
    const formattedTo = formatPhoneNumber(toNumber);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: fromNumber,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Failed to send SMS" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length > 10 && !cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return phone;
}
