import { Component, HostListener, input, output } from '@angular/core';
import { AppEvent, eventDay, eventMonth, eventYear } from '../../core/data/events.service';

/** The event details pop-up, with a "Register now" button that opens the event's registration link. */
@Component({
  selector: 'app-event-detail-modal',
  standalone: true,
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.scss']
})
export class EventDetailModalComponent {
  readonly event = input.required<AppEvent>();
  readonly closed = output<void>();

  readonly day = eventDay;
  readonly month = eventMonth;
  readonly year = eventYear;

  /** "Wednesday, 2 December 2026" */
  longDate(e: AppEvent): string {
    const [y, m, d] = e.date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.closed.emit();
  }
}
