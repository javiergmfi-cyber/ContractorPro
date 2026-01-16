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
 * SMS Compliance:
 * - First message includes opt-out language
 * - Respects quiet hours (9 PM - 9 AM)
 * - Respects sms_opt_out flag
 *
 * Runs via Supabase cron (hourly):
 * SELECT cron.schedule('auto-chase-hourly', '0 * * * *', $$
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

// Quiet hours: Don't send SMS between 9 PM and 9 AM (local time approximation using UTC-5 for US)
const QUIET_HOUR_START = 21; // 9 PM
const QUIET_HOUR_END = 9;    // 9 AM

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[auto-chase] Starting execution...");

  try {
    // Check quiet hours (approximate US timezone)
    if (isQuietHours()) {
      console.log("[auto-chase] Quiet hours active, skipping execution");
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          reason: "quiet_hours",
          processedAt: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invoices eligible for chase using the helper function
    // This function already filters: auto_chase_enabled=true, remaining_balance>0,
    // status in (sent, overdue, deposit_paid), client_sms_opt_out=false
    const { data: invoicesForChase, error: fetchError } = await supabase.rpc(
      "get_invoices_for_chase"
    );

    if (fetchError) {
      console.error("[auto-chase] Error fetching invoices:", fetchError);
      throw fetchError;
    }

    console.log(`[auto-chase] Found ${invoicesForChase?.length || 0} eligible invoices`);

    let remindersSent = 0;
    let remindersSkipped = 0;
    const errors: string[] = [];
    const sentDetails: Array<{ invoiceId: string; attempt: number; clientName: string }> = [];

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

        // For deposit_paid status, ensure we're chasing the balance
        const isBalanceChase = invoice.status === "deposit_paid";

        // Try to insert chase event (unique constraint prevents duplicates)
        const { error: insertError } = await supabase.from("chase_events").insert({
          invoice_id: invoice.invoice_id,
          user_id: invoice.user_id,
          attempt_number: nextAttempt,
          channel: "sms",
          message_type: isBalanceChase ? "balance_reminder" : "auto_reminder",
          metadata: {
            hours_since_sent: hoursSinceSent,
            remaining_balance: invoice.remaining_balance,
            status: invoice.status,
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

        // Generate message with compliance (opt-out on first message)
        const message = generateChaseMessage(
          invoice.client_name,
          invoice.remaining_balance,
          invoice.currency,
          paymentUrl,
          nextAttempt,
          isBalanceChase,
          invoice.invoice_number
        );

        // Send SMS if Twilio configured and phone available
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && invoice.client_phone) {
          const smsResult = await sendTwilioSMS(invoice.client_phone, message);

          if (smsResult.success) {
            remindersSent++;
            sentDetails.push({
              invoiceId: invoice.invoice_id,
              attempt: nextAttempt,
              clientName: invoice.client_name,
            });

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
                is_balance_chase: isBalanceChase,
              },
            });

            console.log(`[auto-chase] Sent #${nextAttempt} to ${invoice.client_name} for invoice ${invoice.invoice_id}`);
          } else {
            const errorMsg = `SMS failed for invoice ${invoice.invoice_id}: ${smsResult.error}`;
            errors.push(errorMsg);
            console.error(`[auto-chase] ${errorMsg}`);

            // Update chase event with error
            await supabase
              .from("chase_events")
              .update({
                metadata: {
                  hours_since_sent: hoursSinceSent,
                  remaining_balance: invoice.remaining_balance,
                  error: smsResult.error,
                  failed_at: new Date().toISOString(),
                },
              })
              .eq("invoice_id", invoice.invoice_id)
              .eq("attempt_number", nextAttempt);
          }
        } else {
          console.log(`[auto-chase] Skipping invoice ${invoice.invoice_id}: missing phone or Twilio config`);
          remindersSkipped++;
        }
      } catch (invoiceError: any) {
        const errorMsg = `Error processing invoice ${invoice.invoice_id}: ${invoiceError.message}`;
        errors.push(errorMsg);
        console.error(`[auto-chase] ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[auto-chase] Completed in ${duration}ms: ${remindersSent} sent, ${remindersSkipped} skipped, ${errors.length} errors`);

    // Log summary to activity_events for monitoring
    if (remindersSent > 0 || errors.length > 0) {
      // Get first user from sent details for logging (or use system user)
      const firstSent = sentDetails[0];
      if (firstSent) {
        await supabase.from("activity_events").insert({
          user_id: invoicesForChase?.[0]?.user_id,
          type: "auto_chase_batch_complete",
          metadata: {
            remindersSent,
            remindersSkipped,
            errorCount: errors.length,
            durationMs: duration,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined, // Limit errors logged
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: invoicesForChase?.length || 0,
        remindersSent,
        remindersSkipped,
        errors: errors.length > 0 ? errors : undefined,
        durationMs: duration,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[auto-chase] Fatal error after ${duration}ms:`, error);

    return new Response(
      JSON.stringify({
        error: error.message,
        durationMs: duration,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Check if current time is within quiet hours (9 PM - 9 AM US approximate)
 */
function isQuietHours(): boolean {
  // Use UTC-5 as approximate US timezone
  const now = new Date();
  const utcHour = now.getUTCHours();
  const usHour = (utcHour - 5 + 24) % 24; // Approximate EST

  // Quiet hours: 9 PM (21) to 9 AM (9)
  return usHour >= QUIET_HOUR_START || usHour < QUIET_HOUR_END;
}

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
 * Generate chase message with SMS compliance
 * Production templates optimized for deliverability and payment conversion
 *
 * Rules:
 * - Under 240 characters
 * - No ALL CAPS, no emojis
 * - Include amount + link always
 * - STOP opt-out on attempt #1
 * - Use "balance due" not "overdue" until attempt 4-5
 */
function generateChaseMessage(
  clientName: string,
  remainingBalance: number,
  currency: string,
  paymentUrl: string,
  attemptNumber: number,
  isBalanceChase: boolean,
  invoiceNumber?: string
): string {
  const amount = formatCurrency(remainingBalance, currency);
  const firstName = clientName.split(" ")[0];
  const invNum = invoiceNumber || "";

  let message: string;

  if (isBalanceChase) {
    // Balance reminder after deposit paid - HIGH converting message
    if (attemptNumber === 1) {
      message = `Thanks ${firstName} — deposit received. The remaining balance of ${amount} is now due. Pay here: ${paymentUrl} Reply STOP to opt out.`;
    } else if (attemptNumber === 2) {
      message = `Hi ${firstName} — following up on your remaining balance of ${amount}. Pay here: ${paymentUrl}`;
    } else if (attemptNumber === 3) {
      message = `Hi ${firstName} — balance of ${amount} remains unpaid. Please take care of it here: ${paymentUrl}`;
    } else if (attemptNumber === 4) {
      message = `Hi ${firstName} — balance of ${amount} is still outstanding. Please pay today: ${paymentUrl}`;
    } else {
      message = `Hi ${firstName} — final reminder: ${amount} balance remaining. Please submit payment here: ${paymentUrl}`;
    }
  } else {
    // Standard chase for unpaid invoices
    if (attemptNumber === 1) {
      message = `Hi ${firstName} — quick reminder your invoice balance of ${amount} is still due. Pay here: ${paymentUrl} Reply STOP to opt out.`;
    } else if (attemptNumber === 2) {
      message = invNum
        ? `Hi ${firstName} — following up on invoice ${invNum}. Balance due: ${amount}. Pay here: ${paymentUrl}`
        : `Hi ${firstName} — following up on your invoice. Balance due: ${amount}. Pay here: ${paymentUrl}`;
    } else if (attemptNumber === 3) {
      message = invNum
        ? `Hi ${firstName} — invoice ${invNum} remains unpaid. Balance due: ${amount}. Please take care of it here: ${paymentUrl}`
        : `Hi ${firstName} — your invoice remains unpaid. Balance due: ${amount}. Please take care of it here: ${paymentUrl}`;
    } else if (attemptNumber === 4) {
      message = invNum
        ? `Hi ${firstName} — invoice ${invNum} is still outstanding. Balance due: ${amount}. Please pay today: ${paymentUrl}`
        : `Hi ${firstName} — your invoice is still outstanding. Balance due: ${amount}. Please pay today: ${paymentUrl}`;
    } else {
      message = invNum
        ? `Hi ${firstName} — final reminder: invoice ${invNum} has a remaining balance of ${amount}. Please submit payment here: ${paymentUrl}`
        : `Hi ${firstName} — final reminder: ${amount} is still outstanding. Please submit payment here: ${paymentUrl}`;
    }
  }

  return message;
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
