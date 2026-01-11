import { ParsedInvoice } from "../types";

/**
 * MOCK: Transcribe audio to text
 * In production, this would call OpenAI Whisper API
 */
export async function transcribeAudio(uri: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // MOCK: Return dummy transcript
  return "Invoice for John Smith. Lawn mowing service, one hundred fifty dollars.";
}

/**
 * MOCK: Parse transcript into structured invoice data
 * In production, this would call OpenAI GPT API
 */
export async function parseInvoice(transcript: string): Promise<ParsedInvoice> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // MOCK: Return structured data based on transcript
  // In production, GPT would extract this from the transcript
  return {
    clientName: "John Smith",
    items: [
      {
        description: "Lawn mowing service",
        price: 150,
        quantity: 1,
      },
    ],
    detectedLanguage: "en",
  };
}

/**
 * MOCK: Generate invoice PDF
 * In production, this would create a formatted PDF
 */
export async function generateInvoicePDF(invoiceId: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // MOCK: Return a dummy URI
  return `file://invoice-${invoiceId}.pdf`;
}
