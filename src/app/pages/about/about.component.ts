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

  founders = [
    { name: 'Abin Krishna Nambiar', role: 'Founder', img: 'assets/images/abin.jpg',
      bio: 'Driven by curiosity and a belief that every remarkable journey deserves a voice, Abin Krishna Nambiar founded Beyond the Boardroom to uncover the vision, ambition and human stories behind business success. His mission is to connect ideas, inspire minds and amplify leadership beyond borders.' },
    { name: 'Dr. Snehal Chandorkar', role: 'Chief Executive Officer', img: 'assets/images/snehal.jpg',
      bio: 'Where vision meets influence, Dr. Snehal Chandorkar brings strategic intelligence, media expertise and a global perspective to Beyond the Boardroom. Her leadership is driven by a defining ambition to shape conversations that matter, amplify transformative ideas and establish a media platform that transcends borders and conventional narratives.' },
    { name: 'Sreejesh', role: 'Creative Director', img: 'assets/images/sree.jpg',
      bio: 'A passionate creative professional specializing in digital marketing, brand strategy, and creative innovation. Focused on transforming ideas into impactful brand experiences through strategic thinking, compelling storytelling, and result-driven digital campaigns. Dedicated to delivering creative solutions that inspire audiences and drive business growth.' }
  ];

  pillars = [
    { icon: '💡', title: 'Insights & Articles', text: 'Long-form analysis and sector deep dives on strategy, technology, finance, healthcare, real estate and more.', link: '/insights' },
    { icon: '🧭', title: 'Leadership Profiles', text: 'In-depth conversations with the CEOs, chairs and founders steering the region’s most influential organisations.', link: '/leadership-profiles' },
    { icon: '🤝', title: 'The Network', text: 'A private community of executives, with regional chapters and curated roundtables and dinners.', link: '/network' },
    { icon: '🎤', title: 'Events', text: 'Summits, keynotes and invitation-only gatherings that bring decision-makers into the same room.', link: '/events' },
    { icon: '📖', title: 'The Magazine', text: 'Our flagship publication, available to read online and download as a PDF.', link: '/e-magazine' }
  ];

  values = [
    { title: 'Independence', text: 'We report and publish without fear or favour. Editorial decisions are made by editors.' },
    { title: 'Accuracy', text: 'We check facts, name our sources where we can and correct mistakes openly.' },
    { title: 'Respect for readers’ time', text: 'Clear writing, honest headlines and analysis you can act on.' },
    { title: 'Open to new voices', text: 'Business leaders can contribute their own blogs and magazines for editorial review.' }
  ];
}
