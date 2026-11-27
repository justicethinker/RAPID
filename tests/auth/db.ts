/**
 * Cleanup for records created by the account tests. Only `pw.` addresses at
 * rapid.invalid are touched, so seed accounts and developer data survive.
 */
import { Client } from 'pg';
import { databaseUrl } from './env';

export const TEST_EMAIL_PATTERN = 'pw.%@rapid.invalid';

export async function cleanupTestRecords(): Promise<number> {
  const client = new Client({ connectionString: databaseUrl() });
  await client.connect();

  try {
    await client.query('begin');

    // A pending invite survives its person row, and would grant staff access to
    // the next account that uses the address, so it is cleared first.
    const invites = await client.query(
      'delete from staff_invites where email like $1',
      [TEST_EMAIL_PATTERN],
    );

    const people = await client.query<{ id: string }>(
      `select id from people where email like $1`,
      [TEST_EMAIL_PATTERN],
    );
    const personIds = people.rows.map((row) => row.id);
    const removedInvites = invites.rowCount ?? 0;

    if (personIds.length === 0) {
      await client.query('commit');
      return removedInvites;
    }

    const tests = await client.query<{ id: string }>(
      `select id from tests where founder_id = any($1::uuid[])`,
      [personIds],
    );
    const testIds = tests.rows.map((row) => row.id);

    const invitations = await client.query<{ id: string }>(
      `select id from invitations
        where test_id = any($1::uuid[]) or tester_id = any($2::uuid[])`,
      [testIds, personIds],
    );
    const invitationIds = invitations.rows.map((row) => row.id);

    await client.query(
      `delete from responses where invitation_id = any($1::uuid[])`,
      [invitationIds],
    );
    await client.query(`delete from invitations where id = any($1::uuid[])`, [
      invitationIds,
    ]);
    await client.query(`delete from findings where test_id = any($1::uuid[])`, [
      testIds,
    ]);
    await client.query(`delete from tests where id = any($1::uuid[])`, [testIds]);

    await client.query(
      `delete from notifications where person_id = any($1::uuid[])`,
      [personIds],
    );
    await client.query(`delete from email_log where person_id = any($1::uuid[])`, [
      personIds,
    ]);

    const entityIds = [...personIds, ...testIds, ...invitationIds];
    await client.query(
      `delete from audit_events
        where actor_id = any($1::uuid[]) or entity_id = any($2::text[])`,
      [personIds, entityIds],
    );

    await client.query(
      `delete from tester_profiles where person_id = any($1::uuid[])`,
      [personIds],
    );
    await client.query(
      `delete from founder_profiles where person_id = any($1::uuid[])`,
      [personIds],
    );
    await client.query(`delete from staff_members where person_id = any($1::uuid[])`, [
      personIds,
    ]);
    await client.query(`delete from people where id = any($1::uuid[])`, [personIds]);

    await client.query('commit');
    return personIds.length + removedInvites;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    await client.end();
  }
}
