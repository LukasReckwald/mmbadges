// Base URL for badges. The gallery is served by the same worker as the badges, so the
// current origin works in development (via the Vite proxy) and for preview deploys.
// On our own domain we always use the canonical host, so snippets copied from
// www.mmbadges.com don't end up with "www." in other people's READMEs.
const CANONICAL = 'https://mmbadges.com';

export const BASE =
  typeof location === 'undefined' ? '' : location.hostname.endsWith('mmbadges.com') ? CANONICAL : location.origin;
