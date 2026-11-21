import { Injectable, computed, signal } from '@angular/core';
import { supabase } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface Article {
  id: string;
  title: string;
  category: string;
  author: string;
  summary: string;
  content: string;
  readMins: number;
  /** Cover image URL (R2 or any https image) */
  image: string;
  imageKey?: string | null;
  status: 'Published' | 'Draft';
  createdAt: string; // ISO
}

/**
 * Articles shown in the home "Sector Deep Dives" section and on the Articles page, managed in the admin console.
 * Backed by the `articles` table. Visitors only receive published rows; admins receive everything.
 */
@Injectable({ providedIn: 'root' })
export class ArticlesService {
  /** Every article the current user may see, newest first. */
  readonly all = signal<Article[]>([]);
  readonly loaded = signal(false);

  /** Published articles only (what the public site shows). */
  readonly published = computed(() => this.all().filter(a => a.status === 'Published'));

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (error) console.error('Could not load articles:', error.message);
    this.all.set((data ?? []).map(toArticle));
    this.loaded.set(true);
  }

  async save(a: Omit<Article, 'id' | 'createdAt' | 'readMins'> & { id?: string; readMins?: number }): Promise<SaveResult> {
    const row = {
      title: a.title.trim(), category: a.category, author: a.author.trim(), summary: a.summary.trim(), content: a.content.trim(),
      read_mins: a.readMins ?? 5, image_url: a.image || null, image_key: a.imageKey ?? null,
      status: a.status === 'Published' ? 'published' : 'draft'
    };
    const { error } = a.id
      ? await supabase.from('articles').update(row).eq('id', a.id)
      : await supabase.from('articles').insert(row);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }
}

function toArticle(r: any): Article {
  return {
    id: r.id, title: r.title, category: r.category, author: r.author, summary: r.summary ?? '', content: r.content ?? '',
    readMins: r.read_mins, image: r.image_url ?? '', imageKey: r.image_key,
    status: r.status === 'published' ? 'Published' : 'Draft', createdAt: r.created_at
  };
}
