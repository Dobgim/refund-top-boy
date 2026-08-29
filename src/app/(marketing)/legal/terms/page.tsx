import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply to using RoyalRefund.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updated="28 August 2026"
      intro="What you can expect from this platform, and what it expects from you."
      sections={[
        {
          heading: "What this service is",
          paragraphs: [
            "RoyalRefund is a case management service for refund and payment dispute submissions. It organises information and evidence and tracks the state of a review. It is not a bank, a payment institution, a debt collector or a regulated recovery service, and it does not hold or move your funds.",
          ],
        },
        {
          heading: "Your account",
          paragraphs: [
            "You are responsible for keeping your password private and for activity that happens under your account. Use an address you control, and tell us promptly if you believe someone else has access.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: ["An account may be suspended where it is used to do any of the following."],
          bullets: [
            "Submit a case that is knowingly false, exaggerated or fabricated.",
            "Upload material you do not have the right to share, or that contains another person's credentials.",
            "Attempt to access cases, documents or accounts that are not yours.",
            "Probe, scrape or disrupt the service, or circumvent its access controls.",
          ],
        },
        {
          heading: "Accuracy of what you submit",
          paragraphs: [
            "A case is only as good as the information in it. You confirm that what you submit is accurate to the best of your knowledge, and that documents you attach are genuine and unaltered. Reviews rely on this.",
          ],
        },
        {
          heading: "No outcome is guaranteed",
          paragraphs: [
            "Submitting a case does not entitle you to a refund. A review may conclude that a case cannot be progressed, and the reasoning is recorded on the case. Nothing on this site should be read as a promise of recovery.",
          ],
        },
        {
          heading: "Availability",
          paragraphs: [
            "The service is provided as is, without warranty of uninterrupted availability. Features may change, and planned maintenance may take the platform offline for short periods.",
          ],
        },
        {
          heading: "Ending your use",
          paragraphs: [
            "You can stop using the platform and request deletion of your data at any time. We may close an account that breaches these terms, and will say why where it is appropriate to do so.",
          ],
        },
      ]}
    />
  );
}
