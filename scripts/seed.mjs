#!/usr/bin/env node
/**
 * Seeds the demo accounts and a handful of sample cases.
 *
 *   npm run seed
 *
 * Credentials are read from the environment only — nothing is hard-coded here,
 * and the service-role key never leaves this script.
 *
 * Required:  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *            DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD
 * Optional:  DEMO_USER_EMAIL, DEMO_USER_PASSWORD
 */

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;
const USER_EMAIL = process.env.DEMO_USER_EMAIL;
const USER_PASSWORD = process.env.DEMO_USER_PASSWORD;

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

if (!URL || !SERVICE_KEY) {
  fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  fail("Set DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD in .env.local first.");
}
if (ADMIN_PASSWORD.length < 12) {
  fail("DEMO_ADMIN_PASSWORD must be at least 12 characters.");
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Creates the auth user if it does not exist, and returns its id. */
async function ensureUser({ email, password, fullName, country, role }) {
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, country },
  });

  let id = created?.user?.id;

  if (error) {
    if (!/already been registered|already exists/i.test(error.message)) throw error;
    const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    id = list?.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!id) throw new Error(`Could not resolve the existing user ${email}`);
    console.log(`  · ${email} already exists`);
  } else {
    console.log(`  ✓ created ${email}`);
  }

  // The auth trigger creates the profile row; this sets the fields it cannot know.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id, email, full_name: fullName, country, role, account_status: "active" },
      { onConflict: "id" },
    );
  if (profileError) throw profileError;

  return id;
}

const SAMPLE_CASES = [
  {
    claim_type: "duplicate_charge",
    amount: 486.5,
    currency: "USD",
    transaction_date: "2026-06-14",
    transaction_type: "Card payment",
    transaction_reference: "TXN-4471-DEMO",
    reason: "Charged twice for a single online order",
    description:
      "A single checkout produced two identical authorisations three minutes apart. The merchant confirmed only one order was created, but the second amount has not been released.",
    status: "under_review",
    note: "Evidence accepted. A case handler is reconciling both authorisations.",
  },
  {
    claim_type: "subscription_refund",
    amount: 129,
    currency: "EUR",
    transaction_date: "2026-04-02",
    transaction_type: "Subscription billing",
    transaction_reference: "SUB-9903-DEMO",
    reason: "Annual plan renewed after cancellation",
    description:
      "The subscription was cancelled inside the trial window, but the annual plan still renewed the following morning and the amount was taken the same day.",
    status: "resolved",
    note: "Outcome recorded. Demo funds returned to the original payment method.",
  },
  {
    claim_type: "service_not_rendered",
    amount: 1240,
    currency: "GBP",
    transaction_date: "2026-05-27",
    transaction_type: "Bank transfer",
    transaction_reference: "BT-2288-DEMO",
    reason: "Prepaid service was never delivered",
    description:
      "A deposit was paid for a scheduled service that the provider later cancelled. No replacement date and no refund has been offered in the six weeks since.",
    status: "documents_required",
    note: "Please upload the signed service agreement and the cancellation notice.",
  },
];

async function seedCases(userId, adminId, profile) {
  const { count } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) {
    console.log(`  · ${count} case(s) already present, skipping sample cases`);
    return;
  }

  for (const sample of SAMPLE_CASES) {
    const { note, status, ...columns } = sample;

    const { data: claim, error } = await supabase
      .from("claims")
      .insert({
        ...columns,
        user_id: userId,
        contact_name: profile.fullName,
        contact_email: profile.email,
        country: profile.country,
      })
      .select("id, reference")
      .single();

    if (error) throw error;

    if (status !== "submitted") {
      const { error: historyError } = await supabase
        .from("claim_status_history")
        .insert({ claim_id: claim.id, status, note, created_by: adminId });
      if (historyError) throw historyError;
    }

    console.log(`  ✓ case ${claim.reference} (${status})`);
  }
}

async function main() {
  console.log("\nSeeding RoyalRefund demo data\n");

  const adminId = await ensureUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    fullName: "Demo Administrator",
    country: "United States",
    role: "admin",
  });

  if (USER_EMAIL && USER_PASSWORD) {
    const profile = {
      email: USER_EMAIL,
      fullName: "Demo Account",
      country: "United States",
    };
    const userId = await ensureUser({
      ...profile,
      password: USER_PASSWORD,
      role: "user",
    });
    await seedCases(userId, adminId, profile);
  } else {
    console.log("  · DEMO_USER_EMAIL not set, skipping the sample case owner");
  }

  console.log("\nDone. Sign in at /login with the admin address to reach /admin.\n");
}

main().catch((error) => {
  console.error("\n  ✖ Seed failed:", error.message ?? error, "\n");
  process.exit(1);
});
