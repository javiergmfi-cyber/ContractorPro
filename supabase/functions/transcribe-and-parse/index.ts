/**
 * Edge Function: transcribe-and-parse
 * Universal Translator for voice-to-invoice processing
 * Per architecture-spec.md Section 2.2
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// OpenAI API configuration
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_URL = "https://api.openai.com/v1";

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Universal Translator System Prompt
 * Per architecture-spec.md Section 2.2.2
 */
function getSystemPrompt(glossaryTerms: string, userTrade: string, currentDate: string): string {
  return `# Role
You are "ContractorAI," a senior construction administrator and linguistic expert specialized in the invoicing workflows of independent contractors. You possess deep knowledge of construction terminology in English, Spanish, and Portuguese, including regional dialects, slang, and "Spanglish/Portuñol" hybridizations (e.g., "rufa" for roof, "trozas" for trusses, "chirok" for sheetrock).

# Objective
Your task is to analyze a raw audio transcript provided by a contractor and extract structured financial data to generate a valid Invoice or Quote. You must normalize all colloquial terms into professional English suitable for a formal business document.

# Input Context
* The input is a raw transcript from OpenAI Whisper.
* It may contain background noise artifacts, hesitation markers ("um," "uh"), and non-standard grammar.
* The speaker may switch languages mid-sentence (Code-Switching).
* Current Date: ${currentDate}
* User Trade: ${userTrade || "General Contractor"}

# Construction Glossary Reference
${glossaryTerms}

# Critical Rules & Logic

1. **Intent Detection**: Determine if the user is describing completed work ("INVOICE") or future work ("QUOTE"). Look for temporal markers (past tense vs. future tense/conditional). If ambiguous, default to "INVOICE" but flag low confidence.

2. **Linguistic Normalization**:
   * Identify "Spanglish" or "Portuñol" terms and translate them to their Standard English professional equivalents.
   * Example: Input "Instalamos la carpeta en el master bedroom" -> Output Description "Carpet Installation - Master Bedroom"
   * Example: Input "Fixeamos la liqueo" -> Output Description "Leak Repair"
   * Example: Input "Consertamos o telhado" -> Output Description "Roof Repair"

3. **Entity Extraction**:
   * Extract quantity, unit, unit_price, and total.
   * If a total is mentioned that contradicts (quantity * unit_price), trust the unit calculation but add a warning flag.
   * If no price is mentioned, mark unit_price as 0 and requires_review as true.
   * Extract client name if mentioned.

4. **Currency Logic**: Default to USD unless specific currency markers (Pesos, Reais, €) are present.

5. **Output Format**: You must output ONLY valid JSON adhering to the schema below. Do not output conversational text.

# JSON Output Schema
{
  "meta": {
    "intent": "INVOICE" | "QUOTE",
    "confidence": <number between 0 and 1>,
    "language_detected": "<string: en, es, pt, or mixed>",
    "currency": "USD" | "BRL" | "MXN" | "EUR"
  },
  "client": {
    "name": "<string or null>",
    "contact_inferred": "<string or null - phone/email if mentioned>"
  },
  "line_items": [
    {
      "description": "<Professional English description>",
      "quantity": <number>,
      "unit_price": <number in cents>,
      "total": <number in cents>,
      "original_transcript_segment": "<exact substring from transcript>",
      "requires_review": <boolean>
    }
  ],
  "notes": "<Any specialized instructions or context found in transcript>"
}`;
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.m4a");
  formData.append("model", "whisper-1");
  // Let Whisper auto-detect language for code-switching support
  formData.append("response_format", "text");

  const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${error}`);
  }

  return await response.text();
}

/**
 * Parse transcript using GPT-4o with Universal Translator prompt
 */
async function parseTranscript(
  transcript: string,
  systemPrompt: string
): Promise<any> {
  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent parsing
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GPT-4o API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No content returned from GPT-4o");
  }

  return JSON.parse(content);
}

/**
 * Fetch glossary terms from database
 */
async function getGlossaryTerms(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("glossary_terms")
    .select("term, standard_english, category")
    .limit(200);

  if (error || !data) {
    console.error("Error fetching glossary:", error);
    return "No glossary available.";
  }

  // Format glossary for prompt injection
  const grouped = data.reduce((acc: any, term: any) => {
    const category = term.category || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(`"${term.term}" -> ${term.standard_english}`);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, terms]) => `## ${category}\n${(terms as string[]).join("\n")}`)
    .join("\n\n");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API key
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { voice_note_id, storage_path } = await req.json();

    if (!storage_path) {
      throw new Error("storage_path is required");
    }

    // 1. Fetch audio file from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from("voice-evidence")
      .download(storage_path);

    if (downloadError || !audioData) {
      throw new Error(`Failed to download audio: ${downloadError?.message}`);
    }

    // 2. Transcribe audio with Whisper
    console.log("Transcribing audio...");
    const transcript = await transcribeAudio(audioData);
    console.log("Transcript:", transcript);

    // 3. Fetch glossary terms
    const glossaryTerms = await getGlossaryTerms(supabase);

    // 4. Get user profile for trade info (optional)
    let userTrade = "General Contractor";
    // Could fetch from profiles table if needed

    // 5. Build system prompt
    const currentDate = new Date().toISOString().split("T")[0];
    const systemPrompt = getSystemPrompt(glossaryTerms, userTrade, currentDate);

    // 6. Parse transcript with GPT-4o
    console.log("Parsing with GPT-4o...");
    const parseResult = await parseTranscript(transcript, systemPrompt);
    console.log("Parse result:", JSON.stringify(parseResult, null, 2));

    // 7. Update voice note record with transcript
    if (voice_note_id) {
      await supabase
        .from("voice_notes")
        .update({
          transcript,
          detected_language: parseResult.meta?.language_detected || "en",
          confidence_score: parseResult.meta?.confidence || 0,
          processing_status: "completed",
        })
        .eq("id", voice_note_id);
    }

    // Return parsed result
    return new Response(JSON.stringify(parseResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in transcribe-and-parse:", error);

    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
