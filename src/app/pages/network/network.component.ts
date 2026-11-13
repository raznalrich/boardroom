import { Component } from '@angular/core';

@Component({
  selector: 'app-network',
  standalone: true,
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
  host: { class: 'pg' }
})
export class NetworkComponent {
  stats = [{ v: '5,200+', l: 'Members' }, { v: '24', l: 'Chapters' }, { v: '60+', l: 'Private events / year' }, { v: '31', l: 'Countries' }];

  tiers = [
    { name: 'Associate', price: '$1,200 / yr', featured: false, perks: ['Weekly executive brief', 'Member directory access', 'Quarterly virtual roundtables'] },
    { name: 'Executive', price: '$4,800 / yr', featured: true, perks: ['Everything in Associate', 'Invitation to private dinners', 'Annual Summit pass', 'Peer matching service'] },
    { name: 'Chairman’s Circle', price: 'By invitation', featured: false, perks: ['Everything in Executive', 'Advisory council seat', 'Bespoke introductions', 'Editorial feature'] }
  ];

  chapters = [
    { city: 'Dubai', members: 940 }, { city: 'Riyadh', members: 720 }, { city: 'Mumbai', members: 610 },
    { city: 'Abu Dhabi', members: 530 }, { city: 'London', members: 410 }, { city: 'Doha', members: 280 }
  ];

  members = [
    { name: 'Tariq Al-Mansoor', role: 'Regional CEO', initials: 'TA' },
    { name: 'Sunita Sharma', role: 'Managing Director', initials: 'SS' },
    { name: 'Faisal Al-Rashid', role: 'Chairman', initials: 'FR' },
    { name: 'Amelia Grant', role: 'Group CFO', initials: 'AG' }
  ];
}
