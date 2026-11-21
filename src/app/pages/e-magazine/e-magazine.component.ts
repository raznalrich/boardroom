import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MagazinesService } from '../../core/data/magazines.service';

@Component({
  selector: 'app-e-magazine',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './e-magazine.component.html',
  styleUrls: ['./e-magazine.component.scss'],
  host: { class: 'pg' }
})
export class EMagazineComponent {
  private svc = inject(MagazinesService);
  readonly loaded = this.svc.loaded;

  /** The newest enabled issue is featured at the top. */
  current = computed(() => this.svc.active()[0] ?? null);

  /** Every other enabled issue, newest first. */
  past = computed(() => this.svc.active().slice(1));

  /** Colours for covers that have no uploaded picture. */
  readonly fallback = ['#2a2220', '#5a1a3a', '#1d3b34', '#3a3020', '#1f2a44', '#3a1f1f'];

}
