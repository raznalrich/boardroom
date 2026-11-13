import { Component } from '@angular/core';

@Component({
  selector: 'app-innovation',
  standalone: true,
  templateUrl: './innovation.component.html',
  styleUrls: ['./innovation.component.scss'],
  host: { class: 'pg' }
})
export class InnovationComponent {
  themes = [
    { icon: '🤖', name: 'Artificial Intelligence', count: 48, blurb: 'Enterprise AI, copilots and governance.' },
    { icon: '⚡', name: 'Clean Energy', count: 31, blurb: 'Hydrogen, solar and grid storage.' },
    { icon: '💳', name: 'FinTech', count: 36, blurb: 'Payments, open banking and digital assets.' },
    { icon: '🧬', name: 'HealthTech', count: 22, blurb: 'Diagnostics, genomics and telemedicine.' },
    { icon: '🚀', name: 'Space & Mobility', count: 14, blurb: 'Satellites, EVs and autonomous transport.' },
    { icon: '🏗️', name: 'PropTech', count: 19, blurb: 'Smart cities and construction tech.' }
  ];

  startups = [
    { name: 'NeuraGulf', sector: 'AI', stage: 'Series B', raised: '$62M', hq: 'Abu Dhabi', desc: 'Arabic-first large language models for enterprise.' },
    { name: 'SolarGrid', sector: 'Energy', stage: 'Series A', raised: '$28M', hq: 'Riyadh', desc: 'Distributed solar plus storage for industrial parks.' },
    { name: 'PayLoop', sector: 'FinTech', stage: 'Series C', raised: '$140M', hq: 'Dubai', desc: 'Cross-border SME payments across MENA and India.' },
    { name: 'GenoCare', sector: 'HealthTech', stage: 'Seed', raised: '$9M', hq: 'Bengaluru', desc: 'Affordable population-scale genomic screening.' }
  ];

  pipeline = [
    { step: '01', title: 'Apply', text: 'Submit your venture by 15 January.' },
    { step: '02', title: 'Shortlist', text: 'Editors and investors select 50 finalists.' },
    { step: '03', title: 'Pitch', text: 'Live pitches at the Innovation Summit.' },
    { step: '04', title: 'Recognise', text: 'Winners featured across our global platform.' }
  ];
}
