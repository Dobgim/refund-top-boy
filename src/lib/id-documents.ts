import type { IdDocumentType } from "@/lib/verification";

export interface DocumentSpec {
  type: IdDocumentType;
  /** What the document is actually called in that country. */
  label: string;
  /** 1 for a passport-style booklet, 2 for anything card-shaped. */
  sides: 1 | 2;
  hint?: string;
}

const PASSPORT: DocumentSpec = {
  type: "passport",
  label: "Passport",
  sides: 1,
  hint: "The photo page, showing the two machine-readable lines at the bottom.",
};

const LICENCE = (label = "Driving licence"): DocumentSpec => ({
  type: "drivers_licence",
  label,
  sides: 2,
  hint: "Both sides of the card.",
});

const NATIONAL = (label: string, hint?: string): DocumentSpec => ({
  type: "national_id",
  label,
  sides: 2,
  hint: hint ?? "Both sides of the card.",
});

const PERMIT = (label = "Residence permit"): DocumentSpec => ({
  type: "residence_permit",
  label,
  sides: 2,
  hint: "Both sides of the permit card.",
});

/**
 * Which identity documents each country actually issues, and how many sides
 * each has.
 *
 * This is not cosmetic. Several countries have no national identity card at
 * all — offering one to a British or Australian customer sends them looking for
 * a document that does not exist. A passport needs only its photo page, while
 * every card-shaped document needs both sides, so the number of uploads asked
 * for follows from the document chosen, not from a fixed guess.
 */
export const COUNTRY_DOCUMENTS: Record<string, DocumentSpec[]> = {
  Australia: [PASSPORT, LICENCE("Driver licence"), PERMIT("Immicard")],
  Belgium: [PASSPORT, NATIONAL("eID card"), LICENCE(), PERMIT()],
  Cameroon: [PASSPORT, NATIONAL("Carte nationale d'identité"), LICENCE(), { type: "national_id", label: "Voter's card", sides: 2 }],
  Canada: [PASSPORT, LICENCE("Driver's licence"), PERMIT("PR card")],
  Denmark: [PASSPORT, LICENCE(), PERMIT()],
  France: [PASSPORT, NATIONAL("Carte nationale d'identité"), LICENCE(), PERMIT("Titre de séjour")],
  Germany: [PASSPORT, NATIONAL("Personalausweis"), LICENCE(), PERMIT("Aufenthaltstitel")],
  Ghana: [PASSPORT, NATIONAL("Ghana Card"), LICENCE(), { type: "national_id", label: "Voter ID card", sides: 2 }],
  Ireland: [PASSPORT, LICENCE(), PERMIT("Irish Residence Permit")],
  Italy: [PASSPORT, NATIONAL("Carta d'identità"), LICENCE(), PERMIT("Permesso di soggiorno")],
  Kenya: [PASSPORT, NATIONAL("Huduma / National ID"), LICENCE()],
  Netherlands: [PASSPORT, NATIONAL("Identiteitskaart"), LICENCE(), PERMIT()],
  "New Zealand": [PASSPORT, LICENCE("Driver licence"), PERMIT()],
  Nigeria: [PASSPORT, NATIONAL("NIN slip / National ID card"), LICENCE(), { type: "national_id", label: "Voter's card (PVC)", sides: 2 }],
  Norway: [PASSPORT, NATIONAL("Nasjonalt ID-kort"), LICENCE()],
  Portugal: [PASSPORT, NATIONAL("Cartão de cidadão"), LICENCE(), PERMIT()],
  "South Africa": [PASSPORT, NATIONAL("Smart ID card"), LICENCE()],
  Spain: [PASSPORT, NATIONAL("DNI"), LICENCE(), PERMIT("TIE / NIE card")],
  Sweden: [PASSPORT, NATIONAL("Nationellt ID-kort"), LICENCE()],
  Switzerland: [PASSPORT, NATIONAL("Identitätskarte"), LICENCE(), PERMIT("Permit B / C")],
  "United Arab Emirates": [PASSPORT, NATIONAL("Emirates ID"), LICENCE()],
  // No national identity card exists in the UK or the US.
  "United Kingdom": [PASSPORT, LICENCE("Photocard driving licence"), PERMIT("Biometric residence permit")],
  "United States": [
    PASSPORT,
    LICENCE("Driver's license"),
    NATIONAL("State ID card"),
    PERMIT("Green card"),
  ],
};

const FALLBACK: DocumentSpec[] = [PASSPORT, NATIONAL("National ID card"), LICENCE(), PERMIT()];

/** Documents available to a customer, based on the country on their profile. */
export function documentsForCountry(country: string | null | undefined): DocumentSpec[] {
  if (!country) return FALLBACK;
  return COUNTRY_DOCUMENTS[country] ?? FALLBACK;
}

/** Looks a spec up by the value the select posted. */
export function findSpec(country: string | null | undefined, key: string): DocumentSpec | undefined {
  return documentsForCountry(country).find((spec) => specKey(spec) === key);
}

/**
 * A country can offer two documents backed by the same enum value — Nigeria
 * lists both a national ID card and a voter's card — so the select is keyed by
 * type and label together.
 */
export function specKey(spec: DocumentSpec): string {
  return `${spec.type}::${spec.label}`;
}
