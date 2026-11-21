import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AppEvent, EVENT_SEATS, EVENT_TYPES, EventsService, eventDay, eventMonth, eventYear } from '../../../core/data/events.service';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.scss']
})
export class AdminEventsComponent {
  private svc = inject(EventsService);

  readonly events = this.svc.all;
  readonly upcomingCount = () => this.svc.upcoming().length;
  readonly types = EVENT_TYPES;
  readonly seatOptions = EVENT_SEATS;
  readonly day = eventDay;
  readonly month = eventMonth;
  readonly year = eventYear;

  /** 'list' shows the events (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  saving = signal(false);

  model = this.emptyModel();

  private emptyModel() {
    return { title: '', type: '', date: '', time: '', city: '', seats: 'Open' };
  }

  isPast(e: AppEvent): boolean {
    return this.svc.isPast(e);
  }

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.saving()) return;
    this.saving.set(true);
    const editing = this.editingId() !== null;
    const { error } = await this.svc.save({ ...this.model, id: this.editingId() ?? undefined });
    this.saving.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not save: ${error}` });
      return;
    }
    this.reset(form);
    this.view.set('list');
    this.message.set({ type: 'ok', text: editing ? 'Event updated.' : 'Event added. It now appears on the website.' });
  }

  addNew(): void {
    this.reset();
    this.message.set(null);
    this.view.set('form');
  }

  cancel(form?: NgForm): void {
    this.reset(form);
    this.view.set('list');
  }

  edit(e: AppEvent): void {
    this.view.set('form');
    this.editingId.set(e.id);
    this.model = { title: e.title, type: e.type, date: e.date, time: e.time, city: e.city, seats: e.seats };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(e: AppEvent): Promise<void> {
    if (!confirm(`Delete “${e.title}”?`)) return;
    const { error } = await this.svc.remove(e.id);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      return;
    }
    if (this.editingId() === e.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    form?.resetForm(this.model);
  }
}
