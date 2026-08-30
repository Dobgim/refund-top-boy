import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { DemoBanner } from "@/components/dashboard/common";
import { getCurrentProfile } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your RoyalRefund case portal.",
  robots: { index: false, follow: false },
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "dashboard", exact: true },
  { label: "My Claims", href: "/dashboard/claims", icon: "claims" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "bell" },
  { label: "Start a Claim", href: "/dashboard/claims/new", icon: "newClaim" },
  { label: "Verification", href: "/dashboard/verification", icon: "verify" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
  { label: "Track a Case", href: "/track", icon: "track" },
  { label: "Help Center", href: "/faq", icon: "help" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, unread] = await Promise.all([
    getCurrentProfile(),
    getUnreadNotificationCount(),
  ]);
  const demo = !isSupabaseConfigured;

  // Reviewers do not file claims. Send them to their own area rather than
  // showing them a customer portal with a "Start a Claim" button in it.
  if (profile?.role === "admin") redirect("/admin");

  const withBadge: NavItem[] = NAV.map((item) =>
    item.href === "/dashboard/notifications" ? { ...item, badge: unread } : item,
  );

  const nav: NavItem[] = withBadge;

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
