"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, DoorOpen, FileCheck2, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Profile Settings", href: "/dashboard/settings", icon: UserRound },
  { label: "Change Password", href: "/dashboard/settings/password", icon: KeyRound },
  { label: "Security Settings", href: "/dashboard/settings/security", icon: ShieldCheck },
  { label: "ID Verification", href: "/dashboard/verification", icon: FileCheck2 },
  { label: "All Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Account Closing", href: "/dashboard/settings/close", icon: DoorOpen },
];

/** Horizontal tab bar shared by every account-management page. */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account settings"
      className="rounded-card border border-ink-100 bg-white p-2 shadow-soft"
    >
      <ul className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors",
                  active
                    ? "bg-royal-600 text-white"
                    : "bg-royal-50 text-royal-800 hover:bg-royal-100",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
