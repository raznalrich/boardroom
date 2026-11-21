import { Injectable, computed, signal } from '@angular/core';
import { supabase } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface RoundtableGuest {
  id: string;
  name: string;
  role: string;
  organisation: string;
  image: string;
  imageKey?: string | null;
}

export interface PowerListPerson {
  id: string;
  rank: number;
  name: string;
  /** The line shown under the name */
  headline: string;
  image: string;
  imageKey?: string | null;
}

export interface IntelligenceReport {
  title: string;
  description: string;
  pdfUrl: string;
  pdfKey?: string | null;
  pdfName: string;
}

/** Shown on the public site only while the database has no rows yet (e.g. before supabase/settings.sql is run). */
const DEFAULT_GUESTS: RoundtableGuest[] = [
  { id: 'd1', name: 'Tariq Al-Mansoor', role: 'Regional CEO', organisation: 'Gulf Investments', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop' },
  { id: 'd2', name: 'Sunita Sharma', role: 'Managing Director', organisation: 'Apex Logistics India', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' },
  { id: 'd3', name: 'Zaid Al-Hassan', role: 'Chief Strategy Officer', organisation: 'Middle East Tech Ventures', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop' }
];

const DEFAULT_POWER_LIST: PowerListPerson[] = [
  { id: 'd1', rank: 1, name: 'Vikramaditya Singh', headline: 'Regional Leader', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
  { id: 'd2', rank: 2, name: 'Siddharth Mehta', headline: 'Business Leader', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80' },
  { id: 'd3', rank: 3, name: 'Nasser Al-Kharafi', headline: 'Astute CEO', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80' },
  { id: 'd4', rank: 4, name: 'Ramesh Iyer', headline: 'Chief Executive', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80' },
  { id: 'd5', rank: 5, name: 'Omar Al-Futtaim', headline: 'Enterprise Transformation', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80' },
  { id: 'd6', rank: 6, name: 'Karan Adani', headline: 'Industry Leader', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' }
];

/**
 * The three editable blocks on the home page (Admin -> Settings):
 * the Boardroom Roundtable guests, the Power List and the Executive Intelligence Report.
 * Backed by `roundtable_guests`, `power_list_people` and `intelligence_report`.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly roundtable = signal<RoundtableGuest[]>([]);
  readonly powerList = signal<PowerListPerson[]>([]);
  readonly report = signal<IntelligenceReport | null>(null);
  readonly loaded = signal(false);

  /** What the public home page shows: the database rows, or the defaults while there are none. */
  readonly roundtableShown = computed(() => (this.roundtable().length ? this.roundtable() : DEFAULT_GUESTS));
  readonly powerListShown = computed(() => (this.powerList().length ? this.powerList() : DEFAULT_POWER_LIST));

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const [rt, pl, rp] = await Promise.all([
      supabase.from('roundtable_guests').select('*').order('sort_order', { ascending: true }),
      supabase.from('power_list_people').select('*').order('rank', { ascending: true }),
      supabase.from('intelligence_report').select('*').eq('id', 1).maybeSingle()
    ]);
    if (rt.error) console.error('Could not load roundtable guests:', rt.error.message);
    if (pl.error) console.error('Could not load power list:', pl.error.message);
    if (rp.error) console.error('Could not load report:', rp.error.message);

    this.roundtable.set((rt.data ?? []).map((r: any) => ({
      id: r.id, name: r.name, role: r.role, organisation: r.organisation ?? '', image: r.image_url ?? '', imageKey: r.image_key
    })));
    this.powerList.set((pl.data ?? []).map((r: any) => ({
      id: r.id, rank: r.rank, name: r.name, headline: r.headline ?? '', image: r.image_url ?? '', imageKey: r.image_key
    })));
    const r: any = rp.data;
    this.report.set(r ? { title: r.title, description: r.description ?? '', pdfUrl: r.pdf_url ?? '', pdfKey: r.pdf_key, pdfName: r.pdf_name ?? '' } : null);
    this.loaded.set(true);
  }

  async saveGuest(g: Omit<RoundtableGuest, 'id'> & { id: string }): Promise<SaveResult> {
    const { error } = await supabase.from('roundtable_guests').update({
      name: g.name.trim(), role: g.role.trim(), organisation: g.organisation.trim(), image_url: g.image || null, image_key: g.imageKey ?? null
    }).eq('id', g.id);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }

  async savePerson(p: PowerListPerson): Promise<SaveResult> {
    const { error } = await supabase.from('power_list_people').update({
      rank: p.rank, name: p.name.trim(), headline: p.headline.trim(), image_url: p.image || null, image_key: p.imageKey ?? null
    }).eq('id', p.id);
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }

  /** Heading, description and PDF of the report. An empty pdfUrl removes the PDF. */
  async saveReport(r: IntelligenceReport): Promise<SaveResult> {
    const { error } = await supabase.from('intelligence_report').upsert({
      id: 1, title: r.title.trim(), description: r.description.trim(),
      pdf_url: r.pdfUrl || null, pdf_key: r.pdfUrl ? r.pdfKey ?? null : null, pdf_name: r.pdfUrl ? r.pdfName || null : null
    });
    if (error) return { error: error.message };
    await this.refresh();
    return { error: null };
  }
}
