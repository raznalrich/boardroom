import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PowerListPerson, RoundtableGuest, SettingsService } from '../../../core/data/settings.service';
import { uploadImage, uploadPdf } from '../../../core/util/image.util';

type Notice = { type: 'ok' | 'err'; text: string };

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent {
  private svc = inject(SettingsService);

  readonly guests = this.svc.roundtable;
  readonly people = this.svc.powerList;
  readonly report = this.svc.report;
  readonly loaded = this.svc.loaded;

  // ---------- Roundtable guests ----------
  editingGuest = signal<string | null>(null);
  guestModel = { name: '', role: '', organisation: '', image: '', imageKey: null as string | null };
  guestNotice = signal<Notice | null>(null);

  // ---------- Power list ----------
  editingPerson = signal<string | null>(null);
  personModel = { rank: 1, name: '', headline: '', image: '', imageKey: null as string | null };
  personNotice = signal<Notice | null>(null);

  // ---------- Executive intelligence report ----------
  reportModel = { title: '', description: '', pdfUrl: '', pdfKey: null as string | null, pdfName: '' };
  reportNotice = signal<Notice | null>(null);
  reportReady = false;

  uploading = signal(false);
  saving = signal(false);
  uploadError = signal('');

  constructor() {
    // Fill the report form once the saved report arrives from Supabase.
    effect(() => {
      const r = this.report();
      if (r && !this.reportReady) {
        this.reportModel = { title: r.title, description: r.description, pdfUrl: r.pdfUrl, pdfKey: r.pdfKey ?? null, pdfName: r.pdfName };
        this.reportReady = true;
      }
    });
  }

  // ===== Roundtable =====
  editGuest(g: RoundtableGuest): void {
    this.editingGuest.set(g.id);
    this.guestModel = { name: g.name, role: g.role, organisation: g.organisation, image: g.image, imageKey: g.imageKey ?? null };
    this.guestNotice.set(null);
    this.uploadError.set('');
  }

  async onGuestPhoto(e: Event): Promise<void> {
    const up = await this.pickImage(e, 'profiles', 500);
    if (up) { this.guestModel.image = up.url; this.guestModel.imageKey = up.key; }
  }

  async saveGuest(form: NgForm): Promise<void> {
    const id = this.editingGuest();
    if (form.invalid || !id || this.saving()) return;
    this.saving.set(true);
    const { error } = await this.svc.saveGuest({ id, ...this.guestModel });
    this.saving.set(false);
    if (error) { this.guestNotice.set({ type: 'err', text: `Could not save: ${error}` }); return; }
    this.editingGuest.set(null);
    this.guestNotice.set({ type: 'ok', text: 'Roundtable guest updated. It is live on the home page.' });
  }

  // ===== Power list =====
  editPerson(p: PowerListPerson): void {
    this.editingPerson.set(p.id);
    this.personModel = { rank: p.rank, name: p.name, headline: p.headline, image: p.image, imageKey: p.imageKey ?? null };
    this.personNotice.set(null);
    this.uploadError.set('');
  }

  async onPersonPhoto(e: Event): Promise<void> {
    const up = await this.pickImage(e, 'profiles', 500);
    if (up) { this.personModel.image = up.url; this.personModel.imageKey = up.key; }
  }

  async savePerson(form: NgForm): Promise<void> {
    const id = this.editingPerson();
    if (form.invalid || !id || this.saving()) return;
    this.saving.set(true);
    const { error } = await this.svc.savePerson({ id, ...this.personModel, rank: Number(this.personModel.rank) });
    this.saving.set(false);
    if (error) { this.personNotice.set({ type: 'err', text: `Could not save: ${error}` }); return; }
    this.editingPerson.set(null);
    this.personNotice.set({ type: 'ok', text: 'Power List updated. It is live on the home page.' });
  }

  // ===== Report =====
  async onReportPdf(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    this.uploadError.set('');
    if (!file) return;
    this.uploading.set(true);
    try {
      const up = await uploadPdf(file);
      this.reportModel.pdfUrl = up.url;
      this.reportModel.pdfKey = up.key;
      this.reportModel.pdfName = file.name;
    } catch (err) {
      this.uploadError.set((err as Error).message);
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  removeReportPdf(): void {
    if (!confirm('Remove the PDF from the report? The Download button will disappear from the home page after you save.\n\nThe file stays in your R2 bucket.')) return;
    this.reportModel.pdfUrl = '';
    this.reportModel.pdfKey = null;
    this.reportModel.pdfName = '';
  }

  async saveReport(form: NgForm): Promise<void> {
    if (form.invalid || this.saving()) return;
    this.saving.set(true);
    const { error } = await this.svc.saveReport(this.reportModel);
    this.saving.set(false);
    this.reportNotice.set(error
      ? { type: 'err', text: `Could not save: ${error}` }
      : { type: 'ok', text: 'Executive intelligence report saved. It is live on the home page.' });
  }

  // ===== shared =====
  cancelEdit(): void {
    this.editingGuest.set(null);
    this.editingPerson.set(null);
    this.uploadError.set('');
  }

  private async pickImage(event: Event, folder: 'profiles', maxW: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.uploadError.set('');
    if (!file) return null;
    this.uploading.set(true);
    try {
      return await uploadImage(file, folder, maxW);
    } catch (err) {
      this.uploadError.set((err as Error).message);
      return null;
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }
}
