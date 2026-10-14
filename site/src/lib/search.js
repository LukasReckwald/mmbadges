// Search over [slug, title] pairs. Ranking: exact match, then prefix, then substring.

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// 0 = exact, 1 = prefix, 2 = substring, -1 = no match
function rankOf(title, slug, q) {
  if (title === q || slug === q) return 0;
  if (title.startsWith(q) || slug.startsWith(q)) return 1;
  if (title.includes(q) || slug.includes(q)) return 2;
  return -1;
}

/**
 * @param {Array<[string, string]>} brands [slug, title] pairs
 * @param {string} query
 * @returns {Array<[string, string]>}
 */
export function searchBrands(brands, query) {
  const q = norm(query);
  if (!q) return brands;
  const ranked = [];
  for (const brand of brands) {
    const [slug, title] = brand;
    const t = norm(title);
    const rank = rankOf(t, slug, q);
    if (rank >= 0) ranked.push([rank, brand]);
  }
  // Array.prototype.sort is stable, so the alphabetical order is kept within a rank
  return ranked.sort((a, b) => a[0] - b[0]).map(([, brand]) => brand);
}
