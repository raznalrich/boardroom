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
  /** Where "Register now" sends the visitor ('' when not set) */
  registerUrl: string;
  /** Text for the details pop-up ('' when not set) */
  description: string;
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

/**
 * When the event starts: its date plus the first clock time found in the time text
 * (e.g. "09:00 – 18:00" or "15:00 GST" -> 09:00 / 15:00). Uses the viewer's local time; midnight if no time is given.
 */
export function eventStart(e: AppEvent): Date {
  const m = /(\d{1,2}):(\d{2})/.exec(e.time ?? '');
  const [y, mo, d] = e.date.split('-').map(Number);
  return new Date(y, mo - 1, d, m ? Math.min(23, +m[1]) : 0, m ? Math.min(59, +m[2]) : 0, 0);
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
  /** True once the database returns the registration columns (see supabase/events-register.sql). */
  private hasExtraColumns = false;

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
    this.hasExtraColumns = !!data?.length && 'register_url' in data[0];
    this.all.set((data ?? []).map(toEvent));
    this.loaded.set(true);
  }

  isPast(e: AppEvent): boolean {
    return e.date < todayIso();
  }

  async save(e: Omit<AppEvent, 'id'> & { id?: string }): Promise<SaveResult> {
    const row: Record<string, unknown> = { title: e.title.trim(), type: e.type, event_date: e.date, time_label: e.time.trim(), city: e.city.trim(), seats: e.seats };
    // only send the new columns once they exist (or when they are being used), so saving never breaks before the SQL is run
    if (this.hasExtraColumns || e.registerUrl.trim() || e.description.trim()) {
      row['register_url'] = e.registerUrl.trim() || null;
      row['description'] = e.description.trim() || null;
    }
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
  return {
    id: r.id, title: r.title, type: r.type, date: r.event_date, time: r.time_label, city: r.city, seats: r.seats,
    registerUrl: r.register_url ?? '', description: r.description ?? ''
  };
}
