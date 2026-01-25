/**
 * Edge Function: auto-nudge
 * Automated SMS reminders for estimates awaiting deposit (PRO feature)
 * Auto-Nudge: Gently remind clients about pending estimates
 *
 * Nudge Schedule (when auto_nudge_enabled=true AND deposit not yet paid):
 * - +3 days after sent_at: nudge #1 (checking in)
 * - +7 days after sent_at: nudge #2 (ready to get started?)
 * - +14 days after sent_at: nudge #3 (still available)
 *
 * Key Differences from Auto-Chase:
 * - Softer, consultative tone (not urgent)
 * - Longer intervals (3d, 7d, 14d vs 1d, 3d, 6d...)
 * - Goal: Get approval/deposit, not collect payment
 * - Only 3 attempts max (vs 5 for chase)
 *
 * SMS Compliance:
 * - First message includes opt-out language
 * - Respects quiet hours (9 PM - 9 AM)
 * - Respects sms_opt_out flag
 *
 * Runs via Supabase cron (hourly):
 * SELECT cron.schedule('auto-nudge-hourly', '0 * * * *', $$
 *   SELECT net.http_post(
 *     url := 'https://your-project.supabase.co/functions/v1/auto-nudge',
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

// Nudge schedule thresholds in hours (softer, longer intervals)
const NUDGE_SCHEDULE = [
  { attempt: 1, hoursAfterSent: 72 },   // +3 days
  { attempt: 2, hoursAfterSent: 168 },  // +7 days
  { attempt: 3, hoursAfterSent: 336 },  // +14 days (max)
];

// Quiet hours: Don't send SMS between 9 PM and 9 AM (local time approximation using UTC-5 for US)
const QUIET_HOUR_START = 21; // 9 PM
const QUIET_HOUR_END = 9;    // 9 AM

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[auto-nudge] Starting execution...");

  try {
    // Check quiet hours (approximate US timezone)
    if (isQuietHours()) {
      console.log("[auto-nudge] Quiet hours active, skipping execution");
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

    // Get estimates eligible for nudge using the helper function
    const { data: estimatesForNudge, error: fetchError } = await supabase.rpc(
      "get_estimates_for_nudge"
    );

    if (fetchError) {
      console.error("[auto-nudge] Error fetching estimates:", fetchError);
      throw fetchError;
    }

    console.log(`[auto-nudge] Found ${estimatesForNudge?.length || 0} eligible estimates`);

    let nudgesSent = 0;
    let nudgesSkipped = 0;
    const errors: string[] = [];
    const sentDetails: Array<{ invoiceId: string; attempt: number; clientName: string }> = [];

    for (const estimate of estimatesForNudge || []) {
      try {
        const hoursSinceSent = Number(estimate.hours_since_sent);
        const nudgeCount = estimate.nudge_count;

        // Determine which nudge attempt this should be
        const nextAttempt = getNextAttempt(hoursSinceSent, nudgeCount);

        if (!nextAttempt) {
          // Not time for next nudge yet, or max reached
          nudgesSkipped++;
          continue;
        }

        // Try to insert nudge event (unique constraint prevents duplicates)
        const { error: insertError } = await supabase.from("nudge_events").insert({
          invoice_id: estimate.invoice_id,
          user_id: estimate.user_id,
          attempt_number: nextAttempt,
          channel: "sms",
          metadata: {
            hours_since_sent: hoursSinceSent,
            total: estimate.total,
            deposit_amount: estimate.deposit_amount,
            status: estimate.status,
          },
        });

        if (insertError) {
          // Unique constraint violation = already sent this nudge
          if (insertError.code === "23505") {
            nudgesSkipped++;
            continue;
          }
          throw insertError;
        }

        // Get the payment tracking URL
        const paymentUrl = `${SUPABASE_URL}/functions/v1/track-invoice-view?id=${estimate.tracking_id}`;

        // Generate message with compliance (opt-out on first message)
        const message = generateNudgeMessage(
          estimate.client_name,
          estimate.deposit_amount || estimate.total,
          estimate.currency,
          paymentUrl,
          nextAttempt
        );

        // Send SMS if Twilio configured and phone available
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && estimate.client_phone) {
          const smsResult = await sendTwilioSMS(estimate.client_phone, message);

          if (smsResult.success) {
            nudgesSent++;
            sentDetails.push({
              invoiceId: estimate.invoice_id,
              attempt: nextAttempt,
              clientName: estimate.client_name,
            });

            // Log activity event
            await supabase.from("activity_events").insert({
              user_id: estimate.user_id,
              type: "auto_nudge_sent",
              invoice_id: estimate.invoice_id,
              client_name: estimate.client_name,
              amount: estimate.deposit_amount || estimate.total,
              metadata: {
                attempt_number: nextAttempt,
                channel: "sms",
                message_id: smsResult.messageId,
              },
            });

            console.log(`[auto-nudge] Sent #${nextAttempt} to ${estimate.client_name} for estimate ${estimate.invoice_id}`);
          } else {
            const errorMsg = `SMS failed for estimate ${estimate.invoice_id}: ${smsResult.error}`;
            errors.push(errorMsg);
            console.error(`[auto-nudge] ${errorMsg}`);

            // Update nudge event with error
            await supabase
              .from("nudge_events")
              .update({
                metadata: {
                  hours_since_sent: hoursSinceSent,
                  total: estimate.total,
                  deposit_amount: estimate.deposit_amount,
                  error: smsResult.error,
                  failed_at: new Date().toISOString(),
                },
              })
              .eq("invoice_id", estimate.invoice_id)
              .eq("attempt_number", nextAttempt);
          }
        } else {
          console.log(`[auto-nudge] Skipping estimate ${estimate.invoice_id}: missing phone or Twilio config`);
          nudgesSkipped++;
        }
      } catch (estimateError: any) {
        const errorMsg = `Error processing estimate ${estimate.invoice_id}: ${estimateError.message}`;
        errors.push(errorMsg);
        console.error(`[auto-nudge] ${errorMsg}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[auto-nudge] Completed in ${duration}ms: ${nudgesSent} sent, ${nudgesSkipped} skipped, ${errors.length} errors`);

    // Log summary to activity_events for monitoring
    if (nudgesSent > 0 || errors.length > 0) {
      const firstSent = sentDetails[0];
      if (firstSent) {
        await supabase.from("activity_events").insert({
          user_id: estimatesForNudge?.[0]?.user_id,
          type: "auto_nudge_batch_complete",
          metadata: {
            nudgesSent,
            nudgesSkipped,
            errorCount: errors.length,
            durationMs: duration,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: estimatesForNudge?.length || 0,
        nudgesSent,
        nudgesSkipped,
        errors: errors.length > 0 ? errors : undefined,
        durationMs: duration,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[auto-nudge] Fatal error after ${duration}ms:`, error);

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
  const now = new Date();
  const utcHour = now.getUTCHours();
  const usHour = (utcHour - 5 + 24) % 24; // Approximate EST

  return usHour >= QUIET_HOUR_START || usHour < QUIET_HOUR_END;
}

/**
 * Determine the next nudge attempt number based on hours since sent
 */
