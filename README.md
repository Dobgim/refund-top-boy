# RoyalRefund

**Secure Refund & Financial Recovery Platform — a production-quality prototype.**

RoyalRefund is an original demonstration of an end-to-end refund and payment-dispute
workflow: registration, guided case submission, private evidence upload, reviewer
assessment, status changes, customer messaging, resolution, and a public case tracker —
with the access controls each of those steps actually requires.

> **This is a prototype.** It is not a bank, a payment institution or a regulated
> recovery service, and it moves no money. Every statistic, testimonial, balance and
> case record shown in the interface is fictional demo data and is labelled as such.
> The platform never requests banking passwords, card PINs, one-time codes, seed
> phrases or private keys, and no field in it accepts one.

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, Turbopack) |
| Language | TypeScript, `strict` |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Motion | Framer Motion 13, with `prefers-reduced-motion` honoured throughout |
| Backend | Supabase — Postgres, Auth, Storage, Row Level Security |
| Icons | lucide-react (plus four hand-drawn footer glyphs) |
| Validation | Zod 4 schemas shared by client and server |
| Forms | react-hook-form + `@hookform/resolvers` |
| Hosting | Vercel |

**It runs without credentials.** With no Supabase project configured, every data path
falls back to bundled demo fixtures and the UI shows a clear demo-mode banner, so the
whole product can be reviewed offline. Add credentials and the same code paths hit the
real database.

---

## 2. Project structure

```
royalrefund/
├─ scripts/
│  └─ seed.mjs                    # creates demo accounts + sample cases from env vars
├─ supabase/
│  ├─ 01_schema.sql               # tables, enums, indexes, triggers, public views
│  └─ 02_policies.sql             # RLS policies, helper functions, storage bucket
├─ public/
│  ├─ images/royalrefund-mark.svg
│  └─ icons/app-icon.svg
└─ src/
   ├─ app/
   │  ├─ layout.tsx               # fonts, SEO defaults, viewport
   │  ├─ error.tsx / loading.tsx / not-found.tsx
   │  ├─ icon.svg                 # favicon
   │  ├─ opengraph-image.tsx      # generated social card
   │  ├─ sitemap.ts / robots.ts
   │  ├─ actions/                 # "use server" — newsletter, claims
   │  ├─ auth/callback/           # PKCE code exchange
   │  ├─ auth/sign-out/
   │  ├─ (marketing)/             # public site: home, services, how-it-works,
   │  │                           # about, faq, contact, track, brand, legal/*
   │  ├─ (auth)/                  # login, register, forgot-password, reset-password
   │  ├─ dashboard/               # user portal: overview, claims, new, [reference]
   │  └─ admin/                   # dashboard, claims, users, documents,
   │                              # messages, settings
   ├─ components/
   │  ├─ brand/                   # logo, wordmark, social glyphs
   │  ├─ layout/                  # header, footer, page hero, legal shell
   │  ├─ ui/                      # button, field, primitives, motion
   │  ├─ home/                    # every homepage section
   │  ├─ forms/                   # login, register, password, claim, contact
   │  ├─ dashboard/               # shell, common widgets, claim interactions
   │  ├─ admin/                   # filters, status updater
   │  └─ track/
   ├─ lib/
   │  ├─ supabase/                # client, server, admin, proxy, config
   │  ├─ validations/             # zod schemas
   │  ├─ animations/              # shared variants + reduced-motion hook
   │  ├─ data/                    # demo fixtures, content, countries
   │  ├─ claims.ts                # status/type domain constants
   │  ├─ queries.ts               # server-only data access
   │  ├─ site.ts                  # nav + site metadata
   │  └─ utils.ts
   ├─ types/
   └─ proxy.ts                    # session refresh + protected-route gating
```

---

## 3. Setup

