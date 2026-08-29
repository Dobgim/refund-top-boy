import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/forms/password-forms";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your RoyalRefund account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
