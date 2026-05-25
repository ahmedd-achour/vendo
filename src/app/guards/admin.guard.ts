import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userData$.pipe(
    take(1),
    map(userData => {
      if (userData && userData.role === 'admin') {
        return true;
      } else {
        // Not an admin or not logged in, redirect to sign-in
        router.navigate(['/sign-in']);
        return false;
      }
    })
  );
};
