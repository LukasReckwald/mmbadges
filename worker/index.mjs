// Cloudflare Worker entry point. Only the default export lives here: Cloudflare treats
// every named export of the main module as an additional entry point.
// Static files (the gallery) never reach this code, see [assets] in wrangler.toml.

import { cacheKey, handle } from './app.mjs';

const STALE_TTL = 'public, max-age=604800'; // keep the last good live value for 7 days

// Same response, different Cache-Control (Response headers can't be changed in place
// for responses that come out of the cache)
const withCacheControl = (response, value) => {
  const copy = new Response(response.body, response);
  copy.headers.set('Cache-Control', value);
  return copy;
};

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD')
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });

    // Cloudflare edge cache (per data center). Note: the Cache API only works on the
    // custom domain (mmbadges.com), not on *.workers.dev.
    // The deployment ID in the key makes every deploy start with a fresh cache.
    const cache = caches.default;
    const url = new URL(request.url);
    const key = new Request(cacheKey(url, env.CF_VERSION_METADATA?.id));
    const hit = await cache.match(key);
    if (hit) return hit;

    // Fallback copy of live badges, independent of deploys: shown when an API is down
    const staleUrl = new URL(cacheKey(url));
    staleUrl.searchParams.set('_stale', '1');
    const staleKey = new Request(staleUrl);

    const response = await handle(request, env);

    if (response.headers.has('X-MM-Upstream-Error')) {
      const stale = await cache.match(staleKey);
      return stale ? withCacheControl(stale, 'public, max-age=60') : response;
    }

    if (response.ok) {
      ctx.waitUntil(cache.put(key, response.clone()));
      if (response.headers.has('X-MM-Live'))
        ctx.waitUntil(cache.put(staleKey, withCacheControl(response.clone(), STALE_TTL)));
    }
    return response;
  },
};
