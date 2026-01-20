import { CURRENCY_SYMBOL } from "./constants";

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count).padStart(4, "0")}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Construct Google My Business review URL from Place ID
 * Per HYBRID_SPEC.md Phase 4: Instant Reputation Loop
 *
 * @param googlePlaceId - The Google Place ID (e.g., ChIJN1t_tDeuEmsRUsoyG83frY4)
 * @returns URL that opens Google Maps with review prompt
 */
export function constructGMBReviewUrl(googlePlaceId: string): string {
  // Direct link to Google Maps review page
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(googlePlaceId)}`;
}

/**
 * Fallback: Construct Google search URL for business reviews
 * Used when no Google Place ID is configured
 *
 * @param businessName - The business name to search for
 * @returns URL that opens Google search for the business reviews
 */
export function constructGMBSearchFallback(businessName: string): string {
  const query = encodeURIComponent(`${businessName} reviews`);
  return `https://www.google.com/search?q=${query}`;
}
