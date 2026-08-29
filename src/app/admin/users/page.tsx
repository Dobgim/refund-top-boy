import { Users } from "lucide-react";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { PageHeader } from "@/components/dashboard/common";
import { getAdminUsers } from "@/lib/queries";
import { formatDate, initialsOf } from "@/lib/utils";

const STATUS_TONE = {
  active: "good",
  pending: "warn",
  suspended: "neutral",
} as const;

export default async function AdminUsersPage() {
  const { data: users } = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Registered accounts. Profile rows are readable here only because the signed-in account holds the admin role."
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
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#4338ca,#6366f1)] font-display text-xs font-extrabold text-white">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {users.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-royal-50/40">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#4338ca,#6366f1)] font-display text-[0.65rem] font-extrabold text-white">
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
