import { Injectable, computed, signal } from '@angular/core';
import { supabase, dbError } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  isMember: boolean;
}

/** Membership applications (admin Membership tab) and the "is this email a member?" check used by magazine downloads. */
@Injectable({ providedIn: 'root' })
export class MembershipService {
  readonly all = signal<Application[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly pending = computed(() => this.all().filter(a => a.status === 'new' || a.status === 'contacted'));
  readonly approved = computed(() => this.all().filter(a => a.status === 'approved'));
  readonly declined = computed(() => this.all().filter(a => a.status === 'rejected'));

  async refresh(): Promise<void> {
    this.loading.set(true);
    const { data, error } = await supabase.from('membership_applications').select('*').order('created_at', { ascending: false });
    this.error.set(error ? error.message : '');
    this.all.set((data ?? []).map((r: any) => ({
      id: r.id, name: r.name, email: r.email, phone: r.phone ?? '', date: r.created_at,
      status: r.status ?? 'new', isMember: r.is_member === true
    })));
    this.loading.set(false);
  }

  /** Approve (is_member = true) or decline (is_member = false) an application. */
  async decide(id: string, approve: boolean): Promise<SaveResult> {
    const { data, error } = await supabase.from('membership_applications')
      .update({ status: approve ? 'approved' : 'rejected', is_member: approve }).eq('id', id).select('id');
    if (error) return { error: dbError(error) };
    if (!data?.length) return { error: 'Nothing was updated. Run supabase/membership.sql in the Supabase SQL Editor to allow this.' };
    await this.refresh();
    return { error: null };
  }

  /** Public check used before a magazine download: is this email an approved member? */
  async isMember(email: string): Promise<boolean | 'error'> {
    const { data, error } = await supabase.rpc('check_member', { p_email: email });
    if (error) { console.error('Member check failed:', error.message); return 'error'; }
    return data === true;
  }
}
