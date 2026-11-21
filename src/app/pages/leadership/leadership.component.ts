import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { leaderImageUrl, leaderSlug } from '../../core/data/leaders.data';
import { LeadersService } from '../../core/data/leaders.service';

@Component({
  selector: 'app-leadership',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leadership.component.html',
  styleUrls: ['./leadership.component.scss'],
  host: { class: 'pg' }
})
export class LeadershipComponent {
  regions = ['All', 'UAE', 'Saudi Arabia', 'India', 'Global'];
  active = signal('All');

  leaders = inject(LeadersService).all;

  filtered = computed(() => this.active() === 'All' ? this.leaders() : this.leaders().filter(l => l.region === this.active()));
  stats = [{ v: '250+', l: 'Executives profiled' }, { v: '18', l: 'Countries' }, { v: '42', l: 'Industries' }, { v: '100', l: 'Power List members' }];

  slug = leaderSlug;

  url(id: string): string { return leaderImageUrl(id); }
}
