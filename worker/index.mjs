// Cloudflare Worker entry point. Only the default export lives here: Cloudflare treats
// every named export of the main module as an additional entry point.
// Static files (the gallery) never reach this code, see [assets] in wrangler.toml.

import { cacheKey, handle } from './app.mjs';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });

    // Cloudflare edge cache (per data center). Note: the Cache API only works on the
    // custom domain (mmbadges.com), not on *.workers.dev.
    const cache = caches.default;
    const key = new Request(cacheKey(new URL(request.url)));
    const hit = await cache.match(key);
    if (hit) return hit;

    const response = handle(request);
    if (response.ok) ctx.waitUntil(cache.put(key, response.clone()));
    return response;
  },
};
