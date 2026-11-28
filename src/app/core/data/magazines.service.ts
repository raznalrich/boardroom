import { Injectable, computed, signal } from '@angular/core';
import { supabase, dbError } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

/** Regions magazines are filed under, in display order. */
export const MAGAZINE_REGIONS = ['Middle East', 'Asia', 'Africa', 'America', 'Europe'] as const;
export type MagazineRegion = (typeof MAGAZINE_REGIONS)[number];

export interface Magazine {
  region: MagazineRegion;
  id: string;
  title: string;
  description: string;
  /** Cover image URL on Cloudflare R2 ('' when none was uploaded) */
  cover: string;
  coverKey?: string | null;
  /** PDF URL on Cloudflare R2 */
  pdfUrl: string;
  pdfKey?: string | null;
  publishedOn: string; // yyyy-mm-dd
  active: boolean;
}

/**
 * E-Magazine issues for the home page, the E-Magazine page and the admin console.
 * Backed by the `magazines` table; the cover image and PDF are stored on Cloudflare R2.
 */
@Injectable({ providedIn: 'root' })
export class MagazinesService {
  /** Every magazine the current user may see, newest first. */
  readonly all = signal<Magazine[]>([]);
  readonly loaded = signal(false);

  /** What the public site shows: enabled magazines only. */
  readonly active = computed(() => this.all().filter(m => m.active));

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('magazines').select('*')
      .order('published_on', { ascending: false }).order('created_at', { ascending: false });
    if (error) console.error('Could not load magazines:', error.message);
    this.all.set((data ?? []).map(toMagazine));
    this.loaded.set(true);
  }

  async save(m: Omit<Magazine, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = {
      title: m.title.trim(),
      description: m.description.trim() || null,
      issue_label: new Date(m.publishedOn + 'T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      cover_image_url: m.cover || null,
      cover_image_key: m.coverKey ?? null,
      pdf_url: m.pdfUrl,
      pdf_key: m.pdfKey ?? null,
      published_on: m.publishedOn,
      is_active: m.active,
      region: m.region
    };
    const { error } = m.id
      ? await supabase.from('magazines').update(row).eq('id', m.id)
      : await supabase.from('magazines').insert(row);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('magazines').delete().eq('id', id);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }
}

function toMagazine(r: any): Magazine {
  return {
    region: (MAGAZINE_REGIONS as readonly string[]).includes(r.region) ? r.region : 'Middle East',
    id: r.id, title: r.title, description: r.description ?? '', cover: r.cover_image_url ?? '', coverKey: r.cover_image_key,
    pdfUrl: r.pdf_url, pdfKey: r.pdf_key, publishedOn: r.published_on, active: r.is_active !== false
  };
}
