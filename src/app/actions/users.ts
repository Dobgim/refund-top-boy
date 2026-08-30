"use server";

import { revalidatePath } from "next/cache";
import { getAdminAccess } from "@/lib/supabase/authz";

/**
 * Permanently deletes an account and everything belonging to it.
 *
 * Two steps, in this order:
 *   1. Remove the stored files. Object storage is not covered by the database
 *      cascade, so deleting the rows first would orphan every uploaded ID and
 *      case document with no record left pointing at them.
 *   2. Delete the auth user, which cascades through the profile to claims,
 *      documents, verifications, notifications, the bank account and its ledger.
 *
 * The guards on who may be deleted live in the database function, not here, so
 * they hold however the call arrives.
 */
export async function deleteUserAccount(userId: string) {
  const { supabase, isAdmin, reason } = await getAdminAccess();
  if (!supabase) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer." };

  // 1. Files first.
  const { data: paths, error: pathError } = await supabase.rpc("account_storage_paths", {
    target: userId,
  });

  if (pathError) {
    return { ok: false, message: `Could not list their files: ${pathError.message}` };
  }

  const byBucket = new Map<string, string[]>();
  for (const row of (paths as Array<{ bucket: string; path: string }> | null) ?? []) {
    if (!row.path) continue;
    byBucket.set(row.bucket, [...(byBucket.get(row.bucket) ?? []), row.path]);
  }

  const failedBuckets: string[] = [];
  for (const [bucket, list] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(list);
    if (error) failedBuckets.push(bucket);
  }

  // 2. Then the account itself.
  const { data, error } = await supabase.rpc("delete_user_account", { target: userId });

  if (error) {
    return { ok: false, message: error.message.replace(/^.*?:\s*/, "") };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/verifications");
  revalidatePath("/admin/claims");

  const email = (data as { email?: string } | null)?.email ?? "The account";

  return {
    ok: true,
    message: failedBuckets.length
      ? `${email} was deleted, but some stored files in ${failedBuckets.join(", ")} could not be removed. Check the storage bucket.`
      : `${email} and all of their data have been deleted.`,
  };
}
