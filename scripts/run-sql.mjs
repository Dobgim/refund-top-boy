#!/usr/bin/env node
/**
 * Applies a .sql file to the Supabase project.
 *
 *   node scripts/run-sql.mjs supabase/run-all.sql
 *
 * Uses whichever credential is present in the environment:
 *
 *   SUPABASE_ACCESS_TOKEN  a personal access token (sbp_...) — preferred,
 *                          goes over the Management API, revocable in one click
 *   SUPABASE_DB_URL        a full postgres:// connection string
 *
 * Neither is ever written to disk by this script.
 */

import { readFile } from "node:fs/promises";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "qjhrpwjwzegtqcufmqnc";
const file = process.argv[2] ?? "supabase/run-all.sql";

function die(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

const sql = await readFile(file, "utf8").catch(() => die(`Cannot read ${file}`));
console.log(`\nApplying ${file} (${sql.length.toLocaleString()} chars) to ${PROJECT_REF}\n`);

const token = process.env.SUPABASE_ACCESS_TOKEN;
const dbUrl = process.env.SUPABASE_DB_URL;

if (token) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const text = await response.text();
  if (!response.ok) {
    die(`Management API returned ${response.status}\n\n${text.slice(0, 1200)}`);
  }
  console.log("  ✓ Applied via the Management API");
  if (text.trim() && text.trim() !== "[]") console.log(`  ${text.slice(0, 600)}`);
} else if (dbUrl) {
  const { default: pg } = await import("pg").catch(() =>
    die("The `pg` package is not installed. Run: npm i -D pg"),
  );
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect().catch((error) => die(`Could not connect: ${error.message}`));
  try {
    await client.query(sql);
    console.log("  ✓ Applied over a direct Postgres connection");
  } catch (error) {
    die(`SQL failed: ${error.message}${error.position ? ` (at position ${error.position})` : ""}`);
  } finally {
    await client.end();
  }
} else {
  die(
    "No credential found. Set SUPABASE_ACCESS_TOKEN (preferred) or SUPABASE_DB_URL\n" +
      "    in the environment for this command only, then re-run.",
  );
}

console.log("\nDone.\n");
