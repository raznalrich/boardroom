import { Component, OnDestroy, OnInit } from '@angular/core';

interface Exec { name: string; role: string; summary: string; img: string; }

@Component({
  selector: 'app-exec-showcase',
  standalone: true,
  templateUrl: './exec-showcase.component.html',
  styleUrl: './exec-showcase.component.scss'
})
export class ExecShowcaseComponent implements OnInit, OnDestroy {
  readonly people: Exec[] = [
    { name: 'Layla Haddad', role: 'Chief Executive Officer', img: 'assets/images/3-removebg-preview.png',
      summary: 'A decisive builder of regional brands, Layla blends bold strategy with human-centred leadership, guiding her teams through growth, transformation and change with calm conviction.' },
    { name: 'Rafael Mendes', role: 'Chairman & Managing Partner', img: 'assets/images/4-removebg-preview.png',
      summary: 'With two decades in boardrooms across three continents, Rafael is known for disciplined capital allocation and for turning complex governance challenges into lasting value.' },
    { name: 'Daniel Tran', role: 'Group Chief Strategy Officer', img: 'assets/images/5-removebg-preview.png',
      summary: 'Daniel leads cross-border expansion and digital strategy, pairing sharp analytical thinking with a quiet, relentless focus on execution and long-term partnerships.' }
  ];
  current = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private touchX = 0;

  ngOnInit(): void { this.start(); }
  ngOnDestroy(): void { this.pause(); }

  start(): void { this.pause(); this.timer = setInterval(() => this.next(), 5500); }
  pause(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  next(): void { this.current = (this.current + 1) % this.people.length; }
  prev(): void { this.current = (this.current - 1 + this.people.length) % this.people.length; }
  go(i: number): void { this.current = i; this.start(); }
  touchStart(e: TouchEvent): void { this.touchX = e.changedTouches[0].clientX; }
  touchEnd(e: TouchEvent): void {
    const d = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(d) > 50) { if (d < 0) { this.next(); } else { this.prev(); } this.start(); }
  }
}
