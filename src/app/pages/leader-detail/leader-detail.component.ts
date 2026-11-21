import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Leader, leaderImageUrl, leaderSlug } from '../../core/data/leaders.data';
import { LeadersService } from '../../core/data/leaders.service';

@Component({
  selector: 'app-leader-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './leader-detail.component.html',
  styleUrls: ['./leader-detail.component.scss'],
  host: { class: 'pg' }
})
export class LeaderDetailComponent {
  private svc = inject(LeadersService);
  readonly slug = leaderSlug;

  private slugParam = toSignal(inject(ActivatedRoute).paramMap.pipe(map(p => p.get('slug') ?? '')), { initialValue: '' });

  leader = computed<Leader | undefined>(() => this.svc.all().find(l => leaderSlug(l.name) === this.slugParam()));

  /** Other leaders, same region first. */
  related = computed<Leader[]>(() => {
    const cur = this.leader();
    if (!cur) return [];
    const others = this.svc.all().filter(l => l.name !== cur.name);
    return [...others.filter(l => l.region === cur.region), ...others.filter(l => l.region !== cur.region)].slice(0, 3);
  });

  /** Uses the saved biography, or builds a short default one from the profile fields. */
  bio = computed<string[]>(() => {
    const l = this.leader();
    if (!l) return [];
    if (l.bio?.trim()) {
      return l.bio.split(/\n{1,}/).map(p => p.trim()).filter(Boolean);
    }
    return [
      `${l.name} serves as ${l.title} at ${l.company}, one of the most closely watched organisations in ${l.region === 'Global' ? 'the global business community' : l.region}.`,
      `${l.since ? l.since + '. ' : ''}Known for a pragmatic, long-term approach to leadership, ${l.name.split(' ')[0]} has become a frequent voice at BoardRoom roundtables on strategy, governance and growth.`,
      `Looking ahead, the focus remains on building resilient teams, disciplined capital allocation and lasting partnerships across markets.`
    ];
  });

  img(id: string, w = 900): string {
    return leaderImageUrl(id, w);
  }
}
