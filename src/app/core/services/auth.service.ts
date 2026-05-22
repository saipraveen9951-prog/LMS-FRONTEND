import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private ACCESS_TOKEN_KEY = 'sf_access_token';

  getAccessToken(): string | null { return localStorage.getItem(this.ACCESS_TOKEN_KEY); }
  setAccessToken(token: string) { localStorage.setItem(this.ACCESS_TOKEN_KEY, token); }
  clear() { localStorage.removeItem(this.ACCESS_TOKEN_KEY); }

  // TODO: implement login/logout/refresh flows calling backend APIs
}
