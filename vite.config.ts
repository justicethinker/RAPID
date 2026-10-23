import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const siteUrl = (env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': resolve(import.meta.dirname, 'src'),
      },
    },
  };
});
