import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription, filter, map, mergeMap } from 'rxjs';

export interface NavItem {
  label: string;
  route: string;
}

export interface MarketTicker {
  name: string;
  value?: string;
  change: string;
  isPositive: boolean;
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

  // Route-driven visibility states
  isVisible = true;
  showTicker = true;
  isMobileMenuOpen = false;
  isSearchOpen = false;

  @Input() editionLabel = 'GLOBAL EDITION • NOV 2026';

  @Input() trendingTopics: { label: string; route: string }[] = [
    { label: 'Artificial Intelligence', route: '/topic/ai' },
    { label: 'Saudi Expansion', route: '/topic/saudi-expansion' },
    { label: 'VC Funding', route: '/topic/vc-funding' }
  ];

  @Input() navItems: NavItem[] = [
    { label: 'MARKETS', route: '/markets' },
    { label: 'INSIGHTS', route: '/insights' },
    { label: 'LEADERSHIP & CEO PROFILES', route: '/leadership-profiles' },
    { label: 'INNOVATION', route: '/innovation' },
    { label: 'THE NETWORK', route: '/network' },
    { label: 'EVENTS', route: '/events' },
    { label: 'THE E-MAGAZINE', route: '/e-magazine' }
  ];

  @Input() marketTickers: MarketTicker[] = [
    { name: 'Nifty 50', change: '0.009%', isPositive: true },
    { name: 'DFM', value: '1973.50', change: '0.23%', isPositive: true },
    { name: 'Sensex', value: '2.5M', change: '0.36%', isPositive: false },
    { name: 'DFM', value: '2.25', change: '0.033%', isPositive: false },
    { name: 'Brent Crude', change: '0.763%', isPositive: true }
  ];

  @Output() subscribeClick = new EventEmitter<void>();
  @Output() searchSubmit = new EventEmitter<string>();

  ngOnInit(): void {
    // Listen to route data changes to toggle header or market ticker strip automatically
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
        this.showTicker = !data['hideTicker'];
        this.isMobileMenuOpen = false;
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  onSearchKey(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.trim()) {
      this.searchSubmit.emit(input.value.trim());
      this.isSearchOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
