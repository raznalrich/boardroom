import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { INSIGHT_CATEGORIES, Insight, InsightsService, insightImage } from '../../../core/data/insights.service';
import { uploadImage } from '../../../core/util/image.util';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-insights',
  standalone: true,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent],
  templateUrl: './admin-insights.component.html',
  styleUrls: ['./admin-insights.component.scss']
})
export class AdminInsightsComponent {
  private svc = inject(InsightsService);

  readonly insights = this.svc.all;
  readonly categories = INSIGHT_CATEGORIES;
  readonly image = insightImage;

  /** 'list' shows all insights (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  pendingDelete = signal<Insight | null>(null);
  deleting = signal(false);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private emptyModel() {
    return {
      title: '', category: '', author: '', summary: '', details: '', mins: 5,
      date: new Date().toISOString().slice(0, 10), img: '', imgKey: null as string | null
    };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await uploadImage(file, 'insights', 1000);
      this.model.img = up.url;
      this.model.imgKey = up.key;
    } catch (e) {
      this.imageError.set((e as Error).message);
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removeImage(): void {
    this.model.img = '';
    this.model.imgKey = null;
  }

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.saving()) return;
    if (!this.model.img) {
      this.imageError.set('Please upload an image.');
      return;
    }
    this.saving.set(true);
    const editing = this.editingId() !== null;
    const { error } = await this.svc.save({ ...this.model, mins: Number(this.model.mins), id: this.editingId() ?? undefined });
    this.saving.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not save: ${error}` });
      return;
    }
    this.reset(form);
    this.view.set('list');
    this.message.set({ type: 'ok', text: editing ? 'Insight updated.' : 'Insight added. It now appears on the Insights page.' });
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

  edit(i: Insight): void {
    this.view.set('form');
    this.editingId.set(i.id);
    this.model = {
      title: i.title, category: i.category, author: i.author, summary: i.summary, details: i.details ?? '',
      mins: i.mins, date: i.date, img: i.img, imgKey: i.imgKey ?? null
    };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(i: Insight): void {
    this.pendingDelete.set(i);
  }

  cancelDelete(): void {
    if (!this.deleting()) this.pendingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const insight = this.pendingDelete();
    if (!insight || this.deleting()) return;

    this.deleting.set(true);
    const { error } = await this.svc.remove(insight.id);
    this.deleting.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      this.pendingDelete.set(null);
      return;
    }
    if (this.editingId() === insight.id) this.reset();
    this.pendingDelete.set(null);
    this.message.set({ type: 'ok', text: 'Insight deleted successfully.' });
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
