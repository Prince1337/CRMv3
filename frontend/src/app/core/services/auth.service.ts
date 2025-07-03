import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuthStatus();
  }

  /**
   * Login mit Username und Passwort
   */
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginRequest)
      .pipe(
        tap(response => {
          this.saveTokens(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  /**
   * Registrierung eines neuen Benutzers
   */
  register(registerRequest: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, registerRequest);
  }

  /**
   * Logout
   */
  logout(): Observable<any> {
    const token = this.getAccessToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(`${this.API_URL}/logout`, {}, { headers })
        .pipe(
          tap(() => {
            this.clearAuthData();
            this.isAuthenticatedSubject.next(false);
            this.currentUserSubject.next(null);
          })
        );
    }
    this.clearAuthData();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    return new Observable(observer => observer.next({}));
  }

  /**
   * Token erneuern
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Kein Refresh-Token verfügbar');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${refreshToken}`);
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}, { headers })
      .pipe(
        tap(response => {
          this.saveTokens(response);
        })
      );
  }

  /**
   * Token validieren
   */
  validateToken(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      return new Observable(observer => observer.next(false));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<boolean>(`${this.API_URL}/validate`, {}, { headers });
  }

  /**
   * Benutzerprofil abrufen
   */
  getProfile(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.API_URL}/profile`, { headers })
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * HTTP-Headers für authentifizierte Requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /**
   * Prüft ob der Benutzer authentifiziert ist
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Gibt den aktuellen Benutzer zurück
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Speichert Tokens sicher
   */
  private saveTokens(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    
    // Token-Expiration berechnen und speichern
    const expiresAt = new Date().getTime() + response.expiresIn;
    localStorage.setItem('token_expires_at', expiresAt.toString());
  }

  /**
   * Access-Token abrufen
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Refresh-Token abrufen
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Prüft ob Token abgelaufen ist
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) {
      return true;
    }
    return new Date().getTime() > parseInt(expiresAt);
  }

  /**
   * Initialisiert den Auth-Status ohne Token zu entfernen
   */
  private initializeAuthStatus(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired()) {
      console.log('Initializing auth status with valid token');
      this.isAuthenticatedSubject.next(true);
      // Benutzerprofil im Hintergrund laden
      this.getProfile().subscribe({
        error: (error) => {
          console.error('Profile loading failed during init:', error);
          // Nur bei 401 Token entfernen
          if (error.status === 401) {
            this.clearAuthData();
            this.isAuthenticatedSubject.next(false);
          }
        }
      });
    } else if (token && this.isTokenExpired()) {
      console.log('Token expired during init, attempting refresh');
      this.refreshToken().subscribe({
        next: () => {
          this.isAuthenticatedSubject.next(true);
        },
        error: () => {
          this.clearAuthData();
          this.isAuthenticatedSubject.next(false);
        }
      });
    } else {
      console.log('No valid token found during init');
      this.isAuthenticatedSubject.next(false);
    }
  }

  /**
   * Auth-Daten löschen
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Prüft den Auth-Status manuell (mit Token-Validierung)
   */
  checkAuthStatus(): Observable<boolean> {
    const token = this.getAccessToken();
    console.log('Checking auth status...', { 
      hasToken: !!token, 
      tokenExpired: this.isTokenExpired(),
      expiresAt: localStorage.getItem('token_expires_at')
    });
    
    if (!token) {
      return new Observable(observer => observer.next(false));
    }

    if (this.isTokenExpired()) {
      console.log('Token expired, attempting refresh...');
      return this.refreshToken().pipe(
        map(() => {
          this.isAuthenticatedSubject.next(true);
          return true;
        }),
        tap({
          error: () => {
            this.clearAuthData();
            this.isAuthenticatedSubject.next(false);
          }
        })
      );
    }

    console.log('Token exists and not expired, validating...');
    return this.validateToken().pipe(
      map(isValid => {
        console.log('Token validation result:', isValid);
        if (isValid) {
          this.isAuthenticatedSubject.next(true);
          return true;
        } else {
          console.log('Token validation failed, clearing auth data');
          this.clearAuthData();
          this.isAuthenticatedSubject.next(false);
          return false;
        }
      }),
      tap({
        error: (error) => {
          console.error('Token validation error:', error);
          // Nur bei 401 (Unauthorized) Token entfernen
          if (error.status === 401) {
            this.clearAuthData();
            this.isAuthenticatedSubject.next(false);
          }
        }
      })
    );
  }
} 