import { Component, signal, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InsightsService, insightImage } from '../../core/data/insights.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
  host: { class: 'pg' }
})
export class InsightsComponent {
  private svc = inject(InsightsService);
  categories = ['All', 'Economy', 'Strategy', 'Technology', 'Sustainability', 'Finance'];
  active = signal('All');

  filtered = computed(() => this.active() === 'All' ? this.svc.all() : this.svc.all().filter(a => a.category === this.active()));
  featured = computed(() => this.filtered()[0]);
  rest = computed(() => this.filtered().slice(1));
  trending = ['Saudi Vision 2030 midpoint review', 'CFO survey: hiring outlook 2027', 'The rise of the portfolio CEO', 'Digital dirham: what banks need to know'];

  url(img: string): string { return insightImage(img); }
}
