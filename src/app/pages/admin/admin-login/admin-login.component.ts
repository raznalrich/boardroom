import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../../core/auth/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  private auth = inject(AdminAuthService);
  private router = inject(Router);

  username = '';
  password = '';
  showPassword = signal(false);
  error = signal('');
  loading = signal(false);

  async submit(): Promise<void> {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    const err = await this.auth.login(this.username, this.password);
    this.loading.set(false);
    if (err) {
      this.error.set(err);
      return;
    }
    await this.router.navigate(['/b-admin/dashboard']);
  }
}
