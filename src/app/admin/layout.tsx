import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { AdminNotConfigured } from "@/components/admin/not-configured";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/supabase/authz";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "gauge", exact: true },
  { label: "Claims", href: "/admin/claims", icon: "claims" },
  { label: "Verifications", href: "/admin/verifications", icon: "verify" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Documents", href: "/admin/documents", icon: "documents" },
  { label: "Customer service", href: "/admin/support", icon: "support" },
  { label: "Case messages", href: "/admin/messages", icon: "messages" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // No database means no reviewer can be identified, so the console closes
  // rather than falling back to example records. Missing configuration must
  // never be a way past the authorisation check.
  if (!isSupabaseConfigured) return <AdminNotConfigured />;

  const [profile, access] = await Promise.all([getCurrentProfile(), getAdminAccess()]);

  // Authorisation is decided here, on the server, from the database role — and
  // enforced a second time by row level security on every query. Gating on the
  // same predicate the actions and RLS use means the sidebar can never say
  // ADMIN while every reviewer action is refused.
  if (!access.isAdmin) {
    redirect(access.userId ? "/dashboard" : "/admin-login");
  }

  return (
    <DashboardShell
      items={NAV}
      areaLabel="Administration"
      name={profile?.full_name ?? "Case Administrator"}
      email={profile?.email ?? "admin@getroyalrefund.com"}
      role={access.role ?? profile?.role ?? "user"}
    >
      {children}
    </DashboardShell>
  );
}
