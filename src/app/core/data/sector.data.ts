/** Category filter tabs for Sector Deep Dives (home + Articles page). 'ALL' is a filter only, not a category. */
export const SECTOR_TABS = ['ALL', 'LEADERSHIP', 'STRATEGY', 'AI & TECH', 'GCC MARKETS', 'FINANCE', 'HEALTHCARE', 'EDUCATION', 'REAL ESTATE', 'RETAIL'];

/** Gradient overlay colours per sector (from → to). */
export const SECTOR_GRADIENTS: Record<string, [string, string]> = {
  'LEADERSHIP': ['#B58A55', '#3a2a14'],
  'STRATEGY': ['#C21867', '#3a0f26'],
  'AI & TECH': ['#6D28D9', '#1e1245'],
  'GCC MARKETS': ['#0E7490', '#0b2f3a'],
  'FINANCE': ['#15803D', '#0d2e1a'],
  'HEALTHCARE': ['#0891B2', '#0a2e38'],
  'EDUCATION': ['#D97706', '#3b2306'],
  'REAL ESTATE': ['#9A3412', '#2e1208'],
  'RETAIL': ['#BE185D', '#35102a']
};

/** CSS background value: category gradient laid over the article photo (gradient only when there is no photo). */
export function sectorCover(art: { category: string; image?: string | null }): string {
  const [from, to] = SECTOR_GRADIENTS[art.category] ?? ['#B58A55', '#181818'];
  const gradient = `linear-gradient(135deg, ${from}cc 0%, ${to}e6 100%)`;
  return art.image ? `${gradient}, url(${art.image})` : gradient;
}
