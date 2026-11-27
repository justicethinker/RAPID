/**
 * Local development seed. Creates the three roles the app can sign in as when
 * ALLOW_DEV_AUTH=1. Never run this against production: it creates fixed
 * accounts with no password.
 */
import { Client } from 'pg';

try {
  process.loadEnvFile('.env.local');
} catch {
  // No local env file; rely on the actual environment.
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Add it to .env.local or export it first.');
  process.exit(1);
}

if (process.env.VERCEL_ENV === 'production') {
  console.error('Refusing to seed a production database.');
  process.exit(1);
}

const people = [
  { email: 'dev.tester@rapid.local', name: 'Dev Tester', role: 'tester' },
  { email: 'dev.founder@rapid.local', name: 'Dev Founder', role: 'founder' },
  { email: 'dev.staff@rapid.local', name: 'Dev Staff', role: 'staff' },
];

const client = new Client({ connectionString });
await client.connect();

try {
  for (const person of people) {
    const existing = await client.query(
      'select id from people where lower(email) = lower($1)',
      [person.email],
    );

    let personId = existing.rows[0]?.id;
    if (!personId) {
      const inserted = await client.query(
        `insert into people (email, email_verified, full_name)
         values ($1, true, $2)
         returning id`,
        [person.email, person.name],
      );
      personId = inserted.rows[0].id;
    }

    if (person.role === 'tester') {
      await client.query(
        `insert into tester_profiles (person_id, submission_id, country_code, city, age_band, situation, interests, application_status, privacy_version, schema_version, source)
         values ($1, $2, 'NG', 'Lagos', '25_29', 'employed', '{education,technology}', 'approved', '2026-10-20', '2026-10-20', '{"seed":"dev"}'::jsonb)
         on conflict (person_id) do nothing`,
        [personId, `dev-tester-${personId.slice(0, 8)}`],
      );
    }

    if (person.role === 'founder') {
      await client.query(
        `insert into founder_profiles (person_id, whatsapp)
         values ($1, null)
         on conflict (person_id) do nothing`,
        [personId],
      );
    }

    if (person.role === 'staff') {
      await client.query(
        `insert into staff_members (person_id) values ($1)
         on conflict (person_id) do nothing`,
        [personId],
      );
    }

    console.log(`seeded ${person.role.padEnd(7)} ${person.email}`);
  }
} finally {
  await client.end();
}
