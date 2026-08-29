#!/usr/bin/env node
/**
 * Points Supabase Auth at Resend for all outbound email (confirmation,
 * password reset, magic links) and sets the auth redirect URLs.
 *
 *   RESEND_API_KEY=re_xxx \
 *   RESEND_FROM=noreply@yourdomain.com \
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx \
 *   node scripts/configure-resend.mjs
 *
 * Optional: SITE_URL (defaults to http://localhost:3000)
 *
 * Why SMTP rather than a Send Email Hook: a hook makes Supabase's servers call
 * back into this app, which cannot work while the app is on localhost. SMTP is
 * outbound from Supabase, so it works identically in local dev and production.
 */

const REF = process.env.SUPABASE_PROJECT_REF ?? "qjhrpwjwzegtqcufmqnc";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM;
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

function die(m) {
  console.error(`\n  ✖ ${m}\n`);
  process.exit(1);
}

if (!TOKEN) die("SUPABASE_ACCESS_TOKEN is required (sbp_...).");
if (!RESEND_KEY) die("RESEND_API_KEY is required (re_...).");
if (!FROM) die("RESEND_FROM is required, e.g. noreply@yourdomain.com");

const redirects = [
  `${SITE_URL}/auth/callback`,
  `${SITE_URL}/auth/callback?next=/dashboard`,
  `${SITE_URL}/auth/callback?next=/reset-password`,
  `${SITE_URL}/**`,
];

const body = {
  // --- Resend over SMTP -----------------------------------------------------
  smtp_host: "smtp.resend.com",
  smtp_port: 587,
  smtp_user: "resend", // Resend's SMTP username is always the literal "resend"
  smtp_pass: RESEND_KEY, // the API key doubles as the SMTP password
  smtp_admin_email: FROM,
  smtp_sender_name: "RoyalRefund",
  smtp_max_frequency: 60,

  // --- confirmation flow ----------------------------------------------------
  mailer_autoconfirm: false, // require the emailed confirmation link
  mailer_secure_email_change_enabled: true,

  // --- where links are allowed to land -------------------------------------
  site_url: SITE_URL,
  uri_allow_list: redirects.join(","),
};

console.log(`\nConfiguring auth email for ${REF}`);
console.log(`  SMTP     smtp.resend.com:587 as "resend"`);
console.log(`  From     ${FROM}`);
console.log(`  Site     ${SITE_URL}\n`);

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) die(`Supabase returned ${res.status}\n\n${text.slice(0, 900)}`);

let parsed;
try {
  parsed = JSON.parse(text);
} catch {
  parsed = {};
}

console.log("  ✓ Auth email now routes through Resend");
console.log(`    smtp_host        ${parsed.smtp_host ?? "?"}`);
console.log(`    smtp_admin_email ${parsed.smtp_admin_email ?? "?"}`);
console.log(`    mailer_autoconfirm ${parsed.mailer_autoconfirm}`);
console.log(`    site_url         ${parsed.site_url ?? "?"}`);
console.log("\nSend a test by registering a new account at /register.\n");
