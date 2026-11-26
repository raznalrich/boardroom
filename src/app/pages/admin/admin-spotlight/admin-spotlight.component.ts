import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Spotlight, SpotlightService } from '../../../core/data/spotlight.service';
import { uploadImage } from '../../../core/util/image.util';

@Component({
  selector: 'app-admin-spotlight',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-spotlight.component.html',
  styleUrls: ['./admin-spotlight.component.scss']
})
export class AdminSpotlightComponent {
  private svc = inject(SpotlightService);

  readonly slides = this.svc.all;

  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private nextOrder(): number {
    const orders = this.svc.all().map(s => s.sortOrder);
    return (orders.length ? Math.max(...orders) : 0) + 1;
  }

  private emptyModel() {
    return { name: '', role: '', summary: '', image: '', imageKey: null as string | null, sortOrder: this.nextOrder(), active: true };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      // kept as PNG so a transparent background survives (that is what makes the slide look cut out)
      const up = await uploadImage(file, 'profiles', 1100, true);
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
      this.message.set({ type: 'err', text: 'Could not save: ' + error });
      return;
    }
    this.reset(form);
    this.view.set('list');
    this.message.set({ type: 'ok', text: editing ? 'Slide updated.' : 'Slide added. It now appears in the home page slideshow.' });
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

  edit(s: Spotlight): void {
    this.view.set('form');
    this.editingId.set(s.id);
    this.model = { name: s.name, role: s.role, summary: s.summary, image: s.image, imageKey: s.imageKey ?? null, sortOrder: s.sortOrder, active: s.active };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async toggleActive(s: Spotlight): Promise<void> {
    const { error } = await this.svc.save({ ...s, active: !s.active });
    this.message.set(error ? { type: 'err', text: 'Could not update: ' + error } : null);
  }

  async remove(s: Spotlight): Promise<void> {
    if (!confirm('Delete the slide for ' + s.name + '?')) return;
    const { error } = await this.svc.remove(s.id);
    if (error) {
      this.message.set({ type: 'err', text: 'Could not delete: ' + error });
      return;
    }
    if (this.editingId() === s.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
