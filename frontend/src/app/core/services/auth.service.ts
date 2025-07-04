import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RegisterResponse, 
  UserProfile, 
  AuthState 
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);

    if (accessToken && refreshToken) {
      const user = userStr ? JSON.parse(userStr) : null;
      this.authStateSubject.next({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): Observable<string> {
    return this.http.post<string>(`${this.API_URL}/auth/logout`, {})
      .pipe(
        tap(() => this.handleLogout()),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('Kein Refresh-Token verfügbar'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(user => this.updateUserProfile(user)),
        catchError(this.handleError)
      );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // Token dekodieren um Benutzerinformationen zu extrahieren
    const user = this.decodeToken(response.accessToken);
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.authStateSubject.next({
      isAuthenticated: true,
      user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    });
  }

  private handleLogout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null
    });

    this.router.navigate(['/login']);
  }

  private updateUserProfile(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      user
    });
  }

  private decodeToken(token: string): UserProfile {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        roles: payload.roles || []
      };
    } catch (error) {
      console.error('Fehler beim Dekodieren des Tokens:', error);
      return {
        id: 0,
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roles: []
      };
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ein unbekannter Fehler ist aufgetreten';
    
    if (error.error instanceof ErrorEvent) {
      // Client-seitiger Fehler
      errorMessage = error.error.message;
    } else {
      // Server-seitiger Fehler
      if (error.status === 401) {
        errorMessage = 'Ungültige Anmeldedaten';
      } else if (error.status === 403) {
        errorMessage = 'Zugriff verweigert';
      } else if (error.status === 404) {
        errorMessage = 'Ressource nicht gefunden';
      } else if (error.status >= 500) {
        errorMessage = 'Server-Fehler';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Hilfsmethoden
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  hasRole(role: string): boolean {
    const user = this.authStateSubject.value.user;
    return user?.roles.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getCurrentUser(): UserProfile | null {
    return this.authStateSubject.value.user;
  }
} 