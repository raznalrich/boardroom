import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

export interface HeroSlide {
  tag: string;
  title: string;
  author: string;
  readTime: string;
  image: string;
  bullets: string[];
}

export interface SectorArticle {
  category: string;
  badgeType: 'gold' | 'magenta';
  headline: string;
  summary?: string;
  author: string;
  readTime: string;
}

export interface ProfileCard {
  category: string;
  headline: string;
  author: string;
  image: string;
}

export interface PowerListMember {
  rank: string | null;
  name: string;
  image: string;
}

export interface PowerListGroup {
  title: string;
  blurb: string;
  members: PowerListMember[];
}

@Component({
  selector: 'app-btb-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './btb-home.component.html',
  styleUrls: ['./btb-home.component.scss']
})
export class BtbHomeComponent implements OnInit, OnDestroy {
  // Main feature story slider
  heroSlides: HeroSlide[] = [
    {
      tag: 'EDITORIAL',
      title: "THE BILLION-DOLLAR VISION: How India's Next-Gen Industrialists Are Rewriting Global Logistics",
      author: 'Priya Nair',
      readTime: '7 min read',
      image: 'https://i.pinimg.com/1200x/89/b5/1a/89b51abbd6177492d21a1022a2cb67a2.jpg',
      bullets: [
        'Business leaders driving vision in Next-Gen Global Logistics',
        'Summary of key industrialists rewriting global supply chain corridors'
      ]
    },
    {
      tag: 'MARKETS',
      title: 'GULF CAPITAL GOES GLOBAL: Sovereign Funds Reshape the Flow of International Investment',
      author: 'Layla Haddad',
      readTime: '9 min read',
      image: 'https://images.pexels.com/photos/22719284/pexels-photo-22719284.jpeg',
      bullets: ['State-backed investors now deploy more outbound capital than ever', 'What it means for regional deal-making in 2027']
    },
    {
      tag: 'INNOVATION',
      title: 'AI IN THE C-SUITE: Three Operating Models That Actually Work',
      author: 'Sara Al-Qahtani',
      readTime: '8 min read',
      image: 'https://images.pexels.com/photos/7845285/pexels-photo-7845285.jpeg',
      bullets: ['Lessons from 40 regional enterprises', 'Governance structures behind successful AI rollouts']
    },
    {
      tag: 'LEADERSHIP',
      title: "THE CHAIRMAN'S PLAYBOOK: Family Governance in the Next Generation of Conglomerates",
      author: 'Khalid Nasser',
      readTime: '10 min read',
      image: 'https://images.pexels.com/photos/3733584/pexels-photo-3733584.jpeg',
      bullets: ['Succession, transparency and public listing', "Advice from the region's most influential chairs"]
    }
  ];
  currentSlide = 0;
  private slideTimer: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;

  startAutoSlide(): void {
    this.pauseAutoSlide();
    this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  pauseAutoSlide(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = null;
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  goToSlide(i: number): void {
    this.currentSlide = i;
  }

  onTouchStart(e: TouchEvent): void {
    this.pauseAutoSlide();
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) { this.nextSlide(); } else { this.prevSlide(); }
    }
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.pauseAutoSlide();
  }

  // Section B: Breaking News Ticker Items
  latestNews: string[] = [
    'SMEs secure $400M in Saudi expansion funds',
    'AI transformation sweeps GCC banking sector',
    'India-UAE trade corridor achieves record $85B milestone',
    'Green Hydrogen initiatives attract major VC backing across Middle East'
  ];

  // Section C: Boardroom Roundtable Avatars
  roundtableAvatars = [
    {
      name: 'Tariq Al-Mansoor',
      role: 'Regional CEO',
      org: 'Gulf Investments',
      img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Sunita Sharma',
      role: 'Managing Director',
      org: 'Apex Logistics India',
      img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop'
    },
    {
      name: 'Zaid Al-Hassan',
      role: 'Chief Str Officer',
      org: 'Middle East Tech Ventures',
      img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop'
    }
  ];

  // Section D: Profiles in Leadership Cards
  profileCards: ProfileCard[] = [
    {
      category: 'PROFILES IN LEADERSHIP',
      headline: 'Reimagining Retail: The Vijay Shekhar Story',
      author: 'By Rajiv Mehta',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop'
    },
    {
      category: 'PROFILES IN LEADERSHIP',
      headline: 'Leading the Green Energy Transition',
      author: 'By Fatima Al-Sabah',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=300&auto=format&fit=crop'
    },
    {
      category: 'PROFILES IN LEADERSHIP',
      headline: 'Inside the Mind of a Top VC',
      author: 'By Vikram Singhania',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop'
    }
  ];

  // Section E: Sector Deep Dives Tabbed Articles
  activeSectorTab = 'LEADERSHIP';
  sectorTabs = ['LEADERSHIP', 'STRATEGY', 'AI & TECH', 'GCC MARKETS'];

