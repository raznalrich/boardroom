import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminArticlesComponent } from '../admin-articles/admin-articles.component';
import { AdminProfilesComponent } from '../admin-profiles/admin-profiles.component';
import { AdminEventsComponent } from '../admin-events/admin-events.component';
import { AdminSubscribersComponent } from '../admin-subscribers/admin-subscribers.component';
import { AdminInsightsComponent } from '../admin-insights/admin-insights.component';
import { AdminBannersComponent } from '../admin-banners/admin-banners.component';
import { AdminAuthService } from '../../../core/auth/admin-auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminArticlesComponent, AdminProfilesComponent, AdminEventsComponent, AdminSubscribersComponent, AdminInsightsComponent, AdminBannersComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private auth = inject(AdminAuthService);
  private router = inject(Router);

  nav = ['Dashboard', 'Banners', 'Articles', 'Insights', 'Profiles', 'Events', 'Subscribers', 'E-Magazine', 'Settings'];
  activeNav = signal('Dashboard');
  sidebarOpen = signal(false);

  kpis = [
    { label: 'Total Visitors', value: '128,430', change: '+12.4%', up: true },
    { label: 'Published Articles', value: '1,284', change: '+38', up: true },
    { label: 'Subscribers', value: '18,902', change: '+5.1%', up: true },
    { label: 'Bounce Rate', value: '34.2%', change: '-1.8%', up: false }
  ];

  weekly = [
    { d: 'Mon', v: 62 }, { d: 'Tue', v: 78 }, { d: 'Wed', v: 70 }, { d: 'Thu', v: 91 },
    { d: 'Fri', v: 84 }, { d: 'Sat', v: 48 }, { d: 'Sun', v: 55 }
  ];

  sections = [
    { name: 'Markets', pct: 32 }, { name: 'Insights', pct: 26 }, { name: 'Leadership', pct: 18 },
    { name: 'Innovation', pct: 14 }, { name: 'Events', pct: 10 }
  ];

  articles = [
    { title: 'The Billion-Dollar Vision: India’s Next-Gen Industrialists', section: 'Editorial', author: 'Priya Nair', status: 'Published', views: '24,310' },
    { title: 'Gulf Capital Goes Global', section: 'Markets', author: 'Layla Haddad', status: 'Published', views: '18,742' },
    { title: 'AI in the C-Suite: Three Operating Models', section: 'Innovation', author: 'Sara Al-Qahtani', status: 'In review', views: '—' },
    { title: 'The Chairman’s Playbook', section: 'Leadership', author: 'Khalid Nasser', status: 'Draft', views: '—' },
    { title: 'Green Hydrogen Economics', section: 'Insights', author: 'Omar Farouk', status: 'Published', views: '9,115' }
  ];

  activity = [
    { who: 'Priya Nair', what: 'published “The Billion-Dollar Vision”', when: '12 min ago' },
    { who: 'Admin', what: 'approved 3 new member requests', when: '1 hr ago' },
    { who: 'Layla Haddad', what: 'submitted an article for review', when: '3 hrs ago' },
    { who: 'System', what: 'newsletter sent to 18,902 subscribers', when: 'Yesterday' }
  ];

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/b-admin']);
  }
}