```bash
git clone <your-repo> royalrefund
cd royalrefund
npm install
cp .env.example .env.local     # fill in, or leave it out to browse in demo mode
npm run dev                    # http://localhost:3000
```

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run check` | Typecheck, lint and build in sequence |
| `npm run seed` | Create the demo admin/user and sample cases |

---

## 4. Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Anon key; every request it makes is still bound by RLS |
| `NEXT_PUBLIC_SITE_URL` | client + server | Canonical URL for SEO and auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Bypasses RLS. Used exclusively by `npm run seed` |
| `DEMO_ADMIN_EMAIL` | **server only** | Seed script: demo administrator address |
| `DEMO_ADMIN_PASSWORD` | **server only** | Seed script: minimum 12 characters |
| `DEMO_USER_EMAIL` | **server only** | Seed script: optional sample case owner |
| `DEMO_USER_PASSWORD` | **server only** | Seed script: optional |

No credential is hard-coded anywhere in the source. `.env.local` is git-ignored.

---

## 5. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the URL and anon key from **Project Settings → API** into `.env.local`.
3. Open the **SQL Editor** and run **`supabase/01_schema.sql`**, then
   **`supabase/02_policies.sql`**. Both are idempotent — re-running is safe.
4. Under **Authentication → URL Configuration**, set the Site URL to your
   `NEXT_PUBLIC_SITE_URL` and add `<site-url>/auth/callback` as a redirect URL.
5. Run `npm run seed` to create the demo accounts.

`02_policies.sql` also creates the private `claim-documents` storage bucket with an
8 MB limit and a MIME allow-list, so no manual bucket setup is needed.

### Schema

| Table | Holds |
| --- | --- |
| `profiles` | One row per auth user: name, email, country, `role`, `account_status` |
| `claims` | The case: type, status, amount, transaction details, narrative, owner |
| `claim_status_history` | Append-only audit of every status change, with an optional note |
| `claim_documents` | Metadata for each uploaded file and its private storage path |
| `claim_messages` | Two-way thread between the case owner and reviewers |
| `notifications` | Per-user alerts, written automatically on each status change |
| `newsletter_subscribers` | Email captures from the marketing site |
| `admin_activity` | Audit log of privileged actions |

Every table uses UUID primary keys, `created_at`/`updated_at` timestamps, foreign keys
with `on delete cascade`, and indexes on the columns the app actually filters and sorts
on. Case references are issued by Postgres (`RR-2026-0001`) from a sequence, so two
concurrent submissions can never collide.

Two narrow, security-definer views back the public tracker:

- `claim_public_status` — reference, type, status, dates
- `claim_public_history` — reference, status, note, timestamp

They expose no amounts, contact details, documents or messages, which is why the
tracker can be read anonymously without opening up `claims` itself.

### Row Level Security

RLS is enabled on all eight tables. Access is decided by two `SECURITY DEFINER` helpers,
`is_admin()` and `owns_claim(uuid)`, so admin checks never re-enter the policies they
are being evaluated inside.

| Table | User can | Admin can |
| --- | --- | --- |
| `profiles` | Read and update their own row | Read and update any row |
| `claims` | Read and create their own | Read, update and delete any |
| `claim_status_history` | Read their own case history | Read all, insert |
| `claim_documents` | Read, insert and delete their own | Read and delete any |
| `claim_messages` | Read and post on their own cases | Read and post on any |
| `notifications` | Read and mark their own read | — |
| `newsletter_subscribers` | Insert only (anon included) | Read |
| `admin_activity` | — | Read and insert |

Three details worth calling out:

- **Role escalation is blocked at the database.** A `before update` trigger on
  `profiles` reverts any change a non-admin makes to `role` or `account_status`, so even
  a permitted self-update cannot promote an account.
- **Sender roles cannot be forged.** The insert policy on `claim_messages` rejects a row
  claiming `sender_role = 'admin'` unless the caller genuinely is one, and the server
  action derives the role from the database rather than the request.
- **Client-side checks never grant access.** `/admin` is gated server-side in the layout
  by a database role lookup, and again by every policy above. Removing the redirect in
  the browser would still return zero rows.

Storage policies key on the first path segment of the object name
(`<user-id>/<claim-id>/<uid>-<file>`), so an authenticated user can only write into
their own prefix, and files are only ever served through 60-second signed URLs.

---

## 6. Routes

**Public**

| Route | Purpose |
| --- | --- |
| `/` | Homepage — hero, stats, services, recovery, how it works, mobile, transaction flow, security, testimonials, FAQ, newsletter |
| `/how-it-works` | Six-stage timeline and what each status means |
| `/services` | What the platform handles and what to prepare |
| `/about` | Why it exists and the principles behind it |
| `/faq` | Help center, with structured data |
| `/contact` | Support channels and a validated contact form |
| `/track` | Public case tracker (`?ref=RR-DEMO-2026-001`) |
| `/brand` | Brand guidelines: mark, palette, type, usage |
| `/legal/privacy`, `/legal/terms`, `/legal/refund-policy`, `/legal/cookies` | Policy pages |

**Authentication**

`/login` · `/register` · `/forgot-password` · `/reset-password` ·
`/auth/callback` (PKCE exchange) · `/auth/sign-out` (POST)

**User portal** — session required

`/dashboard` · `/dashboard/claims` · `/dashboard/claims/new` ·
`/dashboard/claims/[reference]`

**Administration** — admin role required

`/admin` · `/admin/claims` · `/admin/claims/[reference]` · `/admin/users` ·
`/admin/documents` · `/admin/messages` · `/admin/settings`

---

## 7. How the claim workflow works

1. **Register.** Sign-up captures name, email, country and a password. A Postgres
   trigger on `auth.users` mirrors the account into `profiles` with `role = 'user'`.
2. **Submit.** `/dashboard/claims/new` validates four sections with the same Zod schema
   the server action re-validates against. On success Postgres issues the reference and
   an `after insert` trigger opens the case history at **Submitted**.
3. **Upload.** Files are validated for size, MIME type and name, then uploaded from the
   browser straight into the private bucket under the user's own prefix. A row in
   `claim_documents` records each one. Uploads happen after the case row exists, so
   every object has an owner.
4. **Review.** A reviewer opens the case in `/admin/claims/[reference]`, reads the
   narrative and evidence, and can ask for more through the message thread.
5. **Status change.** `updateClaimStatus` re-checks the admin role server-side, updates
   the case, writes a `claim_status_history` row with the reviewer's note, and logs the
   action to `admin_activity`. A trigger on the history row syncs `claims.status`,
   bumps `last_update`, and creates a notification for the owner.
6. **Track.** The owner sees the full history in their dashboard. Anyone holding the
   reference can see stage, dates and notes on `/track` — and nothing else.
7. **Resolve.** The case ends at **Resolved** or **Closed** with a written reason. The
   history, documents and messages stay available as a read-only record.

Statuses: `submitted → under_review ⇄ documents_required → approved → resolved`, with
`closed` reachable from any point.

---

## 8. Demo accounts

There are no shipped credentials. `npm run seed` creates the accounts from values you
choose in `.env.local`:

```bash
DEMO_ADMIN_EMAIL=admin@example.com
DEMO_ADMIN_PASSWORD=<at least 12 characters>
DEMO_USER_EMAIL=user@example.com
DEMO_USER_PASSWORD=<at least 12 characters>
```

Then `npm run seed`. The admin account is promoted by writing `role = 'admin'` directly
to its profile row with the service-role key — the only place that key is ever used, and
it never reaches the browser. Sign in with the admin address to reach `/admin`.

Without a Supabase project, `/dashboard` and `/admin` still render against the bundled
fixtures so the interface can be reviewed, with writes disabled and a banner saying so.

---

## 9. Deploying to Vercel

1. Push the repository to GitHub.
2. **Add New → Project** in Vercel and import it. The Next.js preset needs no changes.
3. Add environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — your production URL, e.g. `https://royalrefund.vercel.app`
   - `SUPABASE_SERVICE_ROLE_KEY` — only if you intend to run the seed from CI
