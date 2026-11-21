import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  return (await auth.isLoggedIn()) ? true : router.createUrlTree(['/b-admin']);
};

/** Skip the login page when already signed in. */
export const adminLoginGuard: CanActivateFn = async () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  return (await auth.isLoggedIn()) ? router.createUrlTree(['/b-admin/dashboard']) : true;
};
