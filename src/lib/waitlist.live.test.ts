// @vitest-environment node
// Live check of the deployed Apps Script endpoint. SKIPPED by default —
// when enabled it writes a real row to the waitlist sheet. Run manually with:
//   VITE_LIVE_WAITLIST=1 pnpm exec vitest run src/lib/waitlist.live.test.ts
import { describe, it, expect } from 'vitest';
import { submitWaitlist } from './waitlist';

const EMAIL = `live-test-${Date.now()}@example.com`;
const live = (import.meta.env.VITE_LIVE_WAITLIST as string | undefined) === '1';

describe.skipIf(!live)('submitWaitlist (live endpoint)', () => {
  it('accepts a fresh signup', async () => {
    const res = await submitWaitlist({
      name: 'Live Test (safe to delete)',
      email: EMAIL,
    });
    console.log('fresh signup result:', JSON.stringify(res));
    expect(res.ok).toBe(true);
  }, 60000);

  it('handles a repeat signup', async () => {
    const res = await submitWaitlist({
      name: 'Live Test (safe to delete)',
      email: EMAIL,
    });
    console.log('repeat signup result:', JSON.stringify(res));
    console.log('duplicate detected:', res.duplicate === true);
    expect(res.ok).toBe(true);
  }, 60000);
});
