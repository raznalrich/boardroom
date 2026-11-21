import { Injectable, computed, signal } from '@angular/core';
import { supabase } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export const EVENT_TYPES = ['Summit', 'Dinner', 'Webinar', 'Keynote'] as const;
export const EVENT_SEATS = ['Open', 'Few seats left', 'Invitation only', 'Sold out'] as const;

export interface AppEvent {
  id: string;
  title: string;
  type: string;
  date: string; // yyyy-mm-dd
  time: string;
  city: string;
  seats: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function eventDay(date: string): string {
  return date.slice(8, 10);
}

export function eventMonth(date: string): string {
  return MONTHS[+date.slice(5, 7) - 1] ?? '';
}

export function eventYear(date: string): string {
  return date.slice(0, 4);
}

function todayIso(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Events shown on the home page, the Events page and the admin console.
 * Backed by the `events` table in Supabase.
 */
@Injectable({ providedIn: 'root' })
export class EventsService {
  /** Every event, soonest first. */
  readonly all = signal<AppEvent[]>([]);
  readonly loaded = signal(false);

  /** Only events that have not happened yet. */
  readonly upcoming = computed<AppEvent[]>(() => {
    const today = todayIso();
    return this.all().filter(e => e.date >= today);
  });

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (error) console.error('Could not load events:', error.message);
    this.all.set((data ?? []).map(toEvent));
    this.loaded.set(true);
  }

  isPast(e: AppEvent): boolean {
    return e.date < todayIso();
  }

  async save(e: Omit<AppEvent, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = { title: e.title.trim(), type: e.type, event_date: e.date, time_label: e.time.trim(), city: e.city.trim(), seats: e.seats };
    const { error } = e.id
      ? await supabase.from('events').update(row).eq('id', e.id)
      : await supabase.from('events').insert(row);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }
}

function toEvent(r: any): AppEvent {
  return { id: r.id, title: r.title, type: r.type, date: r.event_date, time: r.time_label, city: r.city, seats: r.seats };
}
