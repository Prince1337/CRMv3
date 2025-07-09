import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<any>(null);

// URLs die vom Interceptor ausgeschlossen werden sollen
const EXCLUDED_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/validate'
];

function isExcludedUrl(url: string): boolean {
  return EXCLUDED_URLS.some(excludedUrl => url.includes(excludedUrl));
}

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function handleLogout(router: Router): void {
  clearTokens();
  router.navigate(['/login']);
}

function handle401Error(request: HttpRequest<any>, next: HttpHandlerFn, router: Router): Observable<any> {
  console.log('AuthInterceptor: 401-Fehler erkannt, versuche Token-Refresh');
  
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.error('AuthInterceptor: Kein Refresh-Token verfügbar');
      isRefreshing = false;
      handleLogout(router);
      return throwError(() => new Error('Kein Refresh-Token verfügbar'));
    }

    // Refresh-Token Request ohne Interceptor
    const http = inject(HttpClient);
    return http.post<any>('http://localhost:8080/api/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }).pipe(
      tap(response => {
        console.log('AuthInterceptor: Token erfolgreich erneuert');
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
      }),
      switchMap((response) => {
        return next(addToken(request, response.accessToken));
      }),
      catchError((error) => {
        console.error('AuthInterceptor: Token-Refresh fehlgeschlagen:', error);
        isRefreshing = false;
        refreshTokenSubject.next(null);
        handleLogout(router);
        return throwError(() => error);
      })
    );
  } else {
    console.log('AuthInterceptor: Token-Refresh läuft bereits, warte auf Ergebnis');
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(request, token)))
    );
  }
}

function handle403Error(request: HttpRequest<any>, next: HttpHandlerFn, router: Router): Observable<any> {
  console.warn('AuthInterceptor: 403-Fehler - Zugriff verweigert');
  handleLogout(router);
  return throwError(() => new Error('Zugriff verweigert'));
}

export const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Prüfe ob URL vom Interceptor ausgeschlossen ist
  if (isExcludedUrl(req.url)) {
    console.log('AuthInterceptor: URL ausgeschlossen:', req.url);
    return next(req);
  }
  
  // Token zum Request hinzufügen
  const token = getAccessToken();
  if (token) {
    req = addToken(req, token);
  } else {
  }

  return next(req).pipe(
    tap(response => {
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('AuthInterceptor: HTTP-Fehler:', error.status, 'für URL:', req.url);
      
      switch (error.status) {
        case 401:
          if (!req.url.includes('/auth/refresh')) {
            return handle401Error(req, next, router);
          }
          break;
        case 403:
          return handle403Error(req, next, router);
        case 0:
          console.error('AuthInterceptor: Netzwerk-Fehler - möglicherweise Server nicht erreichbar');
          break;
        default:
          console.error('AuthInterceptor: Unbehandelter HTTP-Fehler:', error.status);
      }
      
      return throwError(() => error);
    })
  );
}; 