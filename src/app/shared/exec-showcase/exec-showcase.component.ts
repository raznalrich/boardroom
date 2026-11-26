import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SpotlightService } from '../../core/data/spotlight.service';

@Component({
  selector: 'app-exec-showcase',
  standalone: true,
  templateUrl: './exec-showcase.component.html',
  styleUrl: './exec-showcase.component.scss'
})
export class ExecShowcaseComponent implements OnInit, OnDestroy {
  private spotlight = inject(SpotlightService);
  readonly people = this.spotlight.shown;
  current = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private touchX = 0;

  ngOnInit(): void { this.start(); }
  ngOnDestroy(): void { this.pause(); }

  start(): void { this.pause(); this.timer = setInterval(() => this.next(), 5500); }
  pause(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  /** Keeps the position valid if slides are removed while the page is open. */
  get index(): number { return this.current < this.people().length ? this.current : 0; }
  next(): void { this.current = (this.current + 1) % this.people().length; }
  prev(): void { this.current = (this.current - 1 + this.people().length) % this.people().length; }
  go(i: number): void { this.current = i; this.start(); }
  touchStart(e: TouchEvent): void { this.touchX = e.changedTouches[0].clientX; }
  touchEnd(e: TouchEvent): void {
    const d = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(d) > 50) { if (d < 0) { this.next(); } else { this.prev(); } this.start(); }
  }
}
