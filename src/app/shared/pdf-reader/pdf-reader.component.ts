import { Component, HostListener, computed, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { inject } from '@angular/core';

/** Pop-up reader: shows a magazine PDF inside the page with the browser's own page viewer (scroll, zoom, page jump). */
@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <div class="reader" role="dialog" aria-modal="true" [attr.aria-label]="'Reading ' + title()" (click)="$event.stopPropagation()">
        <div class="bar">
          <strong class="ttl">{{ title() }}</strong>
          <a class="open" [href]="url()" target="_blank" rel="noopener">Open in new tab ↗</a>
          <button type="button" class="x" (click)="closed.emit()" aria-label="Close reader">×</button>
        </div>
        <iframe class="frame" [src]="src()" [title]="title()"></iframe>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .backdrop { position: fixed; inset: 0; z-index: 3500; background: rgba(0, 0, 0, .82); display: grid; place-items: center; padding: 20px; animation: fade .2s ease; }
    .reader { width: 100%; max-width: 1100px; height: 94vh; display: flex; flex-direction: column; background: #17130F; border: 1px solid rgba(201, 162, 94, .4); border-top: 4px solid #C9A25E; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(0, 0, 0, .6); }
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid rgba(201, 162, 94, .28); }
    .ttl { flex: 1; min-width: 0; color: #F4EEE2; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .open { color: #E6C98A; font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; text-decoration: none; white-space: nowrap; &:hover { text-decoration: underline; } }
    .x { width: 34px; height: 34px; border: 1px solid #C9A25E; border-radius: 50%; background: transparent; color: #E6C98A; font-size: 22px; line-height: 1; cursor: pointer; &:hover { background: #C9A25E; color: #121212; } }
    .frame { flex: 1; width: 100%; border: 0; background: #2a2622; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 600px) { .backdrop { padding: 0; } .reader { height: 100vh; border-radius: 0; } .open { display: none; } }
  `]
})
export class PdfReaderComponent {
  private sanitizer = inject(DomSanitizer);
  title = input.required<string>();
  url = input.required<string>();
  closed = output<void>();

  /** The PDF address comes from our own database; open it fit-to-width in the viewer. */
  src = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.url() + '#view=FitH'));

  @HostListener('document:keydown.escape') onEsc(): void { this.closed.emit(); }
}
