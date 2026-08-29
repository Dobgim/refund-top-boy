import type { Metadata } from "next";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { DemoBanner } from "@/components/dashboard/common";
import { getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your RoyalRefund case portal.",
  robots: { index: false, follow: false },
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard", exact: true },
  { label: "My Claims", href: "/dashboard/claims", icon: "claims" },
  { label: "Start a Claim", href: "/dashboard/claims/new", icon: "newClaim" },
  { label: "Track a Case", href: "/track", icon: "track" },
  { label: "Help Center", href: "/faq", icon: "help" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const demo = !isSupabaseConfigured;

  const nav: NavItem[] =
    profile?.role === "admin"
      ? [...NAV, { label: "Admin", href: "/admin", icon: "admin" }]
      : NAV;

  return (
    <DashboardShell
      items={nav}
      areaLabel="Case portal"
      name={profile?.full_name ?? "Amara Osei"}
      email={profile?.email ?? "amara.osei@example.com"}
      role={profile?.role ?? "user"}
      banner={demo ? <DemoBanner /> : null}
    >
      {children}
    </DashboardShell>
  );
}
