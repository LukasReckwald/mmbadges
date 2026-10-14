// Base URL for badges. The gallery is served by the same worker as the badges,
// so the current origin is right in production and (via the Vite proxy) in development.
export const BASE = typeof location === 'undefined' ? '' : location.origin;
