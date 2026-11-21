import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AppEvent, EVENT_SEATS, EVENT_TYPES, EventsService, eventDay, eventMonth, eventYear } from '../../../core/data/events.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.scss']
})
export class AdminEventsComponent {
  private svc = inject(EventsService);

  readonly events = this.svc.all;
  readonly upcomingCount = () => this.svc.upcoming().length;
  readonly types = EVENT_TYPES;
  readonly seatOptions = EVENT_SEATS;
  /** Must start with http:// or https:// */
  readonly urlPattern = '^https?://\\S+$';
  readonly day = eventDay;
  readonly month = eventMonth;
  readonly year = eventYear;

  /** 'list' shows the events (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  pendingDelete = signal<AppEvent | null>(null);
  deleting = signal(false);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  saving = signal(false);

  model = this.emptyModel();

  private emptyModel() {
    return { title: '', type: '', date: '', time: '', city: '', seats: 'Open', registerUrl: '', description: '' };
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
    this.model = { title: e.title, type: e.type, date: e.date, time: e.time, city: e.city, seats: e.seats, registerUrl: e.registerUrl, description: e.description };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(e: AppEvent): void {
    this.pendingDelete.set(e);
  }

  cancelDelete(): void {
    if (!this.deleting()) this.pendingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const event = this.pendingDelete();
    if (!event || this.deleting()) return;

    this.deleting.set(true);
    const { error } = await this.svc.remove(event.id);
    this.deleting.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      this.pendingDelete.set(null);
      return;
    }
    if (this.editingId() === event.id) this.reset();
    this.pendingDelete.set(null);
    this.message.set({ type: 'ok', text: 'Event deleted successfully.' });
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    form?.resetForm(this.model);
  }
}