4. Deploy.
5. Back in Supabase, add `https://<your-domain>/auth/callback` to the allowed redirect
   URLs and set the Site URL to your production domain, or confirmation and
   password-reset links will bounce.

---

## 10. Design and accessibility notes

- **Original identity.** The mark is a shield whose counter-form is a return arrow,
  topped by three crown notches, drawn entirely as vector paths in
  `components/brand/logo.tsx`. Every illustration on the site — the recovery console,
  the phone mockup, the transaction flow, the progress ring, the avatars — is built from
  layout primitives and SVG, not bitmaps. Nothing is copied from any other site.
- **Motion system.** Shared variants in `lib/animations/variants.ts` and four wrappers
  (`Reveal`, `RevealGroup`, `Floating`, `Counter`) keep timing consistent. Everything
  animates on viewport entry once, never on a loop that costs anything, and
  `prefers-reduced-motion` collapses decorative motion to a static render rather than
  merely shortening it.
- **Responsive.** Layouts reorganise rather than shrink: tables become stacked cards
  below `lg`, the timeline flips from alternating to single-column, the phone mockup is
  width-clamped with `min(19rem, 84vw)`, and `overflow-x: clip` on `body` plus per-table
  scroll containers keep the page from ever scrolling sideways at 320px.
- **Accessibility.** Semantic landmarks and heading order, a skip link, visible focus
  rings on a `:focus-visible` outline, labelled form fields with `aria-invalid` and
  `role="alert"` errors, `aria-expanded`/`aria-controls` on the accordion and both
  navigations, Escape-to-close and scroll-lock on overlays, `aria-live` on async
  feedback, and text alternatives on every meaningful icon.
- **SEO.** Metadata templates, canonical URLs, Open Graph and Twitter cards, a generated
  OG image, `sitemap.xml`, `robots.txt` that excludes every private and single-use route,
  and JSON-LD `WebSite` and `FAQPage` graphs.

---

## 11. Licence and attribution

Original work created for this prototype. The layout conventions of a modern fintech
marketing site informed the section ordering; all copy, illustrations, branding,
testimonials, statistics and code here are original to this project.
