import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Article, ArticlesService } from '../../../core/data/articles.service';
import { SECTOR_TABS } from '../../../core/data/sector.data';
import { uploadImage } from '../../../core/util/image.util';

@Component({
  selector: 'app-admin-articles',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-articles.component.html',
  styleUrls: ['./admin-articles.component.scss']
})
export class AdminArticlesComponent {
  private svc = inject(ArticlesService);

  readonly articles = this.svc.all;
  readonly categories = SECTOR_TABS.filter(t => t !== 'ALL');

  /** 'list' shows uploaded articles (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private emptyModel() {
    return {
      title: '', category: '', author: '', summary: '', content: '',
      image: '', imageKey: null as string | null, status: 'Published' as 'Published' | 'Draft'
    };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await uploadImage(file, 'articles', 1000);
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
    if (form.invalid || !this.model.image || this.saving() || this.uploading()) return;
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
    this.message.set({ type: 'ok', text: editing ? 'Article updated.' : 'Article added successfully.' });
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

  edit(a: Article): void {
    this.view.set('form');
    this.editingId.set(a.id);
    this.model = {
      title: a.title, category: a.category, author: a.author, summary: a.summary,
      content: a.content, image: a.image, imageKey: a.imageKey ?? null, status: a.status
    };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async publish(a: Article): Promise<void> {
    const { error } = await this.svc.publish(a.id);
    this.message.set(error
      ? { type: 'err', text: `Could not publish: ${error}` }
      : { type: 'ok', text: `“${a.title}” is now published.` });
  }

  async remove(a: Article): Promise<void> {
    if (!confirm(`Delete “${a.title}”?`)) return;
    const { error } = await this.svc.remove(a.id);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      return;
    }
    if (this.editingId() === a.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