function getNextAttempt(hoursSinceSent: number, currentNudgeCount: number): number | null {
  // Max 3 nudges
  if (currentNudgeCount >= 3) {
    return null;
  }

  const nextAttemptNumber = currentNudgeCount + 1;
  const schedule = NUDGE_SCHEDULE.find((s) => s.attempt === nextAttemptNumber);

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
 * Generate nudge message with SMS compliance
 * Soft, consultative tone - NOT payment collection
 *
 * Rules:
 * - Under 240 characters
 * - No ALL CAPS, no emojis
 * - Include amount + link always
 * - STOP opt-out on attempt #1
 * - Helpful, not pushy
 */
function generateNudgeMessage(
  clientName: string,
  amount: number,
  currency: string,
  paymentUrl: string,
  attemptNumber: number
): string {
  const formattedAmount = formatCurrency(amount, currency);
  const firstName = clientName.split(" ")[0];

  let message: string;

  switch (attemptNumber) {
    case 1:
      // Day 3: Checking in, any questions?
      message = `Hi ${firstName} — just checking in on your estimate for ${formattedAmount}. Any questions I can help with? View details: ${paymentUrl} Reply STOP to opt out.`;
      break;
    case 2:
      // Day 7: Ready to get started?
      message = `Hi ${firstName} — following up on your estimate. Ready to get started? Secure your spot with a deposit: ${paymentUrl}`;
      break;
    case 3:
      // Day 14: Still available, let me know
      message = `Hi ${firstName} — your estimate for ${formattedAmount} is still available. Let me know if anything's changed or if you'd like to move forward: ${paymentUrl}`;
      break;
    default:
      message = `Hi ${firstName} — just checking in on your estimate for ${formattedAmount}. View details: ${paymentUrl}`;
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
