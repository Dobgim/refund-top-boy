/**
 * Turns a Supabase auth error into something a person can act on.
 *
 * The API returns internal strings — "email rate limit exceeded",
 * "over_request_rate_limit", "Invalid login credentials" — and showing those
 * verbatim tells someone that something failed without telling them what to do
 * about it. Each case below says what happened and what to try next.
 */
export function describeAuthError(raw: string | undefined | null): string {
  const message = (raw ?? "").toLowerCase();

  // Supabase's built-in mail service allows only a few sends per hour. Hitting
  // it is by far the most common failure while testing sign-up.
  if (
    message.includes("email rate limit") ||
    message.includes("over_email_send_rate_limit")
  ) {
    return "Too many confirmation emails have been sent from this project in the last hour. Wait about an hour and try again, or sign in if you have already registered.";
  }

  // "For security purposes, you can only request this after 47 seconds."
  const seconds = message.match(/after (\d+) seconds?/);
  if (seconds) {
    return `Please wait ${seconds[1]} seconds before trying again.`;
  }

  if (message.includes("over_request_rate_limit") || message.includes("too many requests")) {
    return "Too many attempts in a short time. Wait a minute and try again.";
  }

  if (message.includes("already registered") || message.includes("already been registered")) {
    return "An account already exists for that email address. Sign in instead, or reset your password.";
  }

  if (message.includes("invalid login credentials")) {
    return "That email and password combination does not match an account.";
  }

  if (message.includes("email not confirmed")) {
    return "This account has not been confirmed yet. Open the link in the confirmation email, then sign in.";
  }

  if (message.includes("captcha")) {
    return "The security check did not pass. Refresh the page and try again.";
  }

  if (message.includes("password") && message.includes("should be")) {
    return "That password does not meet the minimum requirements. Choose a longer one.";
  }

  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return "We could not reach the server. Check your connection and try again.";
  }

  // Anything unrecognised is passed through rather than swallowed, so a genuine
  // problem is still visible instead of hidden behind a generic apology.
  return raw?.trim() || "Something went wrong. Please try again.";
}
