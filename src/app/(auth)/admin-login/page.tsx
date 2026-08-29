import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export const metadata: Metadata = {
  title: "Administrator sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
