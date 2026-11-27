import type { IncomingMessage, ServerResponse } from 'node:http';
import { TLSSocket } from 'node:tls';
import { handleRequest } from './router';

// JSON bodies stay capped in readJson; this higher ceiling is for the
// multipart image uploads (the server accepts images up to 3 MB).
const MAX_BODY_BYTES = 4 * 1024 * 1024;

async function readBody(request: IncomingMessage): Promise<Buffer | undefined> {
  const method = request.method ?? 'GET';
  if (method === 'GET' || method === 'HEAD') return undefined;

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error('Request body too large') as Error & { statusCode?: number };
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export async function handleNodeRequest(
  request: IncomingMessage & { originalUrl?: string },
  response: ServerResponse,
): Promise<void> {
  try {
    const host = request.headers.host ?? 'localhost';
    const path = request.originalUrl ?? request.url ?? '/';
    // Vercel terminates TLS before invoking the function. The Host still
    // identifies the deployment (including preview and custom domains).
    const https = process.env.VERCEL === '1' ||
      (request.socket instanceof TLSSocket && request.socket.encrypted);
    const url = `${https ? 'https' : 'http'}://${host}${path}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (!value || key.startsWith(':')) continue;
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else {
        headers.set(key, value);
      }
    }

    const method = request.method ?? 'GET';
    const body = await readBody(request);
    const webRequest = new Request(url, { method, headers, body });
    const webResponse = await handleRequest(webRequest);

    response.statusCode = webResponse.status;
    for (const [key, value] of webResponse.headers.entries()) {
      if (key === 'set-cookie') continue;
      response.setHeader(key, value);
    }
    const cookies = webResponse.headers.getSetCookie?.() ?? [];
    if (cookies.length) response.setHeader('set-cookie', cookies);

    if (webResponse.status === 204 || webResponse.status === 304) {
      response.end();
      return;
    }

    response.end(Buffer.from(await webResponse.arrayBuffer()));
  } catch (error) {
    console.error('[api] adapter failure', error);
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    if (!response.headersSent) response.statusCode = status;
    response.end(
      JSON.stringify(status === 413 ? { error: 'bad_request' } : { error: 'server' }),
    );
  }
}
