import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleNodeRequest } from '../src/server/node-adapter';

export const config = { api: { bodyParser: false } };

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  await handleNodeRequest(request, response);
}
