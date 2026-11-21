import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LeadersService } from '../../../core/data/leaders.service';
import { LEADER_REGIONS, Leader } from '../../../core/data/leaders.data';
import { uploadImage } from '../../../core/util/image.util';

@Component({
  selector: 'app-admin-profiles',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin-profiles.component.html',
  styleUrls: ['./admin-profiles.component.scss']
})
export class AdminProfilesComponent {
  private svc = inject(LeadersService);

  readonly profiles = this.svc.all;
  readonly regions = LEADER_REGIONS;

  /** 'list' shows the profiles (default); 'form' shows the add/edit page. */
  view = signal<'list' | 'form'>('list');
  editingId = signal<string | null>(null);
  message = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  imageError = signal('');
  uploading = signal(false);
  saving = signal(false);

  model = this.emptyModel();

  private emptyModel() {
    return { name: '', title: '', company: '', region: '', since: '', quote: '', bio: '', img: '', imgKey: null as string | null };
  }

  async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await uploadImage(file, 'profiles', 700);
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
      this.imageError.set('Please upload a profile photo.');
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
    this.message.set({ type: 'ok', text: editing ? 'Profile updated.' : 'Profile added. It now appears on the website.' });
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

  edit(p: Leader): void {
    this.view.set('form');
    this.editingId.set(p.id ?? null);
    this.model = {
      name: p.name, title: p.title, company: p.company, region: p.region,
      since: p.since, quote: p.quote, bio: p.bio ?? '', img: p.img, imgKey: p.imgKey ?? null
    };
    this.message.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async remove(p: Leader): Promise<void> {
    if (!p.id || !confirm(`Delete the profile of ${p.name}?`)) return;
    const { error } = await this.svc.remove(p.id);
    if (error) {
      this.message.set({ type: 'err', text: `Could not delete: ${error}` });
      return;
    }
    if (this.editingId() === p.id) this.reset();
  }

  reset(form?: NgForm): void {
    this.editingId.set(null);
    this.model = this.emptyModel();
    this.imageError.set('');
    form?.resetForm(this.model);
  }
}
