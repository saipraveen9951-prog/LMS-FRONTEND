import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, Role } from '../../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwtToken';
  private roleKey = 'currentRole';
  private emailKey = 'currentEmail';

  constructor(private api: ApiService) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', request).pipe(
      tap(response => {
        const token = this.extractToken(response);
        const role = this.normalizeRole(response.role || response.authority || response.userRole);
        if (!token || !role) {
          throw new Error('Login response must include token and role.');
        }
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.roleKey, role);
        localStorage.setItem(this.emailKey, response.email || request.email);
      })
    );
  }

  register(request: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    departmentId: number | null;
  }): Observable<unknown> {
    return this.api.post('auth/register', request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.emailKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): Role | null {
    return this.normalizeRole(localStorage.getItem(this.roleKey));
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private extractToken(response: LoginResponse): string {
    return response.accessToken || response.token || response.jwt || response.jwtToken || response.access_token || '';
  }

  private normalizeRole(value: unknown): Role | null {
    const role = String(value || '').replace(/^ROLE_/i, '').toUpperCase();
    return role === 'ADMIN' || role === 'TRAINER' || role === 'EMPLOYEE' ? role : null;
  }
}
