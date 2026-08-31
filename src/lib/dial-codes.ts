/**
 * International dialling codes for the countries the sign-up form offers.
 *
 * Kept alongside the country list rather than pulled from a library: the list
 * is short, fixed, and a whole phone-number package would be several hundred
 * kilobytes shipped to the browser for twenty-three entries.
 */
export const DIAL_CODES: Record<string, string> = {
  Australia: "+61",
  Belgium: "+32",
  Cameroon: "+237",
  Canada: "+1",
  Denmark: "+45",
  France: "+33",
  Germany: "+49",
  Ghana: "+233",
  Ireland: "+353",
  Italy: "+39",
  Kenya: "+254",
  Netherlands: "+31",
  "New Zealand": "+64",
  Nigeria: "+234",
  Norway: "+47",
  Portugal: "+351",
  "South Africa": "+27",
  Spain: "+34",
  Sweden: "+46",
  Switzerland: "+41",
  "United Arab Emirates": "+971",
  "United Kingdom": "+44",
  "United States": "+1",
};

/** Null for "Other", where the country is unknown and the code cannot be guessed. */
export function dialCodeFor(country: string | null | undefined): string | null {
  if (!country) return null;
  return DIAL_CODES[country] ?? null;
}

/**
 * Joins a dialling code and a locally-typed number into one E.164 string.
 *
 * Most people type their number the way they would dial it at home, which in
 * many countries means a leading trunk zero — 0712 345 678. That zero is
 * dropped when dialling internationally, so keeping it would store a number
 * that cannot be called. Spaces, dashes and brackets go the same way.
 */
export function toE164(country: string | null | undefined, entered: string): string {
  const digits = entered.replace(/[^\d]/g, "").replace(/^0+/, "");
  const code = dialCodeFor(country);

  if (!code) {
    // "Other": the visitor types the full international number themselves.
    const raw = entered.replace(/[^\d+]/g, "");
    return raw.startsWith("+") ? raw : `+${digits}`;
  }

  return `${code}${digits}`;
}

/** Digits only, ignoring the country code, for length checks. */
export function nationalDigits(entered: string): string {
  return entered.replace(/[^\d]/g, "").replace(/^0+/, "");
}
