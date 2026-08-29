import { CheckCircle2, Circle, Database, HardDrive, KeyRound, Mail, UserCheck } from "lucide-react";
import { Alert, Badge, Card } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { isSupabaseConfigured, DOCUMENTS_BUCKET } from "@/lib/supabase/config";
import {
  ALLOWED_UPLOAD_LABEL,
  CLAIM_STATUSES,
  CLAIM_STATUS_META,
  CURRENCIES,
  MAX_UPLOAD_BYTES,
} from "@/lib/claims";
import { SITE } from "@/lib/site";
import { formatBytes } from "@/lib/utils";
import { getAdminAccess } from "@/lib/supabase/authz";

function Row({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <li className="flex items-start gap-3 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink-100 text-ink-600">
        <Icon aria-hidden className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink-950">{label}</span>
        <span className="block text-sm break-words text-ink-500">{value}</span>
      </span>
      {ok === undefined ? null : ok ? (
        <CheckCircle2 aria-label="Configured" className="mt-1 size-4.5 shrink-0 text-mint-500" />
      ) : (
        <Circle aria-label="Not configured" className="mt-1 size-4.5 shrink-0 text-ink-300" />
      )}
    </li>
  );
}

export default async function AdminSettingsPage() {
  const access = await getAdminAccess();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="The configuration this deployment is running with. Values come from environment variables and the shared domain constants."
      />

      <Alert tone="info" title="Read-only by design">
        Settings are defined in code and environment variables rather than an editable admin form, so
        that a compromised admin session cannot silently reconfigure the platform.
      </Alert>

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span
            className={
              access.isAdmin
                ? "grid size-9 place-items-center rounded-lg bg-mint-500/12 text-mint-600"
                : "grid size-9 place-items-center rounded-lg bg-rose-50 text-rose-600"
            }
          >
            <UserCheck aria-hidden className="size-4" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">
              Your access
            </h2>
            <p className="text-sm text-ink-500">
              What the database reports for the account you are signed in as.
            </p>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-ink-100 border-t border-ink-100">
          {[
            ["Signed in as", access.email ?? "—"],
            ["Account id", access.userId ?? "—"],
            ["profiles.role", access.role ?? "not readable"],
            ["is_admin() says", access.isAdmin ? "true" : "false"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3">
              <dt className="text-sm text-ink-500">{label}</dt>
              <dd className="max-w-[60%] text-right font-mono text-xs break-all text-ink-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {access.reason && (
          <Alert tone="error" title="Reviewer actions are refused" className="mt-4">
            {access.reason}
          </Alert>
        )}
        {access.isAdmin && (
          <Alert tone="success" className="mt-4">
            This account can change case statuses, amend cases and record payouts.
          </Alert>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Services</h2>
          <ul className="mt-2 divide-y divide-ink-100">
            <Row
              icon={Database}
              label="Supabase database"
              value={isSupabaseConfigured ? "Connected via NEXT_PUBLIC_SUPABASE_URL" : "Not connected — example data in use"}
              ok={isSupabaseConfigured}
            />
            <Row
              icon={KeyRound}
              label="Supabase authentication"
              value={isSupabaseConfigured ? "Email and password sign-in enabled" : "Unavailable"}
              ok={isSupabaseConfigured}
            />
            <Row
              icon={HardDrive}
              label="Document storage"
              value={`Private bucket "${DOCUMENTS_BUCKET}" · ${ALLOWED_UPLOAD_LABEL}`}
              ok={isSupabaseConfigured}
            />
            <Row icon={Mail} label="Support inbox" value={SITE.supportEmail} />
          </ul>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Case workflow</h2>
          <p className="mt-2 text-sm text-ink-500">
            The statuses a case can move through. Every change is written to the case history.
          </p>
          <ul className="mt-4 space-y-2.5">
            {CLAIM_STATUSES.map((status) => (
              <li key={status} className="flex items-start gap-3">
                <Badge tone={CLAIM_STATUS_META[status].tone}>{CLAIM_STATUS_META[status].label}</Badge>
                <span className="min-w-0 flex-1 text-sm text-ink-500">
                  {CLAIM_STATUS_META[status].description}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink-950">Limits</h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Max upload size
              </dt>
              <dd className="mt-1 font-display text-xl font-extrabold text-ink-950">
                {formatBytes(MAX_UPLOAD_BYTES)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Files per case
              </dt>
              <dd className="mt-1 font-display text-xl font-extrabold text-ink-950">8</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide text-ink-400 uppercase">
                Supported currencies
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink-800">{CURRENCIES.join(", ")}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
