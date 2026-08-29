import type { NextConfig } from "next";

/**
 * On a developer machine this project can sit inside a parent directory that
 * also contains a lockfile, which makes Turbopack guess the wrong workspace
 * root. Pinning it silences that. On a build server the checkout *is* the
 * root, and pinning it there risks resolving against the wrong directory, so
 * the override is applied locally only.
 */
const isBuildServer = Boolean(process.env.VERCEL || process.env.CI);

const nextConfig: NextConfig = {
  ...(isBuildServer ? {} : { turbopack: { root: process.cwd() } }),

  // Vercel's default builder is 2 cores / 8 GB, but Next fans out to one worker
  // per core-ish and each carries a full module graph. Capping concurrency on
  // the build server trades a little wall-clock time for headroom.
  ...(isBuildServer ? { experimental: { cpus: 2 } } : {}),

  // Do not emit AGENTS.md / CLAUDE.md into the repo.
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
