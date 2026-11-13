import { Component, signal, computed } from '@angular/core';

interface EventItem { day: string; month: string; title: string; type: string; city: string; time: string; seats: string; }

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  host: { class: 'pg' }
})
export class EventsComponent {
  types = ['All', 'Summit', 'Dinner', 'Webinar', 'Keynote'];
  active = signal('All');

  events: EventItem[] = [
    { day: '02', month: 'DEC', title: 'Annual Leadership Summit 2026', type: 'Summit', city: 'Dubai, DIFC', time: '09:00 – 18:00', seats: 'Few seats left' },
    { day: '09', month: 'DEC', title: 'Chairman’s Private Dinner', type: 'Dinner', city: 'Riyadh', time: '19:30', seats: 'Invitation only' },
    { day: '14', month: 'DEC', title: 'CFO Outlook 2027 Webinar', type: 'Webinar', city: 'Online', time: '15:00 GST', seats: 'Open' },
    { day: '21', month: 'JAN', title: 'Keynote: The Next Decade of Trade Corridors', type: 'Keynote', city: 'Mumbai', time: '11:00', seats: 'Open' },
    { day: '05', month: 'FEB', title: 'Women in the Boardroom Forum', type: 'Summit', city: 'Abu Dhabi', time: '10:00 – 16:00', seats: 'Open' },
    { day: '18', month: 'FEB', title: 'Family Business Roundtable', type: 'Dinner', city: 'Doha', time: '19:00', seats: 'Invitation only' }
  ];

  filtered = computed(() => this.active() === 'All' ? this.events : this.events.filter(e => e.type === this.active()));

  speakers = [
    { name: 'Tariq Al-Mansoor', role: 'Regional CEO, Gulf Investments', initials: 'TA' },
    { name: 'Sunita Sharma', role: 'MD, Apex Logistics India', initials: 'SS' },
    { name: 'Amelia Grant', role: 'Group CFO, Meridian Global', initials: 'AG' },
    { name: 'Dr. Hessa Khalifa', role: 'CEO, Horizon Health', initials: 'HK' }
  ];
}
