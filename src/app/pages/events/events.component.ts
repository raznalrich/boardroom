import { Component, signal, computed, inject } from '@angular/core';
import { AppEvent, EventsService, EVENT_TYPES, eventDay, eventMonth, eventStart } from '../../core/data/events.service';
import { EventCountdownComponent } from '../../shared/event-countdown/event-countdown.component';
import { EventDetailModalComponent } from '../../shared/event-detail-modal/event-detail-modal.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [EventCountdownComponent, EventDetailModalComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  host: { class: 'pg' }
})
export class EventsComponent {
  private svc = inject(EventsService);
  types = ['All', ...EVENT_TYPES];
  day = eventDay;
  month = eventMonth;
  active = signal('All');

  /** The event whose details pop-up is open. */
  selected = signal<AppEvent | null>(null);

  /** The next event that has not started yet (re-read each second while the countdown ticks). */
  next = (): AppEvent | null => {
    const now = Date.now();
    return this.svc.upcoming().find(e => eventStart(e).getTime() > now) ?? null;
  };

  filtered = computed(() => this.active() === 'All' ? this.svc.upcoming() : this.svc.upcoming().filter(e => e.type === this.active()));

}
