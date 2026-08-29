import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How RoyalRefund assesses a refund case and what each possible outcome means.",
  alternates: { canonical: "/legal/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="28 August 2026"
      intro="How a case is assessed, what makes one eligible, and what happens at each possible outcome."
      sections={[
        {
          heading: "Cases this platform accepts",
          paragraphs: [
            "The workflow is built for disputes where a payment was made and something identifiable went wrong with it.",
          ],
          bullets: [
            "A charge taken more than once for a single purchase.",
            "A subscription renewal taken after a cancellation inside the stated window.",
            "A service or item paid for and never delivered.",
            "A transaction the account holder does not recognise.",
            "A returned item where the agreed refund was never issued.",
          ],
        },
        {
          heading: "Cases this platform does not accept",
          paragraphs: [
            "Some disputes are outside what a case file can resolve. Buyer's remorse without a contractual right of return, disagreements about quality where the goods were delivered as described, and anything requiring a legal determination all fall outside scope. Where a case cannot be progressed, it is closed with the reason recorded.",
          ],
        },
        {
          heading: "How a case is assessed",
          paragraphs: [
            "A reviewer checks that the transaction details match the evidence, that the timeline is consistent, and that the outcome you are asking for follows from what happened. Missing evidence moves the case to Documents Required rather than closing it, so you get a chance to complete the file.",
          ],
        },
        {
          heading: "Possible outcomes",
          paragraphs: ["Every case ends in one of two terminal states, each with a written reason."],
          bullets: [
            "Approved then Resolved: the case met the criteria and the outcome has been recorded.",
            "Closed: the case could not be progressed, was withdrawn, or was resolved directly with the merchant.",
          ],
        },
        {
          heading: "Withdrawing a case",
          paragraphs: [
            "You can withdraw at any point by sending a message on the case asking for it to be closed. It moves to Closed and remains in your history as a read-only record, including everything you uploaded.",
          ],
        },
        {
          heading: "Fees",
          paragraphs: [
            "RoyalRefund charges nothing to open or review a case, holds no funds at any point, and takes no percentage of any recovered amount. Recovered funds are returned by the paying party directly to the account they came from.",
          ],
        },
      ]}
    />
  );
}
