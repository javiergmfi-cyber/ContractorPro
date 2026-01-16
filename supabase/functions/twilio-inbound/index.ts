/**
 * Edge Function: twilio-inbound
 * Handles incoming SMS messages from Twilio (STOP opt-out handling)
 *
 * SMS Compliance (TCPA/FCC compliant):
 * - STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT → opt out = true
 * - START, YES → opt out = false (re-subscribe)
 *
 * IMPORTANT: STOP blocks ALL SMS from ContractorPro to this phone number.
 * This is the safest approach under TCPA/FCC rules - a consumer opt-out
 * revokes consent for all robotexts from that sender.
 *
 * After opt-out, contractor can still reach customer via:
 * - Email
 * - WhatsApp (separate consent)
 * - Manual phone call
 *
 * Configure in Twilio:
 * 1. Go to Phone Numbers → Your Number → Messaging
 * 2. Set "A MESSAGE COMES IN" webhook to:
 *    https://your-project.supabase.co/functions/v1/twilio-inbound
 *    Method: POST
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Opt-out keywords (case insensitive)
const OPT_OUT_KEYWORDS = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
const OPT_IN_KEYWORDS = ["START", "YES", "UNSTOP"];

serve(async (req) => {
  try {
    // Twilio sends form-urlencoded data
    const formData = await req.formData();

    const from = formData.get("From") as string; // Phone number
    const body = (formData.get("Body") as string || "").trim().toUpperCase();

    if (!from) {
      console.log("[twilio-inbound] No 'From' number in request");
      return new Response("OK", { status: 200 });
    }

    console.log(`[twilio-inbound] Received SMS from ${from}: "${body}"`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if this is an opt-out keyword
    if (OPT_OUT_KEYWORDS.includes(body)) {
      console.log(`[twilio-inbound] Processing OPT-OUT for ${from}`);

      // Use the database function to handle opt-out
      const { error } = await supabase.rpc("handle_sms_opt_out", {
        p_phone: from,
      });

      if (error) {
        console.error("[twilio-inbound] Error processing opt-out:", error);
        // Fall back to direct update
        await handleOptOutDirect(supabase, from, true);
      }

      // Log activity event
      await supabase.from("activity_events").insert({
        type: "sms_opt_out",
        metadata: {
          phone: from,
          keyword: body,
          action: "opt_out",
        },
      });

      // Return TwiML response (optional confirmation)
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been unsubscribed and will no longer receive text messages from this number.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
          status: 200,
        }
      );
    }

    // Check if this is an opt-in keyword (re-subscribe)
    if (OPT_IN_KEYWORDS.includes(body)) {
      console.log(`[twilio-inbound] Processing OPT-IN for ${from}`);

      await handleOptOutDirect(supabase, from, false);

      // Log activity event
      await supabase.from("activity_events").insert({
        type: "sms_opt_in",
        metadata: {
          phone: from,
          keyword: body,
          action: "opt_in",
        },
      });

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>You have been re-subscribed. You will receive payment reminders again.</Message>
</Response>`,
        {
          headers: { "Content-Type": "text/xml" },
          status: 200,
        }
      );
    }

    // Not an opt-out/opt-in keyword - just acknowledge
    console.log(`[twilio-inbound] Unrecognized message from ${from}: "${body}"`);

    // Return empty TwiML (no response to sender)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        headers: { "Content-Type": "text/xml" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[twilio-inbound] Error:", error);
    // Always return 200 to Twilio to prevent retries
    return new Response("OK", { status: 200 });
  }
});

/**
 * Direct opt-out handling (fallback if RPC not available)
 */
async function handleOptOutDirect(
  supabase: any,
  phone: string,
  optOut: boolean
) {
  // Normalize phone number for matching
  const normalizedPhone = normalizePhone(phone);
  const phoneVariants = [phone, normalizedPhone, `+1${normalizedPhone}`];

  // Update clients table
  await supabase
    .from("clients")
    .update({
      sms_opt_out: optOut,
      sms_opt_out_at: optOut ? new Date().toISOString() : null,
    })
    .or(phoneVariants.map((p) => `phone.eq.${p}`).join(","));

  // Update invoices table
  await supabase
    .from("invoices")
    .update({ client_sms_opt_out: optOut })
    .or(phoneVariants.map((p) => `client_phone.eq.${p}`).join(","));

  console.log(`[twilio-inbound] Updated opt-out=${optOut} for phone variants:`, phoneVariants);
}

/**
 * Normalize phone number (remove non-digits)
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^1/, ""); // Remove +1 prefix
}
