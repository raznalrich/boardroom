import { Component, OnDestroy, OnInit, computed, input, signal } from '@angular/core';
import { AppEvent, eventStart } from '../../core/data/events.service';

/**
 * A live countdown to an event's start (days, hours, minutes, seconds), ticking once a second.
 * Uses the event's date plus the first clock time in its time text, in the visitor's local time.
 */
@Component({
  selector: 'app-event-countdown',
  standalone: true,
  templateUrl: './event-countdown.component.html',
  styleUrls: ['./event-countdown.component.scss']
})
export class EventCountdownComponent implements OnInit, OnDestroy {
  readonly event = input.required<AppEvent>();

  private now = signal(Date.now());
  private timer: ReturnType<typeof setInterval> | null = null;

  /** Milliseconds until the event starts (never negative). */
  private remaining = computed(() => Math.max(0, eventStart(this.event()).getTime() - this.now()));

  started = computed(() => this.remaining() === 0);

  units = computed(() => {
    const total = Math.floor(this.remaining() / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return [
      { label: 'Days', value: String(Math.floor(total / 86400)).padStart(2, '0') },
      { label: 'Hours', value: pad(Math.floor((total % 86400) / 3600)) },
      { label: 'Minutes', value: pad(Math.floor((total % 3600) / 60)) },
      { label: 'Seconds', value: pad(total % 60) }
    ];
  });

  ngOnInit(): void {
    this.timer = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
