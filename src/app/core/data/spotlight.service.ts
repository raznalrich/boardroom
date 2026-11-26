import { Injectable, computed, signal } from '@angular/core';
import { supabase, dbError } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface Spotlight {
  id: string;
  name: string;
  role: string;
  summary: string;
  image: string;
  imageKey?: string | null;
  sortOrder: number;
  active: boolean;
}

/** Shown on the home page only while the database has no active slides (e.g. before supabase/spotlight.sql is run). */
export const DEFAULT_SPOTLIGHT: Spotlight[] = [
  { id: 'default-0', name: 'Layla Haddad', role: 'Chief Executive Officer', image: 'assets/images/3-removebg-preview.png', sortOrder: 1, active: true,
    summary: 'A decisive builder of regional brands, Layla blends bold strategy with human-centred leadership, guiding her teams through growth, transformation and change with calm conviction.' },
  { id: 'default-1', name: 'Rafael Mendes', role: 'Chairman & Managing Partner', image: 'assets/images/4-removebg-preview.png', sortOrder: 2, active: true,
    summary: 'With two decades in boardrooms across three continents, Rafael is known for disciplined capital allocation and for turning complex governance challenges into lasting value.' },
  { id: 'default-2', name: 'Daniel Tran', role: 'Group Chief Strategy Officer', image: 'assets/images/5-removebg-preview.png', sortOrder: 3, active: true,
    summary: 'Daniel leads cross-border expansion and digital strategy, pairing sharp analytical thinking with a quiet, relentless focus on execution and long-term partnerships.' }
];

/** Slides of the home page top slideshow and the admin Spotlight tab. Backed by the `spotlight_leaders` table. */
@Injectable({ providedIn: 'root' })
export class SpotlightService {
  /** Every slide the current user may see, in display order. */
  readonly all = signal<Spotlight[]>([]);
  readonly loaded = signal(false);

  /** What the public slideshow shows: active slides, or the samples while there are none. */
  readonly shown = computed(() => {
    const active = this.all().filter(s => s.active);
    return active.length ? active : DEFAULT_SPOTLIGHT;
  });

  constructor() { void this.refresh(); }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('spotlight_leaders').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) console.error('Could not load spotlight slides:', error.message);
    this.all.set((data ?? []).map(toSpotlight));
    this.loaded.set(true);
  }

  async save(s: Omit<Spotlight, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = {
      name: s.name.trim(), role: s.role.trim(), summary: s.summary.trim(),
      image_url: s.image || null, image_key: s.imageKey ?? null, sort_order: s.sortOrder, is_active: s.active
    };
    const { error } = s.id
      ? await supabase.from('spotlight_leaders').update(row).eq('id', s.id)
      : await supabase.from('spotlight_leaders').insert(row);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('spotlight_leaders').delete().eq('id', id);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }
}

function toSpotlight(r: any): Spotlight {
  return {
    id: r.id, name: r.name, role: r.role, summary: r.summary ?? '',
    image: r.image_url ?? '', imageKey: r.image_key, sortOrder: r.sort_order, active: r.is_active !== false
  };
}
