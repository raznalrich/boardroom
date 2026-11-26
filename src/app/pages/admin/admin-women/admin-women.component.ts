import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Woman, WomenService } from '../../../core/data/women.service';
import { uploadImage } from '../../../core/util/image.util';

@Component({
  selector: 'app-admin-women',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-women.component.html',
  styleUrls: ['./admin-women.component.scss']
})
export class AdminWomenComponent {
  private svc = inject(WomenService);

  readonly women = this.svc.all;

  /** 'list' shows the profiles (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private nextOrder(): number {
    const orders = this.svc.all().map(w => w.sortOrder);
    return (orders.length ? Math.max(...orders) : 0) + 1;
  }

  private emptyModel() {
    return { name: '', role: '', organisation: '', quote: '', image: '', imageKey: null as string | null, sortOrder: this.nextOrder(), active: true };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await uploadImage(file, 'profiles', 900);
      this.model.image = up.url;
      this.model.imageKey = up.key;
    } catch (e) {
      this.imageError.set((e as Error).message);
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removeImage(): void {
    this.model.image = '';
    this.model.imageKey = null;
  }

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.saving()) return;
    if (!this.model.image) {
      this.imageError.set('Please upload a photo.');
      return;
    }
    this.saving.set(true);
    const editing = this.editingId() !== null;
    const { error } = await this.svc.save({ ...this.model, sortOrder: Number(this.model.sortOrder), id: this.editingId() ?? undefined });
    this.saving.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not save: ${error}` });
      return;
    }
    this.reset(form);
    this.view.set('list');
    this.message.set({ type: 'ok', text: editing ? 'Profile updated.' : 'Profile added. It now appears in the Women Empowerment section.' });
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

  edit(w: Woman): void {
    this.view.set('form');
    this.editingId.set(w.id);
    this.model = { name: w.name, role: w.role, organisation: w.organisation, quote: w.quote, image: w.image, imageKey: w.imageKey ?? null, sortOrder: w.sortOrder, active: w.active };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async toggleActive(w: Woman): Promise<void> {
    const { error } = await this.svc.save({ ...w, active: !w.active });
    this.message.set(error ? { type: 'err', text: `Could not update: ${error}` } : null);
  }

  async remove(w: Woman): Promise<void> {
    if (!confirm(`Delete the profile of ${w.name}?`)) return;
    const { error } = await this.svc.remove(w.id);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      return;
    }
    if (this.editingId() === w.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
