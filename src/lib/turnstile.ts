/**
 * Cloudflare Turnstile — real bot protection for the public forms.
 *
 * Two halves, and both matter:
 *   - the widget renders a challenge in the browser and produces a token
 *   - a server checks that token with Cloudflare before trusting the request
 *
 * A widget on its own proves nothing: anyone can post straight to the endpoint
 * and skip the UI entirely. The server-side check is what actually protects.
 *
 * Unconfigured, every form behaves exactly as before, so the site still runs
 * without Cloudflare keys.
 */

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export const isTurnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

const VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Server-side token check. Returns true when the request should be allowed.
 *
 * Fails **open** when no secret is configured, so an unconfigured deployment
 * is not silently bricked, and **closed** on an invalid token.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    // Cloudflare unreachable: reject rather than wave the request through.
    return false;
  }
}
