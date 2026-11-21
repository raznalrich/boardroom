import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AdminArticlesComponent } from '../admin-articles/admin-articles.component';
import { AdminProfilesComponent } from '../admin-profiles/admin-profiles.component';
import { AdminEventsComponent } from '../admin-events/admin-events.component';
import { AdminSubscribersComponent } from '../admin-subscribers/admin-subscribers.component';
import { AdminInsightsComponent } from '../admin-insights/admin-insights.component';
import { AdminBannersComponent } from '../admin-banners/admin-banners.component';
import { AdminMagazinesComponent } from '../admin-magazines/admin-magazines.component';
import { AdminAuthService } from '../../../core/auth/admin-auth.service';
import { ArticlesService } from '../../../core/data/articles.service';
import { DashboardService } from '../../../core/data/dashboard.service';
import { InsightsService } from '../../../core/data/insights.service';
import { LeadersService } from '../../../core/data/leaders.service';

interface ActivityItem { text: string; when: Date; }

const SECTION_NAMES: Record<string, string> = {
  'home': 'Home', 'markets': 'Markets', 'insights': 'Insights', 'articles': 'Articles', 'leadership-profiles': 'Leadership',
  'network': 'The Network', 'events': 'Events', 'e-magazine': 'E-Magazine', 'submit-blog': 'Submit a blog', 'submit-magazine': 'Submit a magazine'
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminArticlesComponent, AdminProfilesComponent, AdminEventsComponent, AdminSubscribersComponent, AdminInsightsComponent, AdminBannersComponent, AdminMagazinesComponent, DatePipe, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private auth = inject(AdminAuthService);
  private router = inject(Router);
  readonly dash = inject(DashboardService);
  private articlesSvc = inject(ArticlesService);
  private insightsSvc = inject(InsightsService);
  private leadersSvc = inject(LeadersService);

  nav = ['Dashboard', 'Banners', 'Articles', 'Insights', 'Profiles', 'Events', 'Subscribers', 'E-Magazine', 'Settings'];
  activeNav = signal('Dashboard');
  sidebarOpen = signal(false);

  readonly ranges = [7, 14, 30];

  stats = this.dash.stats;

  /** Daily visitors as bars, scaled to the busiest day. */
  bars = computed(() => {
    const daily = this.stats()?.daily ?? [];
    const max = Math.max(1, ...daily.map(d => d.visitors));
    const short = daily.length <= 7;
    return daily.map(d => {
      const date = new Date(d.day + 'T00:00:00');
      return {
        label: date.toLocaleDateString(undefined, short ? { weekday: 'short' } : { day: 'numeric', month: 'short' }),
        visitors: d.visitors,
        views: d.views,
        height: d.visitors === 0 ? 2 : Math.max(6, Math.round((d.visitors / max) * 100)),
        title: `${date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}: ${d.visitors} visitor${d.visitors === 1 ? '' : 's'}, ${d.views} page view${d.views === 1 ? '' : 's'}`
      };
    });
  });

  chartTotal = computed(() => (this.stats()?.daily ?? []).reduce((n, d) => n + d.visitors, 0));

  sections = computed(() => {
    const list = this.stats()?.sections ?? [];
    const total = list.reduce((n, s) => n + s.views, 0) || 1;
    return list.map(s => ({
      name: SECTION_NAMES[s.section] ?? (s.section.charAt(0).toUpperCase() + s.section.slice(1)),
      views: s.views,
      pct: Math.round((s.views / total) * 100)
    }));
  });

  publishedCount = computed(() => this.articlesSvc.published().length);
  draftCount = computed(() => this.articlesSvc.all().length - this.publishedCount());

  /** The five newest articles uploaded to Supabase. */
  recentArticles = computed(() => this.articlesSvc.all().slice(0, 5));

  /** Newest uploads across articles, insights and leader profiles. */
  activity = computed<ActivityItem[]>(() => {
    const items: ActivityItem[] = [
      ...this.articlesSvc.all().slice(0, 6).map(a => ({ text: `Article ${a.status === 'Published' ? 'published' : 'saved as draft'}: “${a.title}” by ${a.author}`, when: new Date(a.createdAt) })),
      ...this.insightsSvc.all().slice(0, 4).map(i => ({ text: `Insight added: “${i.title}” by ${i.author}`, when: new Date(i.date + 'T00:00:00') })),
      ...this.leadersSvc.all().slice(0, 4).filter(l => l.createdAt).map(l => ({ text: `Leader profile added: ${l.name}, ${l.title}`, when: new Date(l.createdAt!) }))
    ];
    return items.sort((a, b) => b.when.getTime() - a.when.getTime()).slice(0, 6);
  });

  ngOnInit(): void {
    this.dash.start();
  }

  ngOnDestroy(): void {
    this.dash.stop();
  }

  toDate(iso: string): Date {
    return new Date(iso);
  }

  /** "5 min ago", "3 hrs ago", "2 days ago" */
  ago(d: Date): string {
    const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) { const h = Math.floor(s / 3600); return `${h} hr${h === 1 ? '' : 's'} ago`; }
    const days = Math.floor(s / 86400);
    return days < 30 ? `${days} day${days === 1 ? '' : 's'} ago` : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/b-admin']);
  }
}
