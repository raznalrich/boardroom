import { Injectable, signal } from '@angular/core';

/**
 * Admin sign-in with fixed credentials, checked in the browser.
 *
 * NOTE: credentials in front-end code are visible to anyone who opens the browser's dev tools, so this is a
 * convenience gate for development, not real security. Use Supabase Auth (see git history) before going live.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly EMAIL = 'admin@boardroom.com';
  private readonly PASSWORD = 'boardroom@123';
  private readonly KEY = 'btb_admin_session';

  readonly isAdmin = signal(this.stored());

  /** Returns null on success, otherwise a message to show the user. */
  async login(email: string, password: string): Promise<string | null> {
    if (email.trim().toLowerCase() === this.EMAIL && password === this.PASSWORD) {
      try { sessionStorage.setItem(this.KEY, '1'); } catch { /* storage unavailable */ }
      this.isAdmin.set(true);
      return null;
    }
    return 'Invalid email or password.';
  }

  async logout(): Promise<void> {
    try { sessionStorage.removeItem(this.KEY); } catch { /* ignore */ }
    this.isAdmin.set(false);
  }

  async isLoggedIn(): Promise<boolean> {
    return this.isAdmin();
  }

  private stored(): boolean {
    try { return sessionStorage.getItem(this.KEY) === '1'; } catch { return false; }
  }
}
