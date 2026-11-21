import { Injectable, computed, signal } from '@angular/core';
import { supabase, UNIQUE_VIOLATION } from '../supabase/supabase';

export type LeadSource = 'Get in touch' | 'Membership application';

/** One person who left their details on the website: a "Get in touch" sign-up or a membership application. */
export interface Lead {
  /** unique across both tables */
  key: string;
  name: string;
  email: string;
  /** Only membership applications ask for a phone number */
  phone: string;
  date: string; // ISO
  source: LeadSource;
  /** Membership applications only: new / contacted / approved / rejected */
  status: string;
}

/**
 * People who left their details on the website, for the admin "Subscribers" tab:
 *  - `subscribers`            : the "Get in touch" form (name, email)
 *  - `membership_applications`: the "Apply for membership" pop-up (name, phone, email)
 * Visitors can only INSERT. Reading needs the policies in supabase/admin-read-leads.sql.
 */
@Injectable({ providedIn: 'root' })
export class SubscribersService {
  /** Both lists merged, newest first. Filled by refresh(). */
  readonly leads = signal<Lead[]>([]);
  readonly loading = signal(false);
  /** Messages for whichever table could not be read */
  readonly errors = signal<string[]>([]);

  readonly subscriberCount = computed(() => this.leads().filter(l => l.source === 'Get in touch').length);
  readonly applicationCount = computed(() => this.leads().filter(l => l.source === 'Membership application').length);

  async refresh(): Promise<void> {
    this.loading.set(true);
    const [subs, apps] = await Promise.all([
      supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
      supabase.from('membership_applications').select('*').order('created_at', { ascending: false })
    ]);

    const errors: string[] = [];
    if (subs.error) errors.push(`Subscribers: ${subs.error.message}`);
    if (apps.error) errors.push(`Membership applications: ${apps.error.message}`);
    this.errors.set(errors);

    const fromSubs: Lead[] = (subs.data ?? []).map((r: any) => ({
      key: 's-' + r.id, name: r.name, email: r.email, phone: '', date: r.created_at, source: 'Get in touch', status: ''
    }));
    const fromApps: Lead[] = (apps.data ?? []).map((r: any) => ({
      key: 'a-' + r.id, name: r.name, email: r.email, phone: r.phone ?? '', date: r.created_at, source: 'Membership application', status: r.status ?? 'new'
    }));
    this.leads.set([...fromSubs, ...fromApps].sort((a, b) => b.date.localeCompare(a.date)));
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
