import { Component, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { BtbHeaderComponent } from './core/layout/btb-header/btb-header.component';
import { BtbFooterComponent } from './core/layout/btb-footer/btb-footer.component';
import { VisitTrackerService } from './core/data/visit-tracker.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BtbHeaderComponent, BtbFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  constructor() {
    inject(VisitTrackerService).start();
    // The black-and-gold look belongs to the public website; the admin area keeps its own light styling.
    effect(() => document.body.classList.toggle('admin-area', this.isAdmin()));
  }

  /** True on /b-admin routes: the public header and footer are hidden. */
  isAdmin = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects.startsWith('/b-admin'))
    ),
    { initialValue: typeof location !== 'undefined' && location.pathname.startsWith('/b-admin') }
  );

  handleGlobalSearch(query: string): void {
    console.log('Global search query:', query);
  }
}
