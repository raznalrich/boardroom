import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Insight, InsightsService, insightImage } from '../../core/data/insights.service';

@Component({
  selector: 'app-insight-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './insight-detail.component.html',
  styleUrls: ['./insight-detail.component.scss'],
  host: { class: 'pg' }
})
export class InsightDetailComponent {
  private svc = inject(InsightsService);
  readonly image = insightImage;
  readonly loaded = this.svc.loaded;

  private idParam = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => p.get('id') ?? '')), { initialValue: '' });

  insight = computed<Insight | undefined>(() => this.svc.all().find(i => i.id === this.idParam()));

  /** Paragraphs of the elaborate summary (blank-line separated). Empty when none was written. */
  paragraphs = computed<string[]>(() => {
    const d = this.insight()?.details?.trim();
    return d ? d.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean) : [];
  });

  related = computed<Insight[]>(() => {
    const cur = this.insight();
    if (!cur) return [];
    const others = this.svc.all().filter(i => i.id !== cur.id);
    return [...others.filter(i => i.category === cur.category), ...others.filter(i => i.category !== cur.category)].slice(0, 3);
  });
}
