import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { DemoBanner } from "@/components/dashboard/common";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "gauge", exact: true },
  { label: "Claims", href: "/admin/claims", icon: "claims" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Documents", href: "/admin/documents", icon: "documents" },
  { label: "Messages", href: "/admin/messages", icon: "messages" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const demo = !isSupabaseConfigured;
  const profile = await getCurrentProfile();

  // Authorisation is decided here, on the server, from the database role — and
  // enforced a second time by row level security on every query.
  if (!demo && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      items={NAV}
      areaLabel="Administration"
      name={profile?.full_name ?? "Case Administrator"}
      email={profile?.email ?? "admin@royalrefund.com"}
      role={profile?.role ?? "admin"}
      banner={
        demo ? (
          <DemoBanner>
            <strong className="font-bold">Preview mode.</strong> The database is not connected on this
            deployment, so the admin area is showing example records and role checks cannot be enforced.
            Connect a project to see authorisation take effect.
          </DemoBanner>
        ) : null
      }
    >
      {children}
    </DashboardShell>
  );
}
