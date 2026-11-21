import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SECTOR_TABS } from '../../core/data/sector.data';
import { FormsService } from '../../core/data/forms.service';

@Component({
  selector: 'app-submit-blog',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './submit-blog.component.html',
  styleUrls: ['./submit-blog.component.scss'],
  host: { class: 'pg' }
})
export class SubmitBlogComponent {
  private forms = inject(FormsService);
  sending = false;
  error = '';
  categories = SECTOR_TABS.filter(t => t !== 'ALL');

  name = '';
  email = '';
  headline = '';
  category = '';
  content = '';
  submitted = false;

  async submit(form: NgForm): Promise<void> {
    if (form.invalid || this.sending) {
      return;
    }
    this.sending = true;
    this.error = '';
    const err = await this.forms.submitBlog({
      name: this.name, email: this.email, headline: this.headline, category: this.category, content: this.content
    });
    this.sending = false;
    if (err) {
      this.error = err;
      return;
    }
    this.submitted = true;
  }

  reset(): void {
    this.name = this.email = this.headline = this.category = this.content = '';
    this.submitted = false;
  }
}
