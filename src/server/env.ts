/**
 * Server environment. Nothing here is exposed to the browser bundle.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

/**
 * Local role sign-in is only available when explicitly enabled and never on a
 * production deployment, whatever the environment file says.
 */
export function devAuthEnabled(): boolean {
  // Any Vercel deployment is public, including previews. Local role sign-in is
  // for a developer's machine only.
  if (process.env.VERCEL) return false;
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.ALLOW_DEV_AUTH === '1';
}

export function databaseUrl(): string {
  return requireEnv('DATABASE_URL');
}

export function clerkSecretKey(): string | undefined {
  return process.env.CLERK_SECRET_KEY?.trim() || undefined;
}

/**
 * Addresses that always hold staff access. This is how the first admin is
 * bootstrapped before anyone exists inside the app to invite them; every later
 * admin is invited from the staff team page.
 */
export function staffEmails(): string[] {
  return (process.env.STAFF_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function devAuthSecret(): string {
  return process.env.DEV_AUTH_SECRET?.trim() || 'rapid-local-development-only';
}

/**
 * Credentials for the local admin door. They are only accepted while local
 * role sign-in is enabled, so a deployed pilot cannot use them whatever the
 * environment says. Override both to share a machine with someone you trust.
 */
export function adminSignInCredentials(): {
  username: string;
  password: string;
} {
  return {
    username: process.env.ADMIN_SIGN_IN_USERNAME?.trim() || 'admin',
    password: process.env.ADMIN_SIGN_IN_PASSWORD || 'admin',
  };
}
