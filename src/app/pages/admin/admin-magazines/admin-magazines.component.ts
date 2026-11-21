import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Magazine, MagazinesService } from '../../../core/data/magazines.service';
import { uploadImage, uploadPdf } from '../../../core/util/image.util';

@Component({
  selector: 'app-admin-magazines',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-magazines.component.html',
  styleUrls: ['./admin-magazines.component.scss']
})
export class AdminMagazinesComponent {
  private svc = inject(MagazinesService);

  readonly magazines = this.svc.all;

  /** 'list' shows the uploaded magazines (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  coverError = signal('');
  pdfError = signal('');
  uploadingCover = signal(false);
  uploadingPdf = signal(false);
  saving = signal(false);
  /** Name of the PDF picked in this session, for display */
  pdfName = signal('');

  model = this.emptyModel();

  private emptyModel() {
    return {
      title: '', description: '', publishedOn: new Date().toISOString().slice(0, 10),
      cover: '', coverKey: null as string | null, pdfUrl: '', pdfKey: null as string | null, active: true
    };
  }

  async onCover(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.coverError.set('');
    if (!file) return;
    this.uploadingCover.set(true);
    try {
      const up = await uploadImage(file, 'magazines', 900);
      this.model.cover = up.url;
      this.model.coverKey = up.key;
    } catch (e) {
      this.coverError.set((e as Error).message);
    } finally {
      this.uploadingCover.set(false);
      input.value = '';
    }
  }

  async onPdf(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.pdfError.set('');
    if (!file) return;
    this.uploadingPdf.set(true);
    try {
      const up = await uploadPdf(file);
      this.model.pdfUrl = up.url;
      this.model.pdfKey = up.key;
      this.pdfName.set(`${file.name} (${(file.size / 1048576).toFixed(1)} MB)`);
    } catch (e) {
      this.pdfError.set((e as Error).message);
    } finally {
      this.uploadingPdf.set(false);
      input.value = '';
    }
  }

  removeCover(): void {
    this.model.cover = '';
    this.model.coverKey = null;
  }

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.saving()) return;
    if (!this.model.pdfUrl) {
      this.pdfError.set('Please upload the magazine PDF.');
      return;
    }
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
    this.message.set({ type: 'ok', text: editing ? 'Magazine updated.' : 'Magazine added. It now appears on the website.' });
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

  edit(m: Magazine): void {
    this.view.set('form');
    this.editingId.set(m.id);
    this.model = {
      title: m.title, description: m.description, publishedOn: m.publishedOn,
      cover: m.cover, coverKey: m.coverKey ?? null, pdfUrl: m.pdfUrl, pdfKey: m.pdfKey ?? null, active: m.active
    };
    this.pdfName.set('');
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async toggleActive(m: Magazine): Promise<void> {
    const { error } = await this.svc.save({ ...m, active: !m.active });
    this.message.set(error ? { type: 'err', text: `Could not update: ${error}` } : null);
  }

  async remove(m: Magazine): Promise<void> {
    if (!confirm(`Delete the magazine “${m.title}”?\n\nThe PDF and cover stay in your R2 bucket; only the listing is removed.`)) return;
    const { error } = await this.svc.remove(m.id);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      return;
    }
    if (this.editingId() === m.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.coverError.set('');
    this.pdfError.set('');
    this.pdfName.set('');
    form?.resetForm(this.model);
  }
}
