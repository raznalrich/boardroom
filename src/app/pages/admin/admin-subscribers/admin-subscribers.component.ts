import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SubscribersService } from '../../../core/data/subscribers.service';

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
  all = this.svc.all;
  loading = this.svc.loading;
  error = this.svc.error;

  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    return q ? this.all().filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) : this.all();
  });

  constructor() {
    void this.svc.refresh();
  }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  exportCsv(): void {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [['Name', 'Email', 'Subscribed on', 'Source'], ...this.filtered().map(s => [s.name, s.email, s.date.slice(0, 10), s.source])];
    const csv = rows.map(r => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
