import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Woman, WomenService } from '../../core/data/women.service';

interface Slot { cur: Woman; prev: Woman | null; n: number; }
interface Layer { key: string; w: Woman; out: boolean; }

/**
 * Women Empowerment section: three parts side by side.
 *   part 1 : one large profile
 *   part 2 : two profiles stacked
 *   part 3 : two profiles stacked
 * One slot at a time swaps to a woman who is not on screen, in round-robin order, so the section keeps changing for
 * ever. The old card fades out sliding left while the new one fades in sliding from the right.
 * Rotation pauses while the pointer is over the section.
 */
@Component({
  selector: 'app-women-empowerment',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './women-empowerment.component.html',
  styleUrls: ['./women-empowerment.component.scss']
})
export class WomenEmpowermentComponent implements OnDestroy {
  private svc = inject(WomenService);

  /** 1 large + 2 + 2 */
  private readonly SLOTS = 5;
  private readonly INTERVAL_MS = 3200;
  private readonly FADE_MS = 900;

  private slots = signal<Slot[]>([]);
  private cursor = 0;
  private pointer = 0;
  private timer: ReturnType<typeof setInterval>;
  paused = false;

  /** Per slot: the card on screen plus, during a transition, the one leaving. */
  private view = computed<{ layers: Layer[] }[]>(() =>
    this.slots().map(s => ({
      layers: [
        ...(s.prev ? [{ key: `${s.prev.id}-out-${s.n}`, w: s.prev, out: true }] : []),
        { key: `${s.cur.id}-${s.n}`, w: s.cur, out: false }
      ]
    }))
  );

  one = computed(() => this.view()[0]?.layers ?? []);
  two = computed(() => this.view().slice(1, 3));
  three = computed(() => this.view().slice(3, 5));

  constructor() {
    effect(() => {
      const pool = this.svc.shown();
      untracked(() => this.sync(pool));
    });
    this.timer = setInterval(() => this.tick(), this.INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  /** (Re)build the slots when the list of women arrives or changes. */
  private sync(pool: Woman[]): void {
    const current = this.slots();
    const ids = new Set(pool.map(w => w.id));
    if (!current.length || current.some(s => !ids.has(s.cur.id))) {
      this.slots.set(pool.slice(0, this.SLOTS).map(w => ({ cur: w, prev: null, n: 0 })));
      this.pointer = pool.length ? this.SLOTS % pool.length : 0;
      this.cursor = 0;
    } else {
      // same people, possibly edited in the admin: refresh their details without a transition
      this.slots.set(current.map(s => ({ ...s, cur: pool.find(w => w.id === s.cur.id) ?? s.cur })));
    }
  }

  private tick(): void {
    if (this.paused) return;
    const pool = this.svc.shown();
    const slots = this.slots();
    if (pool.length < 2 || !slots.length) return;

    if (pool.length > slots.length) {
      // pick the next woman who is not already on screen
      const visible = new Set(slots.map(s => s.cur.id));
      for (let k = 0; k < pool.length; k++) {
        const candidate = pool[(this.pointer + k) % pool.length];
        if (!visible.has(candidate.id)) {
          this.pointer = (this.pointer + k + 1) % pool.length;
          this.replace(this.cursor++ % slots.length, candidate);
          return;
        }
      }
    } else {
      // no spare women: everyone moves along to the next person in the circle
      this.slots.update(arr => arr.map((s, i) => ({ cur: arr[(i + 1) % arr.length].cur, prev: s.cur, n: s.n + 1 })));
      this.clearLeaving(null);
    }
  }

  private replace(index: number, next: Woman): void {
    this.slots.update(arr => arr.map((s, i) => (i === index ? { cur: next, prev: s.cur, n: s.n + 1 } : s)));
    this.clearLeaving(index);
  }

  /** Once the fade-out has finished, drop the leaving card from the page. */
  private clearLeaving(index: number | null): void {
    const stamp = this.slots().map(s => s.n);
    setTimeout(() => {
      this.slots.update(arr => arr.map((s, i) => ((index === null || i === index) && s.n === stamp[i] ? { ...s, prev: null } : s)));
    }, this.FADE_MS);
  }

  /** "Dr. Hana Mansour" -> "HM" */
  initials(name: string): string {
    return name.replace(/^(dr|mrs|ms|mr)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }
}
