import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

// `npm run db:migrate` works without export flags.
try {
  process.loadEnvFile('.env.local');
} catch {
  // No local env file; rely on the actual environment (CI, production).
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Add it to .env.local or export it first.');
  process.exit(1);
}

const directory = path.resolve('db/migrations');
const files = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();

// Two deploys that migrate at the same time would race on the same files; the
// advisory lock makes the second one wait instead of failing halfway.
const MIGRATION_LOCK = 7283946512;

const client = new Client({ connectionString });
await client.connect();
await client.query('select pg_advisory_lock($1)', [MIGRATION_LOCK]);

try {
  await client.query(`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  for (const file of files) {
    const applied = await client.query('select 1 from schema_migrations where name = $1', [file]);
    if (applied.rowCount) {
      console.log(`skip    ${file}`);
      continue;
    }

    const sql = await readFile(path.join(directory, file), 'utf8');
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into schema_migrations (name) values ($1)', [file]);
      await client.query('commit');
      console.log(`applied ${file}`);
    } catch (error) {
      await client.query('rollback');
      console.error(`failed  ${file}`);
      throw error;
    }
  }
} finally {
  try {
    await client.query('select pg_advisory_unlock($1)', [MIGRATION_LOCK]);
  } catch {
    // Releasing is best effort; closing the session releases it anyway.
  }
  await client.end();
}
