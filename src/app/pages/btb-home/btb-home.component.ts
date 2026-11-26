import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SECTOR_TABS, sectorCover } from '../../core/data/sector.data';
import { Article, ArticlesService } from '../../core/data/articles.service';
import { Banner, BannersService } from '../../core/data/banners.service';
import { MagazinesService } from '../../core/data/magazines.service';
import { SettingsService } from '../../core/data/settings.service';
import { Leader, leaderImageUrl, leaderSlug } from '../../core/data/leaders.data';
import { LeadersService } from '../../core/data/leaders.service';
import { SubscribersService } from '../../core/data/subscribers.service';
import { InsightsService, insightImage } from '../../core/data/insights.service';
import { AppEvent, EventsService, eventDay, eventMonth, eventYear, eventStart } from '../../core/data/events.service';
import { ExecShowcaseComponent } from '../../shared/exec-showcase/exec-showcase.component';
import { WomenEmpowermentComponent } from '../../shared/women-empowerment/women-empowerment.component';
import { EventCountdownComponent } from '../../shared/event-countdown/event-countdown.component';
import { EventDetailModalComponent } from '../../shared/event-detail-modal/event-detail-modal.component';

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
  imports: [CommonModule, RouterLink, FormsModule, EventCountdownComponent, EventDetailModalComponent, WomenEmpowermentComponent, ExecShowcaseComponent],
  templateUrl: './btb-home.component.html',
  styleUrls: ['./btb-home.component.scss']
})
export class BtbHomeComponent implements OnInit, OnDestroy {
  // Main feature story slider: banners managed in the admin console (Supabase `banners` table)
  private bannersSvc = inject(BannersService);
  get heroSlides(): Banner[] {
    return this.bannersSvc.active();
  }
  // Get in touch form
  private subscribersSvc = inject(SubscribersService);
  gitName = '';
  gitEmail = '';
  gitSubmitted = false;

  gitSending = false;
  gitError = '';

  async submitGetInTouch(form: NgForm): Promise<void> {
    if (form.invalid || this.gitSending) {
      return;
    }
    this.gitSending = true;
    this.gitError = '';
    // 'duplicate' (already subscribed) is treated as success so we never reveal who is on the list.
    const result = await this.subscribersSvc.add(this.gitName, this.gitEmail);
    this.gitSending = false;
    if (result === 'error') {
      this.gitError = 'Something went wrong. Please try again.';
      return;
    }
    this.gitSubmitted = true;
  }

  resetGetInTouch(): void {
    this.gitName = '';
    this.gitEmail = '';
    this.gitSubmitted = false;
  }

  // Leaders in Focus: stacked card carousel
  readonly slugOf = leaderSlug;
  private insightsSvc = inject(InsightsService);
  readonly insightImg = insightImage;
  /** People & Voices column: the newest insight is featured, the next two sit below it. */
  get voicesFeatured() {
    return this.insightsSvc.all()[0] ?? null;
  }
  get voicesMini() {
    return this.insightsSvc.all().slice(1, 3);
  }

  /** Three newest insights for the Latest Insights strip. */
  get homeInsights() {
    return this.insightsSvc.all().slice(0, 3);
  }

  private eventsSvc = inject(EventsService);
  readonly evDay = eventDay;
  readonly evMonth = eventMonth;
  readonly evYear = eventYear;
  /** The event whose details pop-up is open. */
  selectedEvent: AppEvent | null = null;

  /**
   * The next event that has not started yet. Re-read on every change-detection pass (the countdown ticks each second),
   * so once an event starts the banner moves on to the following one by itself.
   */
  get nextEvent(): AppEvent | null {
    const now = Date.now();
    return this.eventsSvc.upcoming().find(e => eventStart(e).getTime() > now) ?? null;
  }

  /** Next four upcoming events. */
  get homeEvents() {
    return this.eventsSvc.upcoming().slice(0, 4);
  }

  private leadersSvc = inject(LeadersService);
  get focusLeaders(): Leader[] {
    return this.leadersSvc.all();
  }
  focusIndex = 0;
  private focusTimer: ReturnType<typeof setInterval> | null = null;

