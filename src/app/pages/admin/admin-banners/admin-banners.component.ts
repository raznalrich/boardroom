import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Banner, BannersService } from '../../../core/data/banners.service';
import { uploadImage } from '../../../core/util/image.util';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './admin-banners.component.html',
  styleUrls: ['./admin-banners.component.scss']
})
export class AdminBannersComponent {
  private svc = inject(BannersService);

  readonly banners = this.svc.all;
  readonly tagSuggestions = ['EDITORIAL', 'MARKETS', 'INNOVATION', 'LEADERSHIP', 'STRATEGY', 'ECONOMY'];

  /** 'list' shows the banners (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  pendingDelete = signal<Banner | null>(null);
  deleting = signal(false);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private nextOrder(): number {
    const orders = this.svc.all().map(b => b.sortOrder);
    return (orders.length ? Math.max(...orders) : 0) + 1;
  }

  private emptyModel() {
    return {
      tag: 'EDITORIAL', title: '', author: '', readMins: 5, bulletsText: '',
      image: '', imageKey: null as string | null, sortOrder: this.nextOrder(), active: true
    };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      // Banners are shown large, so keep more resolution than the other uploads.
      const up = await uploadImage(file, 'articles', 1600);
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
      this.imageError.set('Please upload a banner image.');
      return;
    }
    this.saving.set(true);
    const editing = this.editingId() !== null;
    const { bulletsText, ...rest } = this.model;
    const { error } = await this.svc.save({
      ...rest,
      readMins: Number(rest.readMins),
      sortOrder: Number(rest.sortOrder),
      bullets: bulletsText.split('\n'),
      id: this.editingId() ?? undefined
    });
    this.saving.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not save: ${error}` });
      return;
    }
    this.reset(form);
    this.view.set('list');
    this.message.set({ type: 'ok', text: editing ? 'Banner updated.' : 'Banner added. It now appears on the home page.' });
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

  edit(b: Banner): void {
    this.view.set('form');
    this.editingId.set(b.id);
    this.model = {
      tag: b.tag, title: b.title, author: b.author, readMins: b.readMins, bulletsText: b.bullets.join('\n'),
      image: b.image, imageKey: b.imageKey ?? null, sortOrder: b.sortOrder, active: b.active
    };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async toggleActive(b: Banner): Promise<void> {
    const { error } = await this.svc.save({ ...b, active: !b.active });
    this.message.set(error ? { type: 'err', text: `Could not update: ${error}` } : null);
  }

  remove(b: Banner): void {
    this.pendingDelete.set(b);
  }

  cancelDelete(): void {
    if (!this.deleting()) this.pendingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const banner = this.pendingDelete();
    if (!banner || this.deleting()) return;

    this.deleting.set(true);
    const { error } = await this.svc.remove(banner.id);
    this.deleting.set(false);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      this.pendingDelete.set(null);
      return;
    }
    if (this.editingId() === banner.id) this.reset();
    this.pendingDelete.set(null);
    this.message.set({ type: 'ok', text: 'Banner deleted successfully.' });
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
