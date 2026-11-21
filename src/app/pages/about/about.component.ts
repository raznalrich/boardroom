import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../../core/data/site.config';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  host: { class: 'pg' }
})
export class AboutComponent {
  readonly site = SITE;

  pillars = [
    { icon: '📈', title: 'Markets', text: 'Daily coverage of equities, commodities and currencies across the Gulf, India and global exchanges.', link: '/markets' },
    { icon: '💡', title: 'Insights & Articles', text: 'Long-form analysis and sector deep dives on strategy, technology, finance, healthcare, real estate and more.', link: '/insights' },
    { icon: '🧭', title: 'Leadership Profiles', text: 'In-depth conversations with the CEOs, chairs and founders steering the region’s most influential organisations.', link: '/leadership-profiles' },
    { icon: '🤝', title: 'The Network', text: 'A private community of executives, with regional chapters and curated roundtables and dinners.', link: '/network' },
    { icon: '🎤', title: 'Events', text: 'Summits, keynotes and invitation-only gatherings that bring decision-makers into the same room.', link: '/events' },
    { icon: '📖', title: 'The E-Magazine', text: 'Our flagship publication, available to read online and download as a PDF.', link: '/e-magazine' }
  ];

  values = [
    { title: 'Independence', text: 'We report and publish without fear or favour. Editorial decisions are made by editors.' },
    { title: 'Accuracy', text: 'We check facts, name our sources where we can and correct mistakes openly.' },
    { title: 'Respect for readers’ time', text: 'Clear writing, honest headlines and analysis you can act on.' },
    { title: 'Open to new voices', text: 'Business leaders can contribute their own blogs and magazines for editorial review.' }
  ];
}
