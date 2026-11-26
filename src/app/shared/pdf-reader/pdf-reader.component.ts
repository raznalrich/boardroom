import { Component, ElementRef, HostListener, OnDestroy, OnInit, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfjsReady: Promise<any> | null = null;
/** Loads PDF.js once, only when somebody opens a magazine (keeps it out of the site's main download). */
function loadPdfJs(): Promise<any> {
  const w = window as any;
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  pdfjsReady ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PDFJS;
    s.onload = () => { w.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; resolve(w.pdfjsLib); };
    s.onerror = () => { pdfjsReady = null; reject(new Error('Could not load the PDF viewer')); };
    document.head.appendChild(s);
  });
  return pdfjsReady;
}

/**
 * Pop-up reader: shows the magazine pages inside the site, one after another, like an e-book.
 * Pages are drawn on canvases, so there is no download, print or "open in new tab" control.
 * If the pages cannot be fetched (for example the storage CORS rule does not allow reading from this site),
 * it falls back to the browser's PDF viewer with its toolbar hidden.
 */
@Component({
  selector: 'app-pdf-reader',
  standalone: true,
  template: `
    <div class="backdrop" (click)="closed.emit()" (contextmenu)="$event.preventDefault()">
      <div class="reader" role="dialog" aria-modal="true" [attr.aria-label]="'Reading ' + title()" (click)="$event.stopPropagation()">
        <div class="bar">
          <strong class="ttl">{{ title() }}</strong>
          @if (state() === 'loading' && total() > 0) { <span class="prog">Loading page {{ done() }} of {{ total() }}</span> }
          @if (state() === 'ready' && total() > 0) { <span class="prog">{{ total() }} pages</span> }
          <button type="button" class="x" (click)="closed.emit()" aria-label="Close reader">×</button>
        </div>

        @if (state() === 'fallback') {
          <iframe class="frame" [src]="fallbackSrc()" [title]="title()"></iframe>
        } @else {
          <div class="scroller">
            @if (state() === 'loading' && done() === 0) { <p class="msg">Opening the magazine…</p> }
            <div class="pages" #pages></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }
    .backdrop { position: fixed; inset: 0; z-index: 3500; background: rgba(0, 0, 0, .85); display: grid; place-items: center; padding: 20px; animation: fade .2s ease; user-select: none; -webkit-user-select: none; }
    .reader { width: 100%; max-width: 1000px; height: 94vh; display: flex; flex-direction: column; background: #17130F; border: 1px solid rgba(201, 162, 94, .4); border-top: 4px solid #C9A25E; border-radius: 12px; overflow: hidden; box-shadow: 0 30px 80px rgba(0, 0, 0, .6); }
    .bar { display: flex; align-items: center; gap: 16px; padding: 12px 18px; border-bottom: 1px solid rgba(201, 162, 94, .28); }
    .ttl { flex: 1; min-width: 0; color: #F4EEE2; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .prog { color: #B9AE9B; font-size: 12px; white-space: nowrap; }
    .x { width: 34px; height: 34px; border: 1px solid #C9A25E; border-radius: 50%; background: transparent; color: #E6C98A; font-size: 22px; line-height: 1; cursor: pointer; &:hover { background: #C9A25E; color: #121212; } }
    .scroller { flex: 1; overflow-y: auto; background: #2a2622; padding: 18px 12px 30px; }
    .pages { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .pages ::ng-deep canvas { display: block; max-width: 100%; height: auto !important; background: #fff; box-shadow: 0 10px 28px rgba(0, 0, 0, .5); }
    .msg { margin: 40px 0; text-align: center; color: #B9AE9B; }
    .frame { flex: 1; width: 100%; border: 0; background: #2a2622; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    @media (max-width: 600px) { .backdrop { padding: 0; } .reader { height: 100vh; border-radius: 0; } .scroller { padding: 10px 6px 24px; } }
    @media print { :host { display: none; } }
  `]
})
export class PdfReaderComponent implements OnInit, OnDestroy {
  private sanitizer = inject(DomSanitizer);
  title = input.required<string>();
  url = input.required<string>();
  closed = output<void>();

  private pagesEl = viewChild<ElementRef<HTMLDivElement>>('pages');
  state = signal<'loading' | 'ready' | 'fallback'>('loading');
  total = signal(0);
  done = signal(0);
  private cancelled = false;
  private doc: any = null;

  /** Fallback only: the browser viewer with its toolbar, side panel and download button hidden. */
  fallbackSrc = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.url() + '#toolbar=0&navpanes=0&view=FitH'));

  async ngOnInit(): Promise<void> {
    try {
      const pdfjs = await loadPdfJs();
      this.doc = await pdfjs.getDocument({ url: this.url() }).promise;
      if (this.cancelled) return;
      this.total.set(this.doc.numPages);
      await Promise.resolve();   // let the pages container render
      const host = this.pagesEl()?.nativeElement;
      if (!host) throw new Error('no container');
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.min(host.parentElement?.clientWidth ?? 900, 900) - 24;
      for (let n = 1; n <= this.doc.numPages; n++) {
        if (this.cancelled) return;
        const page = await this.doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (width / base.width) * ratio });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = Math.floor(viewport.width / ratio) + 'px';
        host.appendChild(canvas);
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        this.done.set(n);
      }
      this.state.set('ready');
    } catch (e) {
      if (this.cancelled) return;
      console.warn('Custom PDF reader unavailable, using the browser viewer:', (e as Error).message);
      this.state.set('fallback');
    }
  }

  ngOnDestroy(): void {
    this.cancelled = true;
    void this.doc?.destroy?.();
  }

  @HostListener('document:keydown.escape') onEsc(): void { this.closed.emit(); }
  /** No save / print shortcuts while reading */
  @HostListener('document:keydown', ['$event']) onKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
  }
}
