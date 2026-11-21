import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { supabase } from '../supabase/supabase';

/**
 * Records a page view in Supabase (`page_views`) every time a visitor opens a public page.
 * Stores only the page path and two random ids kept in the browser; no names, emails or IP addresses.
 * Admin pages and automated browsers (e.g. test runners) are not counted.
 */
@Injectable({ providedIn: 'root' })
export class VisitTrackerService {
  private router = inject(Router);
  private lastPath = '';

  start(): void {
    if (typeof window === 'undefined' || navigator.webdriver) return;

    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(e => {
      const path = e.urlAfterRedirects.split('?')[0].split('#')[0] || '/';
      if (path.startsWith('/b-admin') || path === this.lastPath) return;
      this.lastPath = path;
      void this.record(path);
    });
  }

  private async record(path: string): Promise<void> {
    const { error } = await supabase.from('page_views').insert({
      path,
      visitor_id: this.id(localStorage, 'btb_vid'),
      session_id: this.id(sessionStorage, 'btb_sid'),
      referrer: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer.slice(0, 300) : null
    });
    if (error) console.debug('Visit not recorded:', error.message);
  }

  /** A random id that survives in the given storage (falls back to a one-off id if storage is blocked). */
  private id(storage: Storage, key: string): string {
    try {
      let v = storage.getItem(key);
      if (!v) {
        v = crypto.randomUUID();
        storage.setItem(key, v);
      }
      return v;
    } catch {
      return crypto.randomUUID();
    }
  }
}
