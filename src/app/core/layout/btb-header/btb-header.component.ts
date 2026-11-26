import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map, mergeMap } from 'rxjs';
import { ArticlesService } from '../../data/articles.service';
import { InsightsService } from '../../data/insights.service';

export interface NavItem {
  label: string;
  route: string;
}

export interface SearchResult {
  type: 'Article' | 'Insight';
  title: string;
  category: string;
  link: string[];
}

export interface TitlePart {
  text: string;
  hit: boolean;
}

@Component({
  selector: 'app-btb-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './btb-header.component.html',
  styleUrls: ['./btb-header.component.scss']
})
export class BtbHeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private routerSub!: Subscription;
  private articlesSvc = inject(ArticlesService);
  private insightsSvc = inject(InsightsService);

  /** Live search: what the visitor has typed, and which suggestion the keyboard is on. */
  query = signal('');
  activeIdx = signal(-1);

  /** Published articles and insights whose heading contains every typed word, best matches first. */
  results = computed<SearchResult[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    const pool: SearchResult[] = [
      ...this.articlesSvc.published().map(a => ({ type: 'Article' as const, title: a.title, category: a.category, link: ['/articles', a.id] })),
      ...this.insightsSvc.all().map(i => ({ type: 'Insight' as const, title: i.title, category: i.category, link: ['/insights', i.id] }))
    ];
    return pool
      .map(r => {
        const t = r.title.toLowerCase();
        if (!words.every(w => t.includes(w))) return null;
        // heading starts with the query > a word starts with it > it appears somewhere inside
        const rank = t.startsWith(q) ? 0 : t.split(/\s+/).some(w => w.startsWith(words[0])) ? 1 : 2;
        return { r, rank };
      })
      .filter((x): x is { r: SearchResult; rank: number } => x !== null)
      .sort((a, b) => a.rank - b.rank || a.r.title.localeCompare(b.r.title))
      .slice(0, 8)
      .map(x => x.r);
  });

  // Route-driven visibility states
  isVisible = true;
  isMobileMenuOpen = false;
  isSearchOpen = false;

  /** Today's date; refreshed at midnight so a page left open overnight stays correct. */
  private today = signal(new Date());
  private midnightTimer: ReturnType<typeof setTimeout> | null = null;

  /** e.g. "GLOBAL EDITION • 21 NOV 2026", always the current date. */
  editionLabel = computed(() => {
    const d = this.today();
    const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
    return `GLOBAL EDITION • ${date}`;
  });

  @Input() navItems: NavItem[] = [
    { label: 'INSIGHTS', route: '/insights' },
    { label: 'ARTICLES', route: '/articles' },
    { label: 'LEADERSHIP & CEO PROFILES', route: '/leadership-profiles' },
    { label: 'THE NETWORK', route: '/network' },
    { label: 'EVENTS', route: '/events' },
    { label: 'THE E-MAGAZINE', route: '/e-magazine' }
  ];

  @Output() searchSubmit = new EventEmitter<string>();

  ngOnInit(): void {
    this.scheduleMidnightRefresh();
    // Listen to route data changes to show or hide the header automatically
    this.routerSub = this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        this.isVisible = !data['hideHeader'];
        this.isMobileMenuOpen = false;
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    this.query.set('');
    this.activeIdx.set(-1);
    if (this.isSearchOpen) {
      setTimeout(() => document.getElementById('site-search')?.focus(), 0);
    }
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIdx.set(-1);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    const n = this.results().length;
    if (event.key === 'ArrowDown' && n) {
      event.preventDefault();
      this.activeIdx.set((this.activeIdx() + 1) % n);
    } else if (event.key === 'ArrowUp' && n) {
      event.preventDefault();
      this.activeIdx.set((this.activeIdx() - 1 + n) % n);
    } else if (event.key === 'Enter') {
      const q = this.query().trim();
      if (!q) return;
      this.searchSubmit.emit(q);
      const pick = this.results()[this.activeIdx() >= 0 ? this.activeIdx() : 0];
      if (pick) this.open(pick);
    } else if (event.key === 'Escape') {
      this.toggleSearch();
    }
  }

  /** Go to the chosen article or insight and close the search. */
  open(r: SearchResult): void {
    void this.router.navigate(r.link);
    this.isSearchOpen = false;
    this.isMobileMenuOpen = false;
    this.query.set('');
    this.activeIdx.set(-1);
  }

  /** Splits a heading so the part the visitor typed can be shown in bold. */
  parts(title: string): TitlePart[] {
    const words = this.query().trim().toLowerCase().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
    if (!words.length) return [{ text: title, hit: false }];
    const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const re = new RegExp('(' + escaped.join('|') + ')', 'gi');
    // with one capture group, split() puts the matched text at every odd position
    return title.split(re).map((text, i) => ({ text, hit: i % 2 === 1 })).filter(p => p.text !== '');
  }

  /** Re-reads the date shortly after midnight, then keeps doing so each day. */
  private scheduleMidnightRefresh(): void {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    this.midnightTimer = setTimeout(() => {
      this.today.set(new Date());
      this.scheduleMidnightRefresh();
    }, nextMidnight.getTime() - now.getTime());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    if (this.midnightTimer) clearTimeout(this.midnightTimer);
  }
}
