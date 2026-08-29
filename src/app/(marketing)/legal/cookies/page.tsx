import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "The small number of cookies RoyalRefund sets and what each one does.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      updated="28 August 2019"
      intro="RoyalRefund sets the minimum needed to keep you signed in. There is no advertising and no cross-site tracking."
      sections={[
        {
          heading: "What is set",
          paragraphs: [
            "Signing in creates a session managed by Supabase Auth. It writes httpOnly cookies holding an access token and a refresh token, which the server reads on each request to identify you and renew the session before it expires.",
          ],
          bullets: [
            "Authentication cookies: keep you signed in and let protected routes verify the session. Removed when you sign out.",
            "No analytics cookies, no advertising cookies, and no third-party trackers are set by this application.",
          ],
        },
        {
          heading: "Why there is no cookie banner",
          paragraphs: [
            "Cookies that are strictly necessary to deliver a service the user explicitly asked for — here, staying signed in — do not require consent under the common interpretation of the ePrivacy rules. Because we set nothing beyond those, there is nothing to ask permission for. If we ever add analytics, consent handling will come first.",
          ],
        },
        {
          heading: "Controlling cookies",
          paragraphs: [
            "You can clear or block cookies in your browser settings. Blocking the authentication cookies will prevent sign-in from working, since the session cannot be maintained without them. The public case tracker works without signing in and therefore without them.",
          ],
        },
        {
          heading: "Local storage",
          paragraphs: [
            "The Supabase client may keep a copy of the session in browser storage on the device you sign in from. It never leaves that browser and is cleared on sign-out.",
          ],
        },
      ]}
    />
  );
}
