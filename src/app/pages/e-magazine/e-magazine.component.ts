import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { PdfReaderComponent } from '../../shared/pdf-reader/pdf-reader.component';
import { MembershipService } from '../../core/data/membership.service';
import { MAGAZINE_REGIONS, Magazine, MagazinesService } from '../../core/data/magazines.service';

@Component({
  selector: 'app-e-magazine',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PdfReaderComponent],
  templateUrl: './e-magazine.component.html',
  styleUrls: ['./e-magazine.component.scss'],
  host: { class: 'pg' }
})
export class EMagazineComponent {
  private svc = inject(MagazinesService);
  private members = inject(MembershipService);
  readonly loaded = this.svc.loaded;

  readonly regions = MAGAZINE_REGIONS;
  private route = inject(ActivatedRoute);
  /** Region chosen in the tabs or the header (?region=Asia); empty means all regions. */
  region = toSignal(this.route.queryParamMap.pipe(map(p => {
    const r = p.get('region') ?? '';
    return (MAGAZINE_REGIONS as readonly string[]).includes(r) ? r : '';
  })), { initialValue: '' });

  /** Enabled issues for the chosen region, newest first. */
  visible = computed(() => this.svc.active().filter(m => !this.region() || m.region === this.region()));

  /** The newest issue is featured at the top. */
  current = computed(() => this.visible()[0] ?? null);

  /** Every other issue in the region, newest first. */
  past = computed(() => this.visible().slice(1));

  /** Colours for covers that have no uploaded picture. */
  readonly fallback = ['#2a2220', '#5a1a3a', '#1d3b34', '#3a3020', '#1f2a44', '#3a1f1f'];


  /** The issue open in the pop-up reader */
  reading = signal<Magazine | null>(null);
  read(e: Event, m: Magazine): void { e.preventDefault(); this.reading.set(m); }

  /** Members-only download: the visitor enters their email, we check it belongs to an approved member. */
  target = signal<Magazine | null>(null);
  email = '';
  state = signal<'idle' | 'checking' | 'no' | 'error' | 'ok'>('idle');

  askDownload(m: Magazine): void {
    this.email = '';
    this.state.set('idle');
    this.target.set(m);
  }

  close(): void { this.target.set(null); }

  async verify(): Promise<void> {
    const m = this.target();
    if (!m || !this.email.trim() || this.state() === 'checking') return;
    this.state.set('checking');
    const result = await this.members.isMember(this.email.trim());
    if (result === 'error') { this.state.set('error'); return; }
    if (!result) { this.state.set('no'); return; }
    this.state.set('ok');
    const a = document.createElement('a');
    a.href = m.pdfUrl;
    a.download = m.title + '.pdf';
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  }
}
