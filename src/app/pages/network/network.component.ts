import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from '../../core/data/forms.service';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
  host: { class: 'pg' }
})
export class NetworkComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private forms = inject(FormsService);
  sending = signal(false);
  error = signal('');

  stats = [{ v: '5,200+', l: 'Members' }, { v: '24', l: 'Chapters' }, { v: '60+', l: 'Private events / year' }, { v: '31', l: 'Countries' }];

  chapters = [
    { city: 'Dubai', members: 940 }, { city: 'Riyadh', members: 720 }, { city: 'Mumbai', members: 610 },
    { city: 'Abu Dhabi', members: 530 }, { city: 'London', members: 410 }, { city: 'Doha', members: 280 }
  ];

  /** Membership application pop-up. */
  modalOpen = signal(false);
  submitted = signal(false);
  name = '';
  phone = '';
  email = '';

  /** 7–15 digits; allows +, spaces, dashes and brackets. */
  readonly phonePattern = /^\+?[0-9\s\-()]{7,18}$/;

  constructor() {
    // Arriving from "Apply for Membership" elsewhere on the site (/network?apply=1) opens the pop-up straight away.
    if (this.route.snapshot.queryParamMap.has('apply')) {
      this.modalOpen.set(true);
    }
  }

  open(): void {
    this.submitted.set(false);
    this.modalOpen.set(true);
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (!this.modalOpen()) return;
    this.modalOpen.set(false);
    // Drop ?apply=1 so a refresh doesn't reopen the pop-up.
    if (this.route.snapshot.queryParamMap.has('apply')) {
      this.router.navigate([], { queryParams: { apply: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.sending()) return;
    this.sending.set(true);
    this.error.set('');
    const err = await this.forms.submitMembership({ name: this.name, phone: this.phone, email: this.email });
    this.sending.set(false);
    if (err) {
      this.error.set(err);
      return;
    }
    this.submitted.set(true);
  }

  finish(): void {
    this.name = this.phone = this.email = '';
    this.close();
  }
}
