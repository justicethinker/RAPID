import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const FALLBACK_SITE_URL = 'https://rapid-rouge.vercel.app';

/**
 * Rebinds the canonical/OG URLs in index.html and emits robots.txt +
 * sitemap.xml from VITE_SITE_URL, so a domain change is one env var instead of
 * edits in four files.
 */
function siteUrlPlugin(siteUrl: string): Plugin {
  const robots = ['User-agent: *', 'Allow: /', 'Disallow: /thanks/', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join(
    '\n',
  );

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    `  <url><loc>${siteUrl}/join</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`,
    `  <url><loc>${siteUrl}/founders</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `  <url><loc>${siteUrl}/how-it-works</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `  <url><loc>${siteUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    `  <url><loc>${siteUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
    `  <url><loc>${siteUrl}/privacy</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
    '</urlset>',
    '',
  ].join('\n');

  return {
    name: 'rapid-site-url',
    transformIndexHtml(html: string) {
      return html.replaceAll('%SITE_URL%', siteUrl);
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

/**
 * Serves the Vercel Functions locally so `/api/*` works in `npm run dev`
 * exactly as it does in production. The module is loaded through Vite's SSR
 * graph so server code is transformed, and environment values from `.env.local`
 * (not just VITE_*) are visible to it.
 */
function apiPlugin(): Plugin {
  return {
    name: 'rapid-api',
    configureServer(server) {
      const fileEnv = loadEnv(server.config.mode, server.config.root, '');
      for (const [key, value] of Object.entries(fileEnv)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }

      server.middlewares.use((request, response, next) => {
        const raw = request as IncomingMessage & { originalUrl?: string };
        const path = raw.originalUrl ?? raw.url ?? '/';
        if (!path.startsWith('/api')) return next();

        void (async () => {
          const module = (await server.ssrLoadModule('/src/server/node-adapter.ts')) as {
            handleNodeRequest: (
              req: IncomingMessage,
              res: ServerResponse,
            ) => Promise<void>;
          };
          await module.handleNodeRequest(request, response);
        })().catch(next);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');

  return {
    plugins: [react(), siteUrlPlugin(siteUrl), apiPlugin()],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
    server: {
      // The Vite dev server may be reached from Windows while it runs in WSL.
      host: true,
    },
  };
});
