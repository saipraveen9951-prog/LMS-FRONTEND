import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> { return this.request<T>('GET', path); }
  post<T>(path: string, body: any): Observable<T> { return this.request<T>('POST', path, body); }
  put<T>(path: string, body: any): Observable<T> { return this.request<T>('PUT', path, body); }
  patch<T>(path: string, body: any): Observable<T> { return this.request<T>('PATCH', path, body); }
  delete<T>(path: string): Observable<T> { return this.request<T>('DELETE', path); }
  upload<T>(path: string, body: FormData): Observable<T> { return this.request<T>('POST', path, body); }

  private url(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${environment.apiUrl}/${cleanPath}`;
  }

  private request<T>(method: string, path: string, body?: any): Observable<T> {
    const url = this.url(path);
    return this.http.request(method, url, { body, responseType: 'text' }).pipe(
      map(response => this.parseResponse<T>(response, url)),
      catchError(error => throwError(() => this.normalizeError(error, url)))
    );
  }

  private parseResponse<T>(response: string | null, url: string): T {
    const text = response || '';
    if (!text.trim()) return undefined as T;
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(`Backend returned HTML instead of JSON for ${url}. Check that the backend endpoint exists and returns JSON.`);
    }
    return JSON.parse(text) as T;
  }

  private normalizeError(error: any, url: string): Error {
    const body = error?.error;
    if (typeof body === 'string') {
      const trimmed = body.trim();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
        return new Error(`Backend returned an HTML error page for ${url}. Check backend logs for the real exception.`);
      }
      try {
        const parsed = JSON.parse(trimmed);
        return new Error(parsed.message || parsed.error || parsed.detail || error.message || 'Request failed.');
      } catch {
        if (trimmed) return new Error(trimmed);
      }
    }
    if (body?.message) return new Error(body.message);
    if (body?.error) return new Error(body.error);
    if (body?.detail) return new Error(body.detail);
    return error instanceof Error ? error : new Error('Request failed.');
  }
}
