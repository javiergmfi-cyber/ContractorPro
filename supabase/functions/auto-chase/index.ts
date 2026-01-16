/**
 * Edge Function: auto-chase
 * Automated SMS reminders for unpaid invoices (PRO feature)
 * Phase 6: Auto-Chase Engine
 *
 * Chase Schedule (when auto_chase_enabled=true AND remaining_balance > 0):
 * - +24h after sent_at: reminder #1
 * - +72h after sent_at: reminder #2
 * - then every 3 days: reminder #3–#5 (max 5)
 *
 * Runs via Supabase cron:
 * SELECT cron.schedule('auto-chase', '0 * * * *', $$
 *   SELECT net.http_post(
 *     url := 'https://your-project.supabase.co/functions/v1/auto-chase',
 *     headers := '{"Authorization": "Bearer your-service-role-key"}'::jsonb
 *   ) AS request_id;
 * $$);
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Chase schedule thresholds in hours
const CHASE_SCHEDULE = [
  { attempt: 1, hoursAfterSent: 24 },   // +24h
  { attempt: 2, hoursAfterSent: 72 },   // +72h
  { attempt: 3, hoursAfterSent: 144 },  // +6 days (72h + 3 days)
  { attempt: 4, hoursAfterSent: 216 },  // +9 days
  { attempt: 5, hoursAfterSent: 288 },  // +12 days (max)
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invoices eligible for chase using the helper function
    const { data: invoicesForChase, error: fetchError } = await supabase.rpc(
      "get_invoices_for_chase"
    );

    if (fetchError) {
      console.error("Error fetching invoices for chase:", fetchError);
      throw fetchError;
    }

    let remindersSent = 0;
    let remindersSkipped = 0;
    const errors: string[] = [];

    for (const invoice of invoicesForChase || []) {
      try {
        const hoursSinceSent = Number(invoice.hours_since_sent);
        const chaseCount = invoice.chase_count;

        // Determine which reminder attempt this should be
        const nextAttempt = getNextAttempt(hoursSinceSent, chaseCount);

        if (!nextAttempt) {
          // Not time for next reminder yet, or max reached
          remindersSkipped++;
          continue;
        }

        // Try to insert chase event (unique constraint prevents duplicates)
        const { error: insertError } = await supabase.from("chase_events").insert({
          invoice_id: invoice.invoice_id,
          user_id: invoice.user_id,
          attempt_number: nextAttempt,
          channel: "sms",
          message_type: "auto_reminder",
          metadata: {
            hours_since_sent: hoursSinceSent,
            remaining_balance: invoice.remaining_balance,
          },
        });

        if (insertError) {
          // Unique constraint violation = already sent this reminder
          if (insertError.code === "23505") {
            remindersSkipped++;
            continue;
          }
          throw insertError;
        }

        // Get the payment tracking URL
        const paymentUrl = `${SUPABASE_URL}/functions/v1/track-invoice-view?id=${invoice.tracking_id}`;

        // Generate short reminder message (Phase 6.3)
        const message = generateChaseMessage(
          invoice.client_name,
          invoice.remaining_balance,
          invoice.currency,
          paymentUrl,
          nextAttempt
        );

        // Send SMS if Twilio configured and phone available
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && invoice.client_phone) {
          const smsResult = await sendTwilioSMS(
            invoice.client_phone,
            message
          );

          if (smsResult.success) {
            remindersSent++;

            // Log activity event
            await supabase.from("activity_events").insert({
              user_id: invoice.user_id,
              type: "auto_chase_sent",
              invoice_id: invoice.invoice_id,
              client_name: invoice.client_name,
              amount: invoice.remaining_balance,
              metadata: {
                attempt_number: nextAttempt,
                channel: "sms",
                message_id: smsResult.messageId,
              },
            });

            console.log(`Chase #${nextAttempt} sent for invoice ${invoice.invoice_id}`);
          } else {
            errors.push(`SMS failed for invoice ${invoice.invoice_id}: ${smsResult.error}`);

            // Update chase event with error
            await supabase
              .from("chase_events")
              .update({
                metadata: {
                  hours_since_sent: hoursSinceSent,
                  remaining_balance: invoice.remaining_balance,
                  error: smsResult.error,
                },
              })
              .eq("invoice_id", invoice.invoice_id)
              .eq("attempt_number", nextAttempt);
          }
        } else {
          // No Twilio or no phone - log but don't count as error
          console.log(`Skipping SMS for invoice ${invoice.invoice_id}: no phone or Twilio not configured`);
          remindersSkipped++;
        }
      } catch (invoiceError: any) {
        errors.push(`Error processing invoice ${invoice.invoice_id}: ${invoiceError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: invoicesForChase?.length || 0,
        remindersSent,
        remindersSkipped,
        errors: errors.length > 0 ? errors : undefined,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Auto-chase error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Determine the next chase attempt number based on hours since sent
 */
function getNextAttempt(hoursSinceSent: number, currentChaseCount: number): number | null {
  // Max 5 reminders
  if (currentChaseCount >= 5) {
    return null;
  }

  const nextAttemptNumber = currentChaseCount + 1;
  const schedule = CHASE_SCHEDULE.find((s) => s.attempt === nextAttemptNumber);

  if (!schedule) {
    return null;
  }

  // Check if enough time has passed for this attempt
  if (hoursSinceSent >= schedule.hoursAfterSent) {
    return nextAttemptNumber;
  }

  return null;
}

/**
 * Generate short chase message (Phase 6.3)
 * Template: "Hi {name} — quick reminder your invoice balance of ${X} is still due. Pay here: {link}"
 */
function generateChaseMessage(
  clientName: string,
  remainingBalance: number,
  currency: string,
  paymentUrl: string,
  attemptNumber: number
): string {
  const amount = formatCurrency(remainingBalance, currency);
  const firstName = clientName.split(" ")[0]; // Use first name for friendlier tone

  // Escalate tone slightly with each attempt
  if (attemptNumber <= 2) {
    return `Hi ${firstName} — quick reminder your invoice balance of ${amount} is still due. Pay here: ${paymentUrl}`;
  } else if (attemptNumber <= 4) {
    return `Hi ${firstName} — your invoice balance of ${amount} remains unpaid. Please pay at your earliest convenience: ${paymentUrl}`;
  } else {
    return `Hi ${firstName} — final reminder: ${amount} is still outstanding. Please pay today: ${paymentUrl}`;
  }
}

/**
 * Format cents to currency string
 */
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Send SMS via Twilio
 */
async function sendTwilioSMS(
  to: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Format phone number to E.164
    const formattedTo = formatPhoneNumber(to);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: TWILIO_PHONE_NUMBER!,
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

/**
 * Format phone number to E.164
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length > 10 && !cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return phone.startsWith("+") ? phone : `+${cleaned}`;
}