  leaderImg(id: string): string {
    return leaderImageUrl(id, 600);
  }

  /** Shortest circular distance of card i from the active card (negative = left of it). */
  focusOffset(i: number): number {
    const n = this.focusLeaders.length;
    if (n === 0) return 0;
    let d = (i - this.focusIndex) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  focusAbs(i: number): number {
    return Math.abs(this.focusOffset(i));
  }

  startFocusAuto(): void {
    this.pauseFocusAuto();
    this.focusTimer = setInterval(() => this.focusNext(), 3500);
  }

  pauseFocusAuto(): void {
    if (this.focusTimer) {
      clearInterval(this.focusTimer);
      this.focusTimer = null;
    }
  }

  focusNext(): void {
    const n = this.focusLeaders.length;
    if (n > 0) this.focusIndex = (this.focusIndex + 1) % n;
  }

  focusPrev(): void {
    const n = this.focusLeaders.length;
    if (n > 0) this.focusIndex = (this.focusIndex - 1 + n) % n;
  }

  focusGo(i: number): void {
    this.focusIndex = i;
  }

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
    const n = this.heroSlides.length;
    if (n > 0) this.currentSlide = (this.currentSlide + 1) % n;
  }

  prevSlide(): void {
    const n = this.heroSlides.length;
    if (n > 0) this.currentSlide = (this.currentSlide - 1 + n) % n;
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
    this.pauseFocusAuto();
  }

  // Section B: Breaking News Ticker Items
  latestNews: string[] = [
    'SMEs secure $400M in Saudi expansion funds',
    'AI transformation sweeps GCC banking sector',
    'India-UAE trade corridor achieves record $85B milestone',
    'Green Hydrogen initiatives attract major VC backing across Middle East'
  ];

  // Section C: Boardroom Roundtable Avatars

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

  // Section E: Sector Deep Dives (filterable blog cards)
  activeSectorTab = 'ALL';
  sectorTabs = SECTOR_TABS;
  private articlesSvc = inject(ArticlesService);
  get sectorArticles(): Article[] {
    return this.articlesSvc.published();
  }
  sectorCover = sectorCover;
  sectorCols = 4;

  /** Cards matching the active category. */
  get filteredSectorArticles(): Article[] {
    return this.activeSectorTab === 'ALL'
      ? this.sectorArticles
      : this.sectorArticles.filter(a => a.category === this.activeSectorTab);
  }

  /** Home shows only two rows; "Read more" opens the Articles page. */
  get visibleSectorArticles(): Article[] {
    const all = this.filteredSectorArticles;
    return all.slice(0, this.sectorCols * 2);
  }

  get sectorHasMore(): boolean {
    return this.filteredSectorArticles.length > this.sectorCols * 2;
  }

  @HostListener('window:resize')
  updateSectorCols(): void {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
    this.sectorCols = w > 1100 ? 4 : w > 800 ? 3 : w > 520 ? 2 : 1;
  }

  // Section F: Power List Visionaries

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
  private settingsSvc = inject(SettingsService);
  /** Roundtable interview guests (Admin -> Settings). */
  get roundtableGuests() {
    return this.settingsSvc.roundtableShown();
  }
  /** Power List people (Admin -> Settings). */
  get powerPeople() {
    return this.settingsSvc.powerListShown();
  }
  /** Executive intelligence report card (Admin -> Settings); sensible defaults until it loads. */
  get intelligence() {
    return this.settingsSvc.report() ?? {
      title: 'The 2027 C-Suite Agenda Report',
      description: 'Comprehensive deep-dives into regional market shifts, M&A activity, and strategic foresight for 2027.',
      pdfUrl: '', pdfName: ''
    };
  }

  private magazinesSvc = inject(MagazinesService);
  /** The three newest enabled magazines (uploaded in the admin console, stored on Cloudflare R2). */
  get homeMagazines() {
    return this.magazinesSvc.active().slice(0, 3);
  }

 


  // Section I: Newsletter state
  newsletterEmail = '';

  ngOnInit(): void {
    this.updateSectorCols();
    this.startAutoSlide();
    this.startFocusAuto();
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