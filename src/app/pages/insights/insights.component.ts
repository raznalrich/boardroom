import { Component, signal, computed } from '@angular/core';

interface Article { category: string; title: string; summary: string; author: string; read: string; date: string; img: string; }

@Component({
  selector: 'app-insights',
  standalone: true,
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss'],
  host: { class: 'pg' }
})
export class InsightsComponent {
  categories = ['All', 'Economy', 'Strategy', 'Technology', 'Sustainability', 'Finance'];
  active = signal('All');

  articles: Article[] = [
    { category: 'Economy', title: 'The Gulf pivot: how sovereign funds are rewriting global capital flows', summary: 'From Riyadh to Abu Dhabi, state-backed investors now allocate more outbound capital than at any point in the last decade.', author: 'Layla Haddad', read: '9 min', date: 'Nov 10', img: 'photo-1519085360753-af0119f7cbe7' },
    { category: 'Strategy', title: 'Why the best boards are shrinking their agendas', summary: 'Directors report that fewer, deeper discussions outperform exhaustive quarterly reviews.', author: 'Rohan Mehta', read: '6 min', date: 'Nov 9', img: 'photo-1507003211169-0a1dd7228f2d' },
    { category: 'Technology', title: 'AI in the C-suite: three operating models that actually work', summary: 'A review of 40 regional enterprises reveals the governance structures behind successful rollouts.', author: 'Sara Al-Qahtani', read: '8 min', date: 'Nov 8', img: 'photo-1573496359142-b8d87734a5a2' },
    { category: 'Sustainability', title: 'Green hydrogen economics: the cost curve finally bends', summary: 'Falling electrolyser prices and offtake agreements make 2027 a credible inflection point.', author: 'Omar Farouk', read: '7 min', date: 'Nov 6', img: 'photo-1472099645785-5658abf4ff4e' },
    { category: 'Finance', title: 'Private credit comes to the Middle East', summary: 'Regional banks partner with global managers as mid-market borrowers look beyond traditional lending.', author: 'Anita Desai', read: '5 min', date: 'Nov 5', img: 'photo-1500648767791-00dcc994a43e' },
    { category: 'Strategy', title: 'Succession planning in family conglomerates', summary: 'The next generation brings new expectations on governance, transparency and public listing.', author: 'Khalid Nasser', read: '10 min', date: 'Nov 3', img: 'photo-1560250097-0b93528c311a' }
  ];

  filtered = computed(() => this.active() === 'All' ? this.articles : this.articles.filter(a => a.category === this.active()));
  featured = computed(() => this.filtered()[0]);
  rest = computed(() => this.filtered().slice(1));
  trending = ['Saudi Vision 2030 midpoint review', 'CFO survey: hiring outlook 2027', 'The rise of the portfolio CEO', 'Digital dirham: what banks need to know'];

  url(id: string): string { return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`; }
}
