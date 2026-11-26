import { Injectable, computed, signal } from '@angular/core';
import { supabase, dbError } from '../supabase/supabase';
import { SaveResult } from './leaders.service';

export interface Woman {
  id: string;
  name: string;
  role: string;
  organisation: string;
  quote: string;
  /** Short summary shown on the profile page */
  bio: string;
  /** Photo URL on Cloudflare R2 (or any https image) */
  image: string;
  imageKey?: string | null;
  sortOrder: number;
  active: boolean;
}

/** Shown on the public site only while the database has no profiles yet (e.g. before supabase/women.sql is run). */
const DEFAULT_WOMEN: Woman[] = [
  ['Aisha Al-Falasi', 'Group CEO', 'Gulf Renewables', 'Leadership is the courage to open doors for the next woman in line.', 'photo-1573496359142-b8d87734a5a2', "Aisha leads Gulf Renewables, one of the region's fastest-growing clean-energy groups. Under her leadership the company has tripled its capacity in five years while building one of the industry's most diverse leadership teams. She mentors young engineers and sits on two national sustainability councils."],
  ['Meera Kapoor', 'Managing Director', 'Kapoor Logistics', 'Great teams are built on trust, and on giving people room to grow.', 'photo-1580489944761-15a19d654956', "Meera took over her family's logistics business and turned it into a multi-country operation with a reputation for reliability. She is known for investing in people first, from driver training programmes to a fast-track path for women into operations management."],
  ['Noor Al-Thani', 'Chief Financial Officer', 'Doha Capital', 'Numbers tell a story. My job is to make sure it is an honest one.', 'photo-1573497019940-1c28c88b4f3e', 'Noor oversees finance, risk and investor relations at Doha Capital. A former auditor, she is respected for plain-spoken reporting and disciplined capital allocation, and she chairs an initiative that teaches financial literacy to women entrepreneurs.'],
  ['Priya Raghavan', 'Founder & CEO', 'HealthBridge', 'Innovation is simply empathy at scale.', 'photo-1494790108377-be9c29b29330', 'Priya founded HealthBridge after seeing how hard it was for families to reach specialist care. The platform now connects patients and clinics across three countries. She speaks widely on building technology that is trusted with sensitive health data.'],
  ['Dr. Hana Mansour', 'Chief Medical Officer', 'Horizon Health', 'Care and excellence are not opposites. They are the same standard.', 'photo-1534528741775-53994a69daeb', 'Dr. Mansour is Chief Medical Officer at Horizon Health, where she leads clinical quality across a network of hospitals. A practising physician for twenty years, she champions patient-safety standards and the training of the next generation of clinical leaders.'],
  ['Sofia Almeida', 'Chief Strategy Officer', 'Meridian Global', 'Strategy is deciding what you will not do, then doing the rest brilliantly.', 'photo-1438761681033-6461ffad8d80', 'Sofia shapes the long-term direction of Meridian Global, from market entry to partnerships. Her approach is to decide clearly what the company will not do, then execute the rest with focus. She is a frequent speaker on strategy in emerging markets.'],
  ['Fatima Zahra', 'Chair', 'Najd Education Trust', 'Educating a woman strengthens an entire community.', 'photo-1544005313-94ddf0286df2', 'Fatima chairs the Najd Education Trust, which funds scholarships and school-leadership programmes. She believes that educating a woman strengthens a whole community, and has helped thousands of girls complete their studies.'],
  ['Ananya Rao', 'Chief Technology Officer', 'NeuraGulf', 'Build products you would trust with your own family’s data.', 'photo-1487412720507-e7ab37603c6f', 'Ananya is Chief Technology Officer at NeuraGulf, where she leads work on applied AI for energy and finance. She is a vocal advocate for responsible AI and runs an engineering fellowship that has placed more than a hundred women in technical roles.']
].map(([name, role, organisation, quote, photo, bio], i) => ({
  id: 'default-' + i, name, role, organisation, quote, bio, sortOrder: i + 1, active: true,
  image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=800&q=80`
}));

/**
 * Profiles for the home page's Women Empowerment section and the admin console.
 * Backed by the `women_profiles` table in Supabase.
 */
@Injectable({ providedIn: 'root' })
export class WomenService {
  /** Every profile the current user may see, in display order (admins see hidden ones too). */
  readonly all = signal<Woman[]>([]);
  readonly loaded = signal(false);

  /** What the public section rotates through: active profiles, or the defaults while there are none. */
  readonly shown = computed(() => {
    const active = this.all().filter(w => w.active);
    return active.length ? active : DEFAULT_WOMEN;
  });

  constructor() {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const { data, error } = await supabase
      .from('women_profiles').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) console.error('Could not load women profiles:', error.message);
    this.all.set((data ?? []).map(toWoman));
    this.loaded.set(true);
  }

  async save(w: Omit<Woman, 'id'> & { id?: string }): Promise<SaveResult> {
    const row = {
      name: w.name.trim(), role: w.role.trim(), organisation: w.organisation.trim(), quote: w.quote.trim(), bio: (w.bio ?? '').trim(),
      image_url: w.image || null, image_key: w.imageKey ?? null, sort_order: w.sortOrder, is_active: w.active
    };
    const { error } = w.id
      ? await supabase.from('women_profiles').update(row).eq('id', w.id)
      : await supabase.from('women_profiles').insert(row);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }

  async remove(id: string): Promise<SaveResult> {
    const { error } = await supabase.from('women_profiles').delete().eq('id', id);
    if (error) return { error: dbError(error) };
    await this.refresh();
    return { error: null };
  }
}

function toWoman(r: any): Woman {
  return {
    id: r.id, name: r.name, role: r.role, organisation: r.organisation ?? '', quote: r.quote ?? '', bio: r.bio ?? '',
    image: r.image_url ?? '', imageKey: r.image_key, sortOrder: r.sort_order, active: r.is_active !== false
  };
}
