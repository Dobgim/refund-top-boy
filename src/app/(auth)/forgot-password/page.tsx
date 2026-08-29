import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/password-forms";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a single-use link to reset your RoyalRefund account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
