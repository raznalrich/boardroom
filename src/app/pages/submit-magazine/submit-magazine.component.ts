import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SUBMISSIONS_EMAIL } from '../../core/data/contact.config';

@Component({
  selector: 'app-submit-magazine',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './submit-magazine.component.html',
  styleUrls: ['./submit-magazine.component.scss'],
  host: { class: 'pg' }
})
export class SubmitMagazineComponent {
  readonly email = SUBMISSIONS_EMAIL;

  name = '';
  title = '';
  opened = false;

  steps = [
    { n: '01', t: 'Tell us about it', d: 'Enter your name and the magazine title below.' },
    { n: '02', t: 'Open your email', d: 'We prepare a ready-to-send message for you.' },
    { n: '03', t: 'Attach & send', d: 'Attach your magazine (PDF) and hit send. We reply within 3 working days.' }
  ];

  /** Opens the user's mail client with a pre-filled message addressed to the editorial team. */
  get mailto(): string {
    const subject = `Magazine submission: ${this.title || 'Untitled'}`;
    const body =
      `Hello BoardRoom Editorial Team,\n\n` +
      `I would like to submit my magazine for publication.\n\n` +
      `Name: ${this.name}\n` +
      `Magazine title: ${this.title}\n\n` +
      `Please find the magazine attached (PDF).\n\n` +
      `Regards,\n${this.name}`;
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  send(form: NgForm): void {
    if (form.invalid) {
      return;
    }
    this.opened = true;
    window.location.href = this.mailto;
  }
}
