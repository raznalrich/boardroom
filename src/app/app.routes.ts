import { Routes } from '@angular/router';
import { BtbHomeComponent } from './pages/btb-home/btb-home.component';
import { MarketsComponent } from './pages/markets/markets.component';
import { InsightsComponent } from './pages/insights/insights.component';
import { LeadershipComponent } from './pages/leadership/leadership.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { NetworkComponent } from './pages/network/network.component';
import { EventsComponent } from './pages/events/events.component';
import { EMagazineComponent } from './pages/e-magazine/e-magazine.component';

import { AdminLoginComponent } from './pages/admin/admin-login/admin-login.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { adminGuard, adminLoginGuard } from './core/auth/admin.guard';

import { SubmitBlogComponent } from './pages/submit-blog/submit-blog.component';
import { SubmitMagazineComponent } from './pages/submit-magazine/submit-magazine.component';

import { LeaderDetailComponent } from './pages/leader-detail/leader-detail.component';

import { InsightDetailComponent } from './pages/insight-detail/insight-detail.component';

import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';

export const routes: Routes = [
  { path: '', component: BtbHomeComponent, data: { hideHeader: false, hideTicker: false } },
  { path: 'markets', component: MarketsComponent, title: 'Markets | BoardRoom' },
  { path: 'insights', component: InsightsComponent, title: 'Insights | BoardRoom' },
  { path: 'insights/:id', component: InsightDetailComponent, title: 'Insight | BoardRoom' },
  { path: 'leadership-profiles', component: LeadershipComponent, title: 'Leadership & CEO Profiles | BoardRoom', data: { hideTicker: true } },
  { path: 'leadership-profiles/:slug', component: LeaderDetailComponent, title: 'Leader Profile | BoardRoom', data: { hideTicker: true } },
  { path: 'articles/:id', component: ArticleDetailComponent, title: 'Article | BoardRoom', data: { hideTicker: true } },
  { path: 'articles', component: ArticlesComponent, title: 'Articles | BoardRoom', data: { hideTicker: true } },
  { path: 'network', component: NetworkComponent, title: 'The Network | BoardRoom', data: { hideTicker: true } },
  { path: 'events', component: EventsComponent, title: 'Events | BoardRoom', data: { hideTicker: true } },
  { path: 'e-magazine', component: EMagazineComponent, title: 'The E-Magazine | BoardRoom', data: { hideTicker: true } },
  { path: 'submit-blog', component: SubmitBlogComponent, title: 'Submit a Blog | BoardRoom', data: { hideTicker: true } },
  { path: 'submit-magazine', component: SubmitMagazineComponent, title: 'Send Your Magazine | BoardRoom', data: { hideTicker: true } },
  { path: 'b-admin', component: AdminLoginComponent, canActivate: [adminLoginGuard], title: 'Admin Login | BoardRoom', data: { hideHeader: true } },
  { path: 'b-admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'Admin Dashboard | BoardRoom', data: { hideHeader: true } },
  { path: 'admin/editor', component: BtbHomeComponent, data: { hideHeader: true } },
  { path: '**', redirectTo: '' }
];
