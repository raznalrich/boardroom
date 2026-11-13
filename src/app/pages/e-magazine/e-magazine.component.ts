import { Component } from '@angular/core';

@Component({
  selector: 'app-e-magazine',
  standalone: true,
  templateUrl: './e-magazine.component.html',
  styleUrls: ['./e-magazine.component.scss'],
  host: { class: 'pg' }
})
export class EMagazineComponent {
  current = {
    title: 'The Power Issue', month: 'November 2026', pages: 148,
    contents: ['Cover story: The 100 most influential executives', 'Gulf capital goes global', 'AI and the end of the org chart', 'Interview: Faisal Al-Rashid', 'Wealth & Legacy special report']
  };

  archive = [
    { title: 'The Innovation Issue', month: 'Oct 2026', color: '#2a2220' },
    { title: 'Women in Leadership', month: 'Sep 2026', color: '#5a1a3a' },
    { title: 'The Energy Transition', month: 'Aug 2026', color: '#1d3b34' },
    { title: 'Family Business', month: 'Jul 2026', color: '#3a3020' },
    { title: 'Future of Finance', month: 'Jun 2026', color: '#1f2a44' },
    { title: 'Global Trade', month: 'May 2026', color: '#3a1f1f' }
  ];

  plans = [
    { name: 'Digital', price: '$49', per: '/ year', perks: ['12 monthly issues', 'Searchable archive', 'Mobile & tablet apps'] },
    { name: 'Print + Digital', price: '$129', per: '/ year', perks: ['12 printed issues', 'Full digital access', 'Annual Power List edition'], featured: true }
  ];
}
