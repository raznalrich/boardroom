export interface Leader {
  id?: string;
  name: string;
  title: string;
  company: string;
  region: string;
  quote: string;
  /** Photo URL (R2 or any https image) */
  img: string;
  /** R2 object key, when the photo was uploaded through the admin console */
  imgKey?: string | null;
  /** Tenure label, e.g. "CEO since 2020" */
  since: string;
  /** Optional longer biography shown on the profile page. */
  bio?: string;
  createdAt?: string;
}

export const LEADER_REGIONS = ['UAE', 'Saudi Arabia', 'India', 'Global'] as const;

/** URL-friendly id derived from the leader's name. */
export function leaderSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Photo URL for a leader. Full URLs (R2, Unsplash, data URLs) pass through unchanged. */
export function leaderImageUrl(img: string, _width = 500): string {
  return img ?? '';
}
