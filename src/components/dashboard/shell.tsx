"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  FilePlus2,
  FileStack,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessagesSquare,
  Radar,
  ReceiptText,
  Bell,
  BadgeCheck,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { EASE_OUT } from "@/lib/animations/variants";
import { initialsOf, cn } from "@/lib/utils";

/**
 * Icons are addressed by name because nav items cross the server/client
 * boundary, and a component reference is not serialisable.
 */
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  claims: ReceiptText,
  newClaim: FilePlus2,
  track: Radar,
  help: LifeBuoy,
  admin: ShieldCheck,
  gauge: Gauge,
  users: Users,
  documents: FileStack,
  messages: MessagesSquare,
  bell: Bell,
  verify: BadgeCheck,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
  exact?: boolean;
  /** Rendered as a small count pill on the right of the item. */
  badge?: number;
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = NAV_ICONS[item.icon];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-royal-600 text-white shadow-[0_8px_20px_-12px_rgb(79_70_229/0.9)]"
                  : "text-ink-600 hover:bg-ink-100/70 hover:text-ink-950",
              )}
            >
              <Icon aria-hidden className={cn("size-4.5 shrink-0", active ? "text-white" : "text-ink-400 group-hover:text-royal-600")} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-[0.65rem] font-extrabold",
                    active ? "bg-white/20 text-white" : "bg-royal-600 text-white",
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                  <span className="sr-only"> unread</span>
                </span>
              ) : (
                active && <ChevronRight aria-hidden className="size-4 opacity-70" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserCard({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-royal-600 font-display text-xs font-extrabold text-white">
        {initialsOf(name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink-950">{name}</span>
        <span className="block truncate text-xs text-ink-400">{email}</span>
      </span>
      <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.6rem] font-bold tracking-wide text-ink-600 uppercase">
        {role}
      </span>
    </div>
  );
}

export function DashboardShell({
  items,
  name,
  email,
  role,
  areaLabel,
  banner,
  children,
}: {
  items: NavItem[];
  name: string;
  email: string;
  role: string;
  areaLabel: string;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [renderedPath, setRenderedPath] = useState(pathname);

  // Close the drawer when the route changes, adjusting state during render
  // rather than in an effect so there is no extra commit.
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="flex items-center justify-between">
        <Logo />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </div>

      <span className="rounded-full bg-ink-950 px-3 py-1 text-center text-[0.6rem] font-bold tracking-[0.16em] text-gold-300 uppercase">
        {areaLabel}
      </span>

      <nav aria-label={areaLabel} className="flex-1 overflow-y-auto">
        <NavList items={items} onNavigate={onNavigate} />
      </nav>

      <div className="space-y-3">
        <UserCard name={name} email={email} role={role} />
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut aria-hidden className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh border-r border-ink-100 bg-white lg:block">
        {sidebar()}
      </aside>

      {/* mobile bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-100 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-xl border border-ink-200 text-ink-700"
        >
          <Menu aria-hidden className="size-5" />
        </button>
        <Logo />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink-950/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="absolute inset-y-0 left-0 w-[17.5rem] max-w-[85vw] bg-white shadow-lift"
            >
              {sidebar(() => setOpen(false))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-w-0">
        {banner}
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
