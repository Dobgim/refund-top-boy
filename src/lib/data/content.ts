export const STATS = [
  { value: 12000, suffix: "+", label: "Claims processed", hint: "Across every case type" },
  { value: 8.4, prefix: "$", suffix: "M", decimals: 1, label: "Funds recovered", hint: "Converted to USD" },
  { value: 96, suffix: "%", label: "Client satisfaction", hint: "Rated after resolution" },
  { value: 24, suffix: "/7", label: "Case support window", hint: "Every day of the year" },
] as const;

export const SERVICES = [
  {
    icon: "ShieldCheck",
    title: "Secure Account",
    description:
      "A private portal for managing legitimate refund cases, with session-based authentication and per-user data isolation.",
    href: "/register",
    action: "Create an account",
  },
  {
    icon: "ReceiptText",
    title: "Refund Claims",
    description:
      "Submit and manage eligible refund or dispute requests through a guided form that captures everything a reviewer needs.",
    href: "/dashboard/claims/new",
    action: "Start a claim",
  },
  {
    icon: "FileSearch",
    title: "Transaction Review",
    description:
      "Organise transaction information and supporting documents in one place so nothing is missing when the review begins.",
    href: "/services",
    action: "See what to prepare",
  },
  {
    icon: "Radar",
    title: "Case Tracking",
    description:
      "Follow the status of a submitted case from triage through to resolution, with a timestamped history of every change.",
    href: "/track",
    action: "Track a case",
  },
] as const;

export const STEPS = [
  {
    number: "01",
    icon: "UserPlus",
    title: "Create Your Account",
    description:
      "Register with your name, email and country. No banking passwords, card PINs or recovery phrases are ever requested.",
  },
  {
    number: "02",
    icon: "ClipboardList",
    title: "Submit Your Case",
    description:
      "Describe the transaction and what went wrong. The guided form validates each section before it is submitted.",
  },
  {
    number: "03",
    icon: "UploadCloud",
    title: "Upload Documents",
    description:
      "Attach statements, receipts or correspondence. Files are stored in a private bucket scoped to your account.",
  },
  {
    number: "04",
    icon: "ScanSearch",
    title: "Case Review",
    description:
      "A case handler assesses the evidence, requests anything missing and records each decision against the case.",
  },
  {
    number: "05",
    icon: "Activity",
    title: "Track Progress",
    description:
      "Watch the status move through the pipeline from your dashboard, or with your reference on the public tracker.",
  },
  {
    number: "06",
    icon: "BadgeCheck",
    title: "Resolution",
    description:
      "When the review closes you receive the outcome, the reasoning behind it and a full copy of the case history.",
  },
] as const;

export const SECURITY_FEATURES = [
  {
    icon: "KeyRound",
    title: "Secure Authentication",
    description:
      "Sessions are issued and refreshed by Supabase Auth over httpOnly cookies. Passwords are hashed by the provider and are never stored by this application.",
  },
  {
    icon: "DatabaseZap",
    title: "Encrypted Data",
    description:
      "Data travels over TLS and sits in a managed Postgres instance encrypted at rest by the provider, with row level security on every table.",
  },
  {
    icon: "FileLock2",
    title: "Protected Documents",
    description:
      "Uploads land in a private storage bucket keyed by user id. Files are served through short-lived signed URLs, never public links.",
  },
  {
    icon: "UserCog",
    title: "Case Access Controls",
    description:
      "Administrative access is decided by a server-side role lookup and mirrored in database policy. A client-side check alone never grants access.",
  },
] as const;

export const BENEFITS = [
  {
    icon: "FileUp",
    title: "Secure document submission",
    description:
      "Evidence is uploaded straight into private storage with size, type and file name validation on both ends.",
  },
  {
    icon: "BellRing",
    title: "Clear case updates",
    description:
      "Every status change writes a timestamped entry, so there is always a record of what changed and when.",
  },
  {
    icon: "Eye",
    title: "Transparent case status",
    description:
      "The stage you see on the tracker is the stage the reviewer sees. No hidden queues and no silent stalls.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Amara Osei",
    role: "Small business owner",
    rating: 5,
    quote:
      "The guided form asked for exactly the documents I already had. Uploading everything in one sitting made the whole thing feel manageable.",
    accent: "royal",
  },
  {
    name: "Daniel Reyes",
    role: "Freelance designer",
    rating: 5,
    quote:
      "Being able to check a reference number without logging in is the detail I appreciated most. I stopped refreshing my inbox.",
    accent: "mint",
  },
  {
    name: "Priya Raman",
    role: "Operations lead",
    rating: 4,
    quote:
      "The case timeline reads like an audit log. When a colleague picked the case up, nothing had to be explained twice.",
    accent: "gold",
  },
  {
    name: "Lukas Brenner",
    role: "Retail manager",
    rating: 5,
    quote:
      "Clear status names beat a vague progress bar. Documents Required told me precisely what was blocking the review.",
    accent: "royal",
  },
  {
    name: "Nadia Haddad",
    role: "Consultant",
    rating: 5,
    quote:
      "It never once asked for anything it had no business knowing. That alone put me at ease submitting a case.",
    accent: "mint",
  },
] as const;

export const FAQS = [
  {
    question: "How do I submit a refund case?",
    answer:
      "Create an account, open your dashboard and choose Start a claim. The form walks through your personal details, the transaction, what went wrong and your supporting documents. You can review everything before submitting, and a reference is issued as soon as you do.",
  },
  {
    question: "What information do I need?",
    answer:
      "The transaction date, amount and currency, the payment method used and any reference number from your statement. A short description of what went wrong helps the reviewer, and receipts or correspondence make the case considerably stronger.",
  },
  {
    question: "Can I track my case?",
    answer:
      "Yes. Every case has a reference in the form RR-2026-0118. Signed in, the dashboard shows the full history. Signed out, the public tracker shows the stage, the submission date and the latest update without revealing personal details.",
  },
  {
    question: "How are documents protected?",
    answer:
      "Uploads go into a private Supabase Storage bucket partitioned by user id. Storage policies restrict reads to the owning account and authorised reviewers, and files are only ever served through short-lived signed URLs.",
  },
  {
    question: "How long does a review take?",
    answer:
      "A first response usually lands within a few working days. Complex cases take longer, particularly where a bank or merchant has to respond before we can move. Whatever the timing, the status always reflects the current stage.",
  },
  {
    question: "Can I cancel my claim?",
    answer:
      "Yes. Open the case from your dashboard and send a message asking for it to be withdrawn. The case moves to Closed and stays in your history as a read-only record.",
  },
  {
    question: "What happens after my case is reviewed?",
    answer:
      "The case moves to Approved or Closed and a note explains the reasoning. Approved cases move on to Resolved once the outcome is recorded. Both the note and the full timeline stay available in your dashboard.",
  },
] as const;

/** The three figures shown beside the hero graphic. */
export const HERO_STATS = [
  { value: 93, suffix: "k+", label: "Protected transactions" },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Customer trust rating" },
  { value: 99, suffix: "%", label: "Successful recoveries" },
] as const;
