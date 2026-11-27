import { cleanupTestRecords } from './db';

export default async function globalTeardown(): Promise<void> {
  const removed = await cleanupTestRecords();
  if (removed) console.log(`[auth-e2e] cleaned up ${removed} test records`);
}
