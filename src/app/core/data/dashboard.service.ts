import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase/supabase';
import { ArticlesService } from './articles.service';
import { EventsService } from './events.service';
import { InsightsService } from './insights.service';
import { LeadersService } from './leaders.service';

export interface DailyStat { day: string; visitors: number; views: number; }
export interface SectionStat { section: string; views: number; }
export interface DashboardStats {
  total_visitors: number;
  total_views: number;
  visitors_today: number;
  views_today: number;
  online_now: number;
  subscribers: number;
  daily: DailyStat[];
  sections: SectionStat[];
}

/**
 * Live numbers for the admin dashboard.
 * Totals come from the `dashboard_stats()` database function (see supabase/dashboard.sql).
 * Updates arrive instantly through a Supabase Realtime broadcast; a 15-second refresh is kept as a safety net.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService implements OnDestroy {
  private articles = inject(ArticlesService);
  private insights = inject(InsightsService);
  private events = inject(EventsService);
  private leaders = inject(LeadersService);

  readonly stats = signal<DashboardStats | null>(null);
  readonly error = signal('');
  readonly loading = signal(false);
  /** 'live' once the realtime channel is connected, otherwise we rely on the periodic refresh */
  readonly connection = signal<'connecting' | 'live' | 'polling'>('connecting');
  readonly updatedAt = signal<Date | null>(null);
  /** Number of days shown in the chart */
  readonly days = signal(7);

  private channel: RealtimeChannel | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private pending: ReturnType<typeof setTimeout> | null = null;

  start(): void {
    if (this.channel) return;
    void this.refreshAll();

    this.channel = supabase
      .channel('dashboard')
      .on('broadcast', { event: 'change' }, () => this.scheduleRefresh())
      .subscribe(status => {
        if (status === 'SUBSCRIBED') this.connection.set('live');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') this.connection.set('polling');
      });

    this.timer = setInterval(() => void this.refreshAll(), 15000);
  }

  stop(): void {
    if (this.channel) {
      void supabase.removeChannel(this.channel);
      this.channel = null;
    }
    if (this.timer) clearInterval(this.timer);
    if (this.pending) clearTimeout(this.pending);
    this.timer = this.pending = null;
  }

  ngOnDestroy(): void {
    this.stop();
  }

  setDays(n: number): void {
    this.days.set(n);
    void this.refreshStats();
  }

  /** Several changes can arrive together (e.g. a burst of visits): refresh once, shortly after the last one. */
  private scheduleRefresh(): void {
    if (this.pending) clearTimeout(this.pending);
    this.pending = setTimeout(() => void this.refreshAll(), 400);
  }

  async refreshAll(): Promise<void> {
    await Promise.all([
      this.refreshStats(),
      this.articles.refresh(),
      this.insights.refresh(),
      this.events.refresh(),
      this.leaders.refresh()
    ]);
  }

  async refreshStats(): Promise<void> {
    this.loading.set(this.stats() === null);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const { data, error } = await supabase.rpc('dashboard_stats', { p_days: this.days(), p_tz: tz });
    if (error) {
      this.error.set(error.message);
    } else {
      this.error.set('');
      this.stats.set(data as DashboardStats);
      this.updatedAt.set(new Date());
    }
    this.loading.set(false);
  }
}
