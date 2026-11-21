import { Component, signal, computed, inject } from '@angular/core';
import { EventsService, EVENT_TYPES, eventDay, eventMonth } from '../../core/data/events.service';

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  host: { class: 'pg' }
})
export class EventsComponent {
  private svc = inject(EventsService);
  types = ['All', ...EVENT_TYPES];
  day = eventDay;
  month = eventMonth;
  active = signal('All');

  filtered = computed(() => this.active() === 'All' ? this.svc.upcoming() : this.svc.upcoming().filter(e => e.type === this.active()));

  speakers = [
    { name: 'Tariq Al-Mansoor', role: 'Regional CEO, Gulf Investments', initials: 'TA' },
    { name: 'Sunita Sharma', role: 'MD, Apex Logistics India', initials: 'SS' },
    { name: 'Amelia Grant', role: 'Group CFO, Meridian Global', initials: 'AG' },
    { name: 'Dr. Hessa Khalifa', role: 'CEO, Horizon Health', initials: 'HK' }
  ];
}
