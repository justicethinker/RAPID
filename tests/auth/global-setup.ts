import { execFileSync } from 'node:child_process';
import { cleanupTestRecords } from './db';
import { databaseUrl } from './env';

/**
 * The signed-in suite needs a real schema and at least one staff account.
 * Migrations and the seed are idempotent, so this is safe on every run.
 */
export default async function globalSetup(): Promise<void> {
  databaseUrl(); // fail early with an actionable message

  const run = (script: string) =>
    execFileSync(process.execPath, [script], {
      stdio: 'inherit',
      env: process.env,
    });

  run('scripts/migrate.mjs');
  run('scripts/seed-dev.mjs');

  const removed = await cleanupTestRecords();
  if (removed) console.log(`[auth-e2e] removed ${removed} leftover test records`);
}
