import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SubscribersService } from '../../../core/data/subscribers.service';

type Filter = 'all' | 'subscribers' | 'applications';

@Component({
  selector: 'app-admin-subscribers',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-subscribers.component.html',
  styleUrls: ['./admin-subscribers.component.scss']
})
export class AdminSubscribersComponent {
  private svc = inject(SubscribersService);

  query = signal('');
  filter = signal<Filter>('all');

  leads = this.svc.leads;
  loading = this.svc.loading;
  errors = this.svc.errors;
  subscriberCount = this.svc.subscriberCount;
  applicationCount = this.svc.applicationCount;

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const f = this.filter();
    return this.leads().filter(l =>
      (f === 'all' || (f === 'subscribers' ? l.source === 'Get in touch' : l.source === 'Membership application')) &&
      (!q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.toLowerCase().includes(q))
    );
  });

  constructor() {
    void this.svc.refresh();
  }

  refresh(): void {
    void this.svc.refresh();
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  exportCsv(): void {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Email', 'Phone', 'Date', 'Source', 'Status'],
      ...this.filtered().map(l => [l.name, l.email, l.phone, l.date.slice(0, 10), l.source, l.status])
    ];
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers-and-applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
