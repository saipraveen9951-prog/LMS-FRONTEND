import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    const roles = route.data['roles'] as Role[] | undefined;
    const role = this.auth.getRole();
    if (!roles || (role && roles.includes(role))) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
