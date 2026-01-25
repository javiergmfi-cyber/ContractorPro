/**
 * AI Service
 * Handles voice transcription and invoice parsing
 * Per architecture-spec.md - Uses Supabase Edge Functions
 */

import { supabase } from "./supabase";
import { ParsedInvoice } from "@/store/useInvoiceStore";
import { AIParseResult } from "@/types";
import * as db from "./database";

// Environment check for development mode
const isDevelopment = __DEV__;

/**
 * Process voice recording through AI pipeline
 * 1. Upload audio to Supabase Storage
 * 2. Call Edge Function for transcription + parsing
 * 3. Return structured invoice data
 */
export async function processVoiceToInvoice(
  audioUri: string
): Promise<{
  parsedInvoice: ParsedInvoice;
  voiceNoteId: string;
  confidence: number;
}> {
  try {
    // 1. Upload audio file to storage
    const fileName = `recording-${Date.now()}.m4a`;
    const storagePath = await db.uploadVoiceNote(audioUri, fileName);

    if (!storagePath) {
      throw new Error("Failed to upload audio file");
    }

    // 2. Create voice note record
    const voiceNote = await db.createVoiceNote({
      storage_path: storagePath,
      processing_status: "processing",
    });

    if (!voiceNote) {
      throw new Error("Failed to create voice note record");
    }

    // 3. Call Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke<AIParseResult>(
      "transcribe-and-parse",
      {
        body: {
          voice_note_id: voiceNote.id,
          storage_path: storagePath,
        },
      }
    );

    if (error) {
      // Log detailed error info
      console.error("Edge Function error details:", {
        message: error.message,
        context: error.context,
        name: error.name,
      });

      // Update voice note status to failed
      await db.updateVoiceNote(voiceNote.id, {
        processing_status: "failed",
      });
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from AI processing");
    }

    // 4. Update voice note with results
    await db.updateVoiceNote(voiceNote.id, {
      transcript: data.notes || "",
      detected_language: data.meta.language_detected,
      confidence_score: data.meta.confidence,
      processing_status: "completed",
    });

    // 5. Convert AI result to ParsedInvoice format
    const parsedInvoice: ParsedInvoice = {
      clientName: data.client.name || "Unknown Client",
      clientEmail: undefined,
      clientPhone: data.client.contact_inferred || undefined,
      items: data.line_items.map((item) => ({
        description: item.description,
        price: item.unit_price / 100, // Convert from cents to dollars for display
        quantity: item.quantity,
        originalTranscriptSegment: item.original_transcript_segment,
      })),
      detectedLanguage: data.meta.language_detected,
      confidence: data.meta.confidence,
      notes: data.notes || undefined,
    };

    return {
      parsedInvoice,
      voiceNoteId: voiceNote.id,
      confidence: data.meta.confidence,
    };
  } catch (error) {
    console.error("Error processing voice to invoice:", error);

    // In development, fall back to mock data on error
    if (isDevelopment) {
      console.warn("Falling back to mock data due to error:", error);
      return getMockParseResult();
    }

    throw error;
  }
}

/**
 * Transcribe audio only (without parsing)
 * Useful for manual review workflows
 */
export async function transcribeAudio(audioUri: string): Promise<string> {
  if (isDevelopment) {
    // Mock transcription for development
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "Invoice for John Smith. Lawn mowing service, one hundred fifty dollars.";
  }

  // Upload and get transcription via Edge Function
  const fileName = `recording-${Date.now()}.m4a`;
  const storagePath = await db.uploadVoiceNote(audioUri, fileName);

  if (!storagePath) {
    throw new Error("Failed to upload audio file");
  }

  const { data, error } = await supabase.functions.invoke<{ transcript: string }>(
    "transcribe-only",
    {
      body: { storage_path: storagePath },
    }
  );

  if (error) throw error;
  return data?.transcript || "";
}

/**
 * Parse transcript into invoice (without transcription step)
 * Useful when editing or re-processing text
 */
export async function parseTranscript(
  transcript: string,
  language?: string
): Promise<ParsedInvoice> {
  if (isDevelopment) {
    // Mock parsing for development
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      clientName: "John Smith",
      items: [{ description: "Lawn mowing service", price: 150, quantity: 1 }],
      detectedLanguage: language || "en",
    };
  }

  const { data, error } = await supabase.functions.invoke<AIParseResult>(
    "parse-transcript",
    {
      body: { transcript, language },
    }
  );

  if (error) throw error;

  if (!data) {
    throw new Error("No data returned from parsing");
  }

  return {
    clientName: data.client.name || "Unknown Client",
    items: data.line_items.map((item) => ({
      description: item.description,
      price: item.unit_price / 100,
      quantity: item.quantity,
      originalTranscriptSegment: item.original_transcript_segment,
    })),
    detectedLanguage: data.meta.language_detected,
    confidence: data.meta.confidence,
    notes: data.notes || undefined,
  };
}

/**
 * Mock data for development/testing
 */
function getMockParseResult(): {
  parsedInvoice: ParsedInvoice;
  voiceNoteId: string;
  confidence: number;
} {
  return {
    parsedInvoice: {
      clientName: "John Smith",
      clientEmail: "john@example.com",
      items: [
        {
          description: "Lawn mowing service",
          price: 150,
          quantity: 1,
          originalTranscriptSegment: "Lawn mowing service, one hundred fifty dollars",
        },
      ],
      detectedLanguage: "en",
      confidence: 0.95,
    },
    voiceNoteId: "mock-voice-note-id",
    confidence: 0.95,
  };
}

/**
 * Generate invoice PDF via Edge Function
 */
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  if (isDevelopment) {
    // Mock PDF generation for development
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `https://example.com/invoice-${invoiceId}.pdf`;
  }

  const { data, error } = await supabase.functions.invoke<{ pdf_url: string }>(
    "generate-invoice-pdf",
    {
      body: { invoice_id: invoiceId },
    }
  );

  if (error) throw error;
  return data?.pdf_url || "";
}
