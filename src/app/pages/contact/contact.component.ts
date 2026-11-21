import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormsService } from '../../core/data/forms.service';
import { SITE } from '../../core/data/site.config';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: { class: 'pg' }
})
export class ContactComponent {
  private forms = inject(FormsService);
  readonly site = SITE;

  name = '';
  email = '';
  subject = '';
  message = '';
  sending = false;
  error = '';
  sent = false;

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.sending) return;
    this.sending = true;
    this.error = '';
    const err = await this.forms.submitContact({ name: this.name, email: this.email, subject: this.subject, message: this.message });
    this.sending = false;
    if (err) {
      this.error = err;
      return;
    }
    this.sent = true;
  }

  again(): void {
    this.name = this.email = this.subject = this.message = '';
    this.sent = false;
  }
}
