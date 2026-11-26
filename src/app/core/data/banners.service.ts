import { Injectable, computed, signal } from '@angular/core';
import { supabase, dbError } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface Banner {
  id: string;
  tag: string;
  title: string;
  author: string;
  readMins: number;
  bullets: string[];
  /** Image URL (R2 or any https image) */
  image: string;
  imageKey?: string | null;
  sortOrder: number;
  active: boolean;
}

/**
 * Banners for the home page slider (the "top articles"). Backed by the `banners` table in Supabase.
 * Visitors only receive active banners; the admin console receives all of them.
 */
@Injectable({ providedIn: 'root' })
export class BannersService {
  /** Every banner the current user may see, in display order. */
  readonly all = signal<Banner[]>([]);
  readonly loaded = signal(false);

  /** What the home page slider shows. */
  readonly active = computed(() => this.all().filter(b => b.active));

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('banners').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) console.error('Could not load banners:', error.message);
    this.all.set((data ?? []).map(toBanner));
    this.loaded.set(true);
  }

  async save(b: Omit<Banner, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = {
      tag: b.tag.trim().toUpperCase(), title: b.title.trim(), author: b.author.trim(), read_mins: b.readMins,
      bullets: b.bullets.map(x => x.trim()).filter(Boolean), image_url: b.image || null, image_key: b.imageKey ?? null,
      sort_order: b.sortOrder, is_active: b.active
    };
    const { error } = b.id
      ? await supabase.from('banners').update(row).eq('id', b.id)
      : await supabase.from('banners').insert(row);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }
}

function toBanner(r: any): Banner {
  return {
    id: r.id, tag: r.tag, title: r.title, author: r.author, readMins: r.read_mins, bullets: r.bullets ?? [],
    image: r.image_url ?? '', imageKey: r.image_key, sortOrder: r.sort_order, active: r.is_active
  };
}
