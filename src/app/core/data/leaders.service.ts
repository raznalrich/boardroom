import { Injectable, signal } from '@angular/core';
import { supabase, UNIQUE_VIOLATION, dbError } from '../supabase/supabase';
import { Leader, leaderSlug } from './leaders.data';

/** Result of a write: `error` is a message to show the user, null on success. */
export type SaveResult = { error: string | null };

/**
 * Leaders for the home "Leaders in Focus" carousel, the Leadership & CEO Profiles page and the admin console.
 * Backed by the `leader_profiles` table in Supabase.
 */
@Injectable({ providedIn: 'root' })
export class LeadersService {
  /** Every profile, newest first. */
  readonly all = signal<Leader[]>([]);
  readonly loaded = signal(false);

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase.from('leader_profiles').select('*').order('created_at', { ascending: false });
    if (error) console.error('Could not load leader profiles:', error.message);
    this.all.set((data ?? []).map(toLeader));
    this.loaded.set(true);
  }

  findBySlug(slug: string): Leader | undefined {
    return this.all().find(l => leaderSlug(l.name) === slug);
  }

  async save(l: Leader): Promise<SaveResult> {
    const row = {
      slug: leaderSlug(l.name),
      name: l.name.trim(),
      title: l.title.trim(),
      company: l.company.trim(),
      region: l.region,
      tenure: l.since?.trim() || null,
      quote: l.quote.trim(),
      bio: l.bio?.trim() || null,
      image_url: l.img || null,
      image_key: l.imgKey ?? null
    };
    const { error } = l.id
      ? await supabase.from('leader_profiles').update(row).eq('id', l.id)
      : await supabase.from('leader_profiles').insert(row);
    if (error) {
      return { error: error.code === UNIQUE_VIOLATION ? 'A profile with this name already exists.' : dbError(error) };
    }
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('leader_profiles').delete().eq('id', id);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }
}

function toLeader(r: any): Leader {
  return {
    id: r.id, name: r.name, title: r.title, company: r.company, region: r.region, quote: r.quote,
    img: r.image_url ?? '', imgKey: r.image_key, since: r.tenure ?? '', bio: r.bio ?? undefined, createdAt: r.created_at
  };
}
