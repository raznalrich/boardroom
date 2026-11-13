import { Component, signal, computed } from '@angular/core';

interface Leader { name: string; title: string; company: string; region: string; quote: string; img: string; since: string; }

@Component({
  selector: 'app-leadership',
  standalone: true,
  templateUrl: './leadership.component.html',
  styleUrls: ['./leadership.component.scss'],
  host: { class: 'pg' }
})
export class LeadershipComponent {
  regions = ['All', 'UAE', 'Saudi Arabia', 'India', 'Global'];
  active = signal('All');

  leaders: Leader[] = [
    { name: 'Tariq Al-Mansoor', title: 'Regional CEO', company: 'Gulf Investments', region: 'UAE', quote: 'Capital follows clarity. Our job is to remove ambiguity.', since: 'CEO since 2019', img: 'photo-1560250097-0b93528c311a' },
    { name: 'Sunita Sharma', title: 'Managing Director', company: 'Apex Logistics India', region: 'India', quote: 'Resilient supply chains are built in calm seasons.', since: 'MD since 2017', img: 'photo-1573496359142-b8d87734a5a2' },
    { name: 'Faisal Al-Rashid', title: 'Chairman', company: 'Najd Holdings', region: 'Saudi Arabia', quote: 'Family governance is the first strategy document.', since: 'Chair since 2015', img: 'photo-1507003211169-0a1dd7228f2d' },
    { name: 'Amelia Grant', title: 'Group CFO', company: 'Meridian Global', region: 'Global', quote: 'Great CFOs are translators between ambition and arithmetic.', since: 'CFO since 2021', img: 'photo-1573497019940-1c28c88b4f3e' },
    { name: 'Dr. Hessa Khalifa', title: 'Chief Executive', company: 'Horizon Health', region: 'UAE', quote: 'Healthcare is a trust business first, a scale business second.', since: 'CEO since 2020', img: 'photo-1534528741775-53994a69daeb' },
    { name: 'Vikram Nair', title: 'Founder & CEO', company: 'Kerala Ventures', region: 'India', quote: 'Patience is an underrated competitive advantage.', since: 'Founder 2012', img: 'photo-1500648767791-00dcc994a43e' }
  ];

  filtered = computed(() => this.active() === 'All' ? this.leaders : this.leaders.filter(l => l.region === this.active()));
  stats = [{ v: '250+', l: 'Executives profiled' }, { v: '18', l: 'Countries' }, { v: '42', l: 'Industries' }, { v: '100', l: 'Power List members' }];

  url(id: string): string { return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=500&q=80`; }
}
