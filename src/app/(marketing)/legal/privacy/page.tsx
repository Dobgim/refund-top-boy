import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What RoyalRefund collects, why it collects it, and how long it is kept.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="28 August 2019"
      intro="A plain description of the data this platform holds, why it needs it, and the controls around it."
      sections={[
        {
          heading: "What we collect",
          paragraphs: [
            "Only what a refund case needs. Account data comes from registration; case data comes from the form you fill in and the files you attach.",
          ],
          bullets: [
            "Account: full name, email address, country, and the role and status of the account.",
            "Case: transaction date, amount, currency, payment method, any reference number, and your description of what went wrong.",
            "Evidence: the documents you choose to upload, with their file name, type and size.",
            "Activity: timestamps for status changes and messages, so the case history is auditable.",
          ],
        },
        {
          heading: "What we never ask for",
          paragraphs: [
            "RoyalRefund does not request, store or transmit banking passwords, card PINs, full card numbers, one-time codes, seed phrases or private keys. No field in the product accepts them, and no member of a support team will ever ask for one.",
          ],
        },
        {
          heading: "How your data is protected",
          paragraphs: [
            "Data is held in a managed Postgres database with row level security enabled on every table, so an authenticated request can only reach rows the account owns. Documents are stored in a private bucket partitioned by user id and are served through short-lived signed URLs rather than public links. Traffic is encrypted in transit and the provider encrypts data at rest.",
          ],
        },
        {
          heading: "Who can see your case",
          paragraphs: [
            "You, and reviewers holding the administrator role. Administrative access is decided server-side from the database role and enforced again by database policy, so a client-side change cannot grant it. Every administrative status change is written to an activity log.",
          ],
        },
        {
          heading: "The public tracker",
          paragraphs: [
            "The tracker at /track deliberately returns a narrow view: the reference, the case type, the stage, the submission date and the status history. It never returns amounts, contact details, documents or messages, so sharing a reference does not expose personal information.",
          ],
        },
        {
          heading: "Retention and deletion",
          paragraphs: [
            `Case records are kept while the case is open and for a period afterwards so the history remains auditable. You can request deletion of your profile, cases, documents and messages at any time by writing to ${SITE.supportEmail} from the address on the account.`,
          ],
        },
      ]}
    />
  );
}
