import { Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { WomenService } from '../../core/data/women.service';

@Component({
  selector: 'app-women-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './women-detail.component.html',
  styleUrls: ['./women-detail.component.scss'],
  host: { class: 'pg' }
})
export class WomenDetailComponent {
  private svc = inject(WomenService);
  private id = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => p.get('id') ?? '')), { initialValue: '' });

  woman = computed(() => this.svc.shown().find(w => w.id === this.id()) ?? null);
  others = computed(() => this.svc.shown().filter(w => w.id !== this.id()).slice(0, 4));
  loaded = this.svc.loaded;

  initials(name: string): string {
    return name.replace(/^(dr|mrs|ms|mr)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}
