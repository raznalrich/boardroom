import { Routes } from '@angular/router';
import { BtbHomeComponent } from './pages/btb-home/btb-home.component';
import { MarketsComponent } from './pages/markets/markets.component';
import { InsightsComponent } from './pages/insights/insights.component';
import { LeadershipComponent } from './pages/leadership/leadership.component';
import { InnovationComponent } from './pages/innovation/innovation.component';
import { NetworkComponent } from './pages/network/network.component';
import { EventsComponent } from './pages/events/events.component';
import { EMagazineComponent } from './pages/e-magazine/e-magazine.component';

export const routes: Routes = [
  { path: '', component: BtbHomeComponent, data: { hideHeader: false, hideTicker: false } },
  { path: 'markets', component: MarketsComponent, title: 'Markets | BoardRoom' },
  { path: 'insights', component: InsightsComponent, title: 'Insights | BoardRoom' },
  { path: 'leadership-profiles', component: LeadershipComponent, title: 'Leadership & CEO Profiles | BoardRoom', data: { hideTicker: true } },
  { path: 'innovation', component: InnovationComponent, title: 'Innovation | BoardRoom', data: { hideTicker: true } },
  { path: 'network', component: NetworkComponent, title: 'The Network | BoardRoom', data: { hideTicker: true } },
  { path: 'events', component: EventsComponent, title: 'Events | BoardRoom', data: { hideTicker: true } },
  { path: 'e-magazine', component: EMagazineComponent, title: 'The E-Magazine | BoardRoom', data: { hideTicker: true } },
  { path: 'admin/editor', component: BtbHomeComponent, data: { hideHeader: true } },
  { path: '**', redirectTo: '' }
];
