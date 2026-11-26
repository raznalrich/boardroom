import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Application, MembershipService } from '../../../core/data/membership.service';

type Filter = 'pending' | 'approved' | 'declined' | 'all';

@Component({
  selector: 'app-admin-membership',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-membership.component.html',
  styleUrls: ['./admin-membership.component.scss']
})
export class AdminMembershipComponent {
  private svc = inject(MembershipService);

  filter = signal<Filter>('pending');
  query = signal('');
  busy = signal('');
  message = signal('');

  all = this.svc.all;
  pending = this.svc.pending;
  approved = this.svc.approved;
  declined = this.svc.declined;
  loading = this.svc.loading;
  error = this.svc.error;

  filtered = computed(() => {
    const f = this.filter();
    const q = this.query().trim().toLowerCase();
    const base = f === 'pending' ? this.pending() : f === 'approved' ? this.approved() : f === 'declined' ? this.declined() : this.all();
    return base.filter(a => !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.includes(q));
  });

  constructor() { void this.svc.refresh(); }

  refresh(): void { void this.svc.refresh(); }

  initials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  async decide(a: Application, approve: boolean): Promise<void> {
    this.busy.set(a.id);
    this.message.set('');
    const { error } = await this.svc.decide(a.id, approve);
    this.busy.set('');
    this.message.set(error ?? (approve ? a.name + ' is now a member.' : a.name + ' was declined.'));
  }
}
