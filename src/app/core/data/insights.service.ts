import { Injectable, signal } from '@angular/core';
import { supabase } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export const INSIGHT_CATEGORIES = ['Economy', 'Strategy', 'Technology', 'Sustainability', 'Finance'] as const;

export interface Insight {
  id: string;
  category: string;
  title: string;
  summary: string;
  /** Elaborate summary shown on the insight's own page (paragraphs separated by blank lines). */
  details?: string;
  author: string;
  mins: number;
  date: string; // yyyy-mm-dd
  /** Image URL (R2 or any https image) */
  img: string;
  imgKey?: string | null;
}

/** Image URL for an insight. Full URLs pass through; empty stays empty. */
export function insightImage(img: string, _width = 800): string {
  return img ?? '';
}

/**
 * Insights shown on the public Insights page, the home "Latest Insights" strip and the admin console.
 * Backed by the `insights` table in Supabase.
 */
@Injectable({ providedIn: 'root' })
export class InsightsService {
  /** All insights, newest first. */
  readonly all = signal<Insight[]>([]);
  readonly loaded = signal(false);

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('insights').select('*')
      .order('published_on', { ascending: false }).order('created_at', { ascending: false });
    if (error) console.error('Could not load insights:', error.message);
    this.all.set((data ?? []).map(toInsight));
    this.loaded.set(true);
  }

  findById(id: string): Insight | undefined {
    return this.all().find(i => i.id === id);
  }

  async save(i: Omit<Insight, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = {
      category: i.category, title: i.title.trim(), summary: i.summary.trim(), details: i.details?.trim() || null,
      author: i.author.trim(), read_mins: i.mins, published_on: i.date, image_url: i.img || null, image_key: i.imgKey ?? null
    };
    const { error } = i.id
      ? await supabase.from('insights').update(row).eq('id', i.id)
      : await supabase.from('insights').insert(row);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('insights').delete().eq('id', id);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }
}

function toInsight(r: any): Insight {
  return {
    id: r.id, category: r.category, title: r.title, summary: r.summary, details: r.details ?? undefined,
    author: r.author, mins: r.read_mins, date: r.published_on, img: r.image_url ?? '', imgKey: r.image_key
  };
}
