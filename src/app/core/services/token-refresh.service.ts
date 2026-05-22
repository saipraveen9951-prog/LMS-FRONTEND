import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TokenRefreshService {
  constructor(private http: HttpClient) {}

  refresh(refreshToken: string) {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((resp: any) => {
        // expected response: { accessToken, refreshToken }
        if (resp?.accessToken) { localStorage.setItem('sf_access_token', resp.accessToken); }
        if (resp?.refreshToken) { localStorage.setItem('sf_refresh_token', resp.refreshToken); }
      })
    );
  }
}
