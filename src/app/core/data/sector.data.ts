/** Category filter tabs for Sector Deep Dives (home + Articles page). 'ALL' is a filter only, not a category. */
export const SECTOR_TABS = ['ALL', 'LEADERSHIP', 'STRATEGY', 'AI & TECH', 'GCC MARKETS', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'REAL ESTATE', 'RETAIL'];

/** Gradient overlay colours per sector (from → to): a gold and bronze family. */
export const SECTOR_GRADIENTS: Record<string, [string, string]> = {
  'LEADERSHIP': ['#C9A25E', '#2a1d0c'],
  'STRATEGY': ['#E6C98A', '#3b2a10'],
  'AI & TECH': ['#8F6B2F', '#140e06'],
  'GCC MARKETS': ['#B38B45', '#22170a'],
  'FINANCE': ['#D4AF37', '#2e2208'],
  'HEALTHCARE': ['#A67C3D', '#1d1408'],
  'EDUCATION': ['#CDA95F', '#18110a'],
  'REAL ESTATE': ['#94702F', '#1a1207'],
  'RETAIL': ['#E0BE72', '#2b1f0b']
};

/** CSS background value: category gradient laid over the article photo (gradient only when there is no photo). */
export function sectorCover(art: { category: string; image?: string | null }): string {
  const [from, to] = SECTOR_GRADIENTS[art.category] ?? ['#B58A55', '#181818'];
  const gradient = `linear-gradient(135deg, ${from}cc 0%, ${to}e6 100%)`;
  return art.image ? `${gradient}, url(${art.image})` : gradient;
}
