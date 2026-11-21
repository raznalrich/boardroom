import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SITE } from '../../core/data/site.config';
import { LEGAL_DOCS } from './legal.content';

/** One layout for the Privacy Policy and the Refund & Cancellation page; the route's `doc` data picks the text. */
@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
  host: { class: 'pg' }
})
export class LegalComponent {
  readonly updated = SITE.policiesUpdated;

  private key = toSignal(inject(ActivatedRoute).data.pipe(map(d => (d['doc'] as 'privacy' | 'refund') ?? 'privacy')), { initialValue: 'privacy' as const });

  doc = computed(() => LEGAL_DOCS[this.key()]);

  /** Smooth-scroll to a section (plain #links would be taken as a route change). */
  jump(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
