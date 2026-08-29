import type { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create a secure RoyalRefund account to submit refund cases, upload evidence and follow every review stage.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