  sectorArticlesMap: Record<string, SectorArticle[]> = {
    'LEADERSHIP': [
      {
        category: 'LEADERSHIP',
        badgeType: 'gold',
        headline: 'The Next AI Wave in Enterprise Strategy',
        author: 'By Dr. Aris Thorne',
        readTime: '5 min read'
      },
      {
        category: 'LEADERSHIP',
        badgeType: 'gold',
        headline: 'Executive Mindset: Resilience in Volatile Markets',
        summary: 'How C-suite leaders navigate macroeconomic shifts through adaptive governance models.',
        author: 'By Neha Kapoor',
        readTime: '6 min read'
      }
    ],
    'STRATEGY': [
      {
        category: 'STRATEGY',
        badgeType: 'magenta',
        headline: 'Navigating Cross-Border Trade in 2027',
        author: 'By Marcus Vance',
        readTime: '8 min read'
      },
      {
        category: 'STRATEGY',
        badgeType: 'magenta',
        headline: 'The Era of Circular Manufacturing',
        summary: 'Sustainable supply chains move from ESG compliance to core competitive advantage.',
        author: 'By Leila Al-Harthi',
        readTime: '4 min read'
      }
    ],
    'AI & TECH': [
      {
        category: 'AI & TECH',
        badgeType: 'magenta',
        headline: 'Generative Models in Sovereign Cloud Infrastructure',
        author: 'By Rahul Deshmukh',
        readTime: '6 min read'
      },
      {
        category: 'AI & TECH',
        badgeType: 'magenta',
        headline: 'Autonomous Supply Chains: Realities vs Hyped Claims',
        summary: 'Evaluating real-world ROI of agentic AI deployments in regional fulfillment hubs.',
        author: 'By Sarah Jenkins',
        readTime: '7 min read'
      }
    ],
    'GCC MARKETS': [
      {
        category: 'GCC MARKETS',
        badgeType: 'magenta',
        headline: 'Sovereign Wealth: Investing in Next-Gen Innovation',
        author: 'By Hamdan Al-Rashid',
        readTime: '9 min read'
      },
      {
        category: 'GCC MARKETS',
        badgeType: 'magenta',
        headline: 'Riyadh as the New Regional Business Capital',
        summary: 'Multinational regional headquarters expand operations under Vision 2030 initiatives.',
        author: 'By Omar Al-Ghamdi',
        readTime: '5 min read'
      }
    ]
  };

  // Section F: Power List Visionaries
  powerListGroups: PowerListGroup[] = [
    {
      title: 'Regional Leader',
      blurb: 'Business Leaders, Title: Brief Business Leaders, Summary...',
      members: [
        {
          rank: '01',
          name: 'Vikramaditya Singh',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
        },
        {
          rank: null,
          name: 'Siddharth Mehta',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
        }
      ]
    },
    {
      title: 'Astute CEO',
      blurb: 'Regional CO, Operational Business Leaders, leading...',
      members: [
        {
          rank: '02',
          name: 'Nasser Al-Kharafi',
          image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80'
        },
        {
          rank: null,
          name: 'Ramesh Iyer',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
        }
      ]
    },
    {
      title: 'Actional Business',
      blurb: 'Business Leaders, industry leader, and enterprise transformation...',
      members: [
        {
          rank: '03',
          name: 'Omar Al-Futtaim',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'
        },
        {
          rank: '04',
          name: 'Karan Adani',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        }
      ]
    }
  ];

  // Section G: Interactive Podcast State
  isPlayingPodcast = false;
  currentTrack = 'Season 3: Transforming Enterprise';

  // Section H: Events & Roundtables Calendar
  calendarEvents = [
    { dates: ['28', '05', '06', '05'], labels: ['MO', 'TU', 'WE', 'SO'] },
    { dates: ['16', '17', '18', '19'], labels: ['MO', 'TU', 'WE', 'SO'] },
    { dates: ['31'], labels: ['RB'] }
  ];

  // Section J: Print Archive & Special Reports
  printArchiveIssues = [
    { title: 'The Resilience Playbook', subtitle: 'The Resilience Playbook - Fall 2026', 
          image: 'https://i0.wp.com/www.themediaant.com/blog/wp-content/uploads/2024/09/business-today.jpg?resize=369%2C500&ssl=1 '

    },
    { title: 'The AI Mandate', subtitle: 'The AI Mandate - Q3 2026', 
    image: 'https://mysubs.in/wp-content/uploads/prod_img/15253/22223/forbes-india-magazine-subscription-03-Jul-2026.jpg'
    },
    { title: 'Global Expansion', subtitle: 'Global Expansion - Summer 2026', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRpsnCU6wLlu8pvUuCxIE0rW66N_A-T8LNagh50cDQd9lLz_PKVZJggVY&s=10'
    }
  ];

 

intelligenceReport = {
  badge: 'EXECUTIVE INTELLIGENCE REPORTS',
  title: 'The 2027 C-Suite Agenda Report',
  description: 'Analysis on emerging markets, board structures, and digital transformation.'
};

  // Section K: Markets, Wealth & Unicorn Tracker
  dealFlowData = [
    {
      company: 'LogisticsTech',
      headline: 'Series B Funding Secured',
      transaction: 'Transaction: ₹1,250 Cr',
      date: '3 May 2026'
    },
    {
      company: 'FinTech Hub',
      headline: 'Cross-Border Merger',
      transaction: 'Transaction: $45M',
      date: '2 May 2026'
    },
    {
      company: 'GreenEnergy',
      headline: 'Strategic Joint Venture',
      transaction: 'Transaction: $30M',
      date: '3 May 2026'
    }
  ];

  appointmentData = [
    {
      name: 'Aditya Birla',
      role: 'Appointed Managing Director',
      company: 'Birla Capital',
      date: '4 May 2026'
    },
    {
      name: 'Sunita Reddy',
      role: 'Appointed Independent Director',
      company: 'Apex Health',
      date: '3 May 2026'
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'Promoted to Group CEO',
      company: 'Gulf Tech Ventures',
      date: '2 May 2026'
    }
  ];

  // Section I: Newsletter state
  newsletterEmail = '';

  ngOnInit(): void {
    this.startAutoSlide();
  }

  selectTab(tab: string): void {
    this.activeSectorTab = tab;
  }

  togglePodcast(): void {
    this.isPlayingPodcast = !this.isPlayingPodcast;
  }

  subscribeNewsletter(): void {
    // Simulate newsletter subscription
    this.newsletterEmail = '';
  }
}