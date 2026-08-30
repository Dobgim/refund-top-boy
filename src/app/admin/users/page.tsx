import { Users } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { getAdminUsers } from "@/lib/queries";
import { getAdminAccess } from "@/lib/supabase/authz";
import { DeleteUserButton } from "@/components/admin/delete-user";
import { formatDate, initialsOf } from "@/lib/utils";

const STATUS_TONE = {
  active: "good",
  pending: "warn",
  suspended: "neutral",
} as const;

export default async function AdminUsersPage() {
  const [{ data: users }, access] = await Promise.all([getAdminUsers(), getAdminAccess()]);

  // Mirrors the guards in the database function, so the button is disabled for
  // the cases it would refuse rather than failing after the click.
  function blockedReason(id: string, role: string): string | undefined {
    if (id === access.userId) return "You cannot delete your own account";
    if (role === "admin") return "Demote this administrator before deleting";
    return undefined;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Registered accounts. Deleting one removes it from Supabase along with every claim, document and balance belonging to it."
      />

      {users.length === 0 ? (
        <EmptyState
          icon={<Users aria-hidden className="size-6" />}
          title="No users yet"
          description="Accounts appear here as soon as someone registers."
        />
      ) : (
        <>
          {/* mobile */}
          <ul className="space-y-3 lg:hidden">
            {users.map((user) => (
              <li key={user.id}>
                <Card className="flex items-center gap-3 p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-royal-600 font-display text-xs font-extrabold text-white">
                    {initialsOf(user.full_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-ink-950">{user.full_name}</span>
                    <span className="block truncate text-xs text-ink-400">{user.email}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={STATUS_TONE[user.account_status]}>{user.account_status}</Badge>
                      {user.role === "admin" && <Badge tone="gold">admin</Badge>}
                    </span>
                  </span>
                  <DeleteUserButton
                    userId={user.id}
                    email={user.email}
                    name={user.full_name}
                    disabled={Boolean(blockedReason(user.id, user.role))}
                    disabledReason={blockedReason(user.id, user.role)}
                  />
                </Card>
              </li>
            ))}
          </ul>

          {/* desktop */}
          <Card className="hidden overflow-hidden p-0 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60 text-xs tracking-wide text-ink-500 uppercase">
                    <th scope="col" className="px-5 py-3.5 font-bold">Account</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Country</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Role</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Status</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Registered</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-royal-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-royal-600 font-display text-[0.65rem] font-extrabold text-white">
                            {initialsOf(user.full_name)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink-950">
                              {user.full_name}
                            </span>
                            <span className="block max-w-[16rem] truncate text-xs text-ink-400">
                              {user.email}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-ink-600">{user.country ?? "—"}</td>
                      <td className="px-5 py-4">
                        <Badge tone={user.role === "admin" ? "gold" : "neutral"}>{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={STATUS_TONE[user.account_status]}>{user.account_status}</Badge>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-ink-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end">
                          <DeleteUserButton
                            userId={user.id}
                            email={user.email}
                            name={user.full_name}
                            disabled={Boolean(blockedReason(user.id, user.role))}
                            disabledReason={blockedReason(user.id, user.role)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
