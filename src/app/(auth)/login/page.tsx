import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import { Spinner } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the RoyalRefund case portal to review your refund and dispute cases.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-40 place-items-center"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
