// @vitest-environment node
import { createServer } from 'node:http';
import { once } from 'node:events';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { handleNodeRequest } from './node-adapter';

const server = createServer(handleNodeRequest);
let base: string;

beforeAll(async () => {
  vi.stubEnv('VERCEL', '1');
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected a TCP listener');
  base = 'http://127.0.0.1:' + address.port;
});

afterAll(async () => {
  vi.unstubAllEnvs();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

it('validates a same-origin application behind the HTTPS deployment proxy', async () => {
  const result = await fetch(base + '/api/applications/founder', {
    method: 'POST',
    headers: { origin: base.replace('http:', 'https:'), 'x-forwarded-proto': 'https' },
    body: '{}',
  });
  expect(result.status).toBe(400);
  expect(await result.json()).toMatchObject({ error: 'bad_request' });
});

it('keeps the foreign-origin rejection on the deployment', async () => {
  const result = await fetch(base + '/api/applications/founder', {
    method: 'POST', headers: { origin: 'https://other.example' }, body: '{}',
  });
  expect(result.status).toBe(403);
});
