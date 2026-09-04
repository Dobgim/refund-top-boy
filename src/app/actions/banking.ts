"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/supabase/authz";
import { ADMIN_RECIPIENTS, sendEmail } from "@/lib/email/client";
import { loanAppliedAdminEmail, withdrawalRequestedAdminEmail } from "@/lib/email/templates";

const money = z
  .number({ message: "Enter an amount" })
  .positive("Amount must be greater than zero")
  .max(100_000_000, "That amount is above the limit");

/** Every balance change runs through a database function, never a raw update. */
async function callMoneyFunction(fn: string, args: Record<string, unknown>) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Banking is unavailable on this deployment." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const { error } = await supabase.rpc(fn, args);

  if (error) {
    // The database raises readable messages ("Insufficient balance"), so pass
    // them straight through rather than replacing them with something vaguer.
    return { ok: false, message: error.message.replace(/^.*?:\s*/, "") };
  }

  for (const path of [
    "/dashboard",
    "/dashboard/transactions",
    "/dashboard/transfer",
    "/dashboard/withdraw",
    "/dashboard/pay-bill",
    "/dashboard/savings",
    "/dashboard/deposits",
    "/dashboard/loans",
  ]) {
    revalidatePath(path);
  }

  return { ok: true };
}

/**
 * Who is signed in, for the notices below.
 *
 * The money functions take no notice of the caller's name, so it is read back
 * from the profile afterwards rather than threaded through the RPC.
 */
async function currentCustomer() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: account }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle<{ full_name: string | null; email: string | null }>(),
    supabase
      .from("bank_accounts")
      .select("currency")
      .eq("user_id", user.id)
      .maybeSingle<{ currency: string | null }>(),
  ]);

  return {
    fullName: profile?.full_name ?? "A customer",
    email: profile?.email ?? user.email ?? "Unknown address",
    currency: account?.currency ?? "USD",
  };
}

export async function transferFunds(raw: unknown) {
  const parsed = z
    .object({
      destination: z.string().trim().min(6, "Enter the destination account number").max(24),
      amount: money,
      note: z.string().trim().max(140).optional().or(z.literal("")),
    })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  return callMoneyFunction("transfer_funds", {
    destination_number: parsed.data.destination,
    transfer_amount: parsed.data.amount,
    note: parsed.data.note || null,
  });
}

export async function requestWithdrawal(raw: unknown) {
  const parsed = z
    .object({
      amount: money,
      method: z.string().trim().min(2, "Choose how to receive the money"),
      destination: z.string().trim().min(4, "Enter where the money should go").max(160),
    })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const result = await callMoneyFunction("request_withdrawal", {
    withdraw_amount: parsed.data.amount,
    withdraw_method: parsed.data.method,
    withdraw_destination: parsed.data.destination,
  });

  // Only a request that actually went through is worth telling anyone about.
  if (result.ok) {
    const customer = await currentCustomer();
    if (customer) {
      const notice = withdrawalRequestedAdminEmail({
        ...customer,
        amount: parsed.data.amount,
        method: parsed.data.method,
        destination: parsed.data.destination,
      });
      await sendEmail({ to: ADMIN_RECIPIENTS, ...notice });
    }
    revalidatePath("/admin/withdrawals");
  }

  return result;
}

export async function payBill(raw: unknown) {
  const parsed = z
    .object({
      biller: z.string().trim().min(2, "Choose a biller"),
      billNumber: z.string().trim().min(3, "Enter the bill or meter number").max(60),
      amount: money,
    })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  return callMoneyFunction("pay_bill", {
    biller_name: parsed.data.biller,
    bill_ref: parsed.data.billNumber,
    bill_amount: parsed.data.amount,
  });
}

export async function openSavingsScheme(raw: unknown) {
  const parsed = z
    .object({ monthly: money, months: z.number().int().min(6).max(120) })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  return callMoneyFunction("open_savings_scheme", {
    monthly: parsed.data.monthly,
    months: parsed.data.months,
  });
}

export async function openFixedDeposit(raw: unknown) {
  const parsed = z
    .object({ amount: money, months: z.number().int().min(3).max(120) })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  return callMoneyFunction("open_fixed_deposit", {
    amount: parsed.data.amount,
    months: parsed.data.months,
  });
}

/** A loan is an application. Nothing is disbursed until a reviewer approves. */
export async function applyForLoan(raw: unknown) {
  const parsed = z
    .object({
      amount: money,
      purpose: z.string().trim().min(8, "Say what the loan is for").max(300),
      months: z.number().int().min(3).max(120),
    })
    .safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, message: "Banking is unavailable on this deployment." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };

  const { error } = await supabase.from("loans").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    purpose: parsed.data.purpose,
    tenure_months: parsed.data.months,
    status: "pending",
  });

  if (error) return { ok: false, message: `The application could not be saved: ${error.message}` };

  const customer = await currentCustomer();
  if (customer) {
    const notice = loanAppliedAdminEmail({
      ...customer,
      amount: parsed.data.amount,
      purpose: parsed.data.purpose,
      months: parsed.data.months,
    });
    await sendEmail({ to: ADMIN_RECIPIENTS, ...notice });
  }

  revalidatePath("/dashboard/loans");
  revalidatePath("/admin/loans");
  return { ok: true };
}

/** Reviewer decision. Approval disburses in the same database call. */
export async function decideLoan(loanId: string, decision: "approved" | "rejected", note: string) {
  const { supabase, isAdmin, reason } = await getAdminAccess();
  if (!supabase) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer." };

  const { error } = await supabase.rpc("approve_loan", {
    loan_id: loanId,
    decision,
    note: note.trim() || null,
  });

  if (error) return { ok: false, message: error.message.replace(/^.*?:\s*/, "") };

  revalidatePath("/admin/loans");
  revalidatePath("/dashboard/loans");
  return { ok: true };
}

/**
 * Reviewer decision on a withdrawal. Funds were held when the request was made,
 * so a rejection has to return them — the database function does both in one
 * call so the balance and the status can never disagree.
 */
export async function decideWithdrawal(
  requestId: string,
  decision: "completed" | "rejected",
  note: string,
) {
  const { supabase, isAdmin, reason } = await getAdminAccess();
  if (!supabase) return { ok: false, message: reason ?? "Unavailable." };
  if (!isAdmin) return { ok: false, message: reason ?? "You are not a reviewer." };

  const { error } = await supabase.rpc("decide_withdrawal", {
    request_id: requestId,
    decision,
    note: note.trim() || null,
  });

  if (error) return { ok: false, message: error.message.replace(/^.*?:\s*/, "") };

  revalidatePath("/admin/withdrawals");
  revalidatePath("/dashboard/withdraw");
  revalidatePath("/dashboard");
  return { ok: true };
}
