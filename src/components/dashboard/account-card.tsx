import Link from "next/link";
import { ArrowUpRight, Eye, Send, Wallet } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BankAccount } from "@/lib/queries";

function Chip() {
  return (
    <svg viewBox="0 0 40 30" aria-hidden className="h-7 w-9">
      <rect width="40" height="30" rx="5" fill="#e3ac3c" />
      <rect x="3" y="3" width="34" height="24" rx="3" fill="#f2c866" />
      <path
        d="M14 3v24M26 3v24M3 11h34M3 19h34"
        stroke="#c08c26"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The customer's account, drawn as a real card.
 *
 * The account number is grouped in fours so it reads like a card number, but it
 * is the actual account identifier people transfer to — not a decorative
 * masked number, which would be worse than useless on a page whose whole job is
 * to tell you where to send money.
 */
export function AccountCard({
  account,
  holder,
}: {
  account: BankAccount | null;
  holder: string;
}) {
  if (!account) {
    return (
      <div className="rounded-card border border-dashed border-ink-200 bg-white p-6 text-center">
        <p className="text-sm text-ink-500">
          Your account is being opened. Refresh in a moment.
        </p>
      </div>
    );
  }

  const grouped = account.account_number.replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* the card face */}
      <div className="relative aspect-[1.58/1] overflow-hidden rounded-[1.4rem] bg-ink-950 p-6 text-white shadow-lift">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-royal-600/35 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-royal-700/25 blur-2xl"
        />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <Chip />
            <div className="flex items-center gap-1.5">
              <LogoMark className="size-6" />
              <span className="font-display text-sm font-extrabold tracking-tight">
                RoyalRefund
              </span>
            </div>
          </div>

          <div>
            <p className="text-[0.62rem] font-bold tracking-[0.18em] text-white/50 uppercase">
              Available balance
            </p>
            <p className="mt-1 font-display text-3xl leading-none font-extrabold tracking-tight">
              {formatCurrency(account.balance, account.currency)}
            </p>
          </div>

          <div>
            <p className="font-mono text-[0.95rem] tracking-[0.16em] text-white/85">{grouped}</p>
            <div className="mt-2.5 flex items-end justify-between gap-4">
              <span className="truncate text-xs font-semibold text-white/70">{holder}</span>
              <span className="font-mono text-[0.65rem] whitespace-nowrap text-white/50">
                SINCE {formatDate(account.created_at).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* quick actions beside it */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {[
          { href: "/dashboard/transfer", label: "Send money", icon: Send },
          { href: "/dashboard/withdraw", label: "Withdraw", icon: ArrowUpRight },
          { href: "/dashboard/transactions", label: "Transactions", icon: Eye },
          { href: "/dashboard/pay-bill", label: "Pay a bill", icon: Wallet },
          { href: "/dashboard/savings", label: "Savings (DPS)", icon: Wallet },
          { href: "/dashboard/deposits", label: "Fixed deposit", icon: Wallet },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col justify-between rounded-card border border-ink-100 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-royal-200 hover:shadow-lift"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-royal-50 text-royal-600 ring-1 ring-royal-100 ring-inset transition-transform duration-200 group-hover:scale-110">
              <action.icon aria-hidden className="size-4.5" />
            </span>
            <span className="mt-3 text-sm font-bold text-ink-950">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
