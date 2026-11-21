import { Injectable, signal } from '@angular/core';
import { supabase, UNIQUE_VIOLATION } from '../supabase/supabase';

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  date: string; // ISO
  source: string;
}

/**
 * People who signed up through the website's "Get in touch" form (`subscribers` table).
 * Visitors can only INSERT; reading the list requires an admin login (enforced by Row Level Security).
 */
@Injectable({ providedIn: 'root' })
export class SubscribersService {
  /** Filled by refresh(); only admins receive rows. */
  readonly all = signal<Subscriber[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  async refresh(): Promise<void> {
    this.loading.set(true);
    const { data, error } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    this.error.set(error ? error.message : '');
    this.all.set((data ?? []).map((r: any) => ({ id: r.id, name: r.name, email: r.email, date: r.created_at, source: r.source })));
    this.loading.set(false);
  }

  /** Adds a subscriber. Returns 'duplicate' if the email is already subscribed. */
  async add(name: string, email: string, source = 'Get in touch'): Promise<'ok' | 'duplicate' | 'error'> {
    const { error } = await supabase.from('subscribers').insert({ name: name.trim(), email: email.trim(), source });
    if (!error) return 'ok';
    if (error.code === UNIQUE_VIOLATION) return 'duplicate';
    console.error('Could not save subscriber:', error.message);
    return 'error';
  }
}
