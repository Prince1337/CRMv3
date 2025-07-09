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

  private _isInitialized = false;

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
    
    // Beim Start User-Profile laden wenn bereits authentifiziert
    if (this.isAuthenticated()) {
      this.getUserProfile().subscribe({
        next: (user) => {
          this.updateUserProfile(user);
        },
        error: (error) => {
          console.error('Fehler beim Laden des User-Profils beim Start:', error);
        }
      });
    }
  }

  private initializeAuthState(): void {
    const accessToken = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      // Lokale Token-Validierung (ohne Backend-Call)
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.warn('Token ist beim Start abgelaufen, führe Logout durch');
          this.handleLogout();
          this._isInitialized = true;
          return;
        }
        
        // Token ist gültig, User-Profile vom Backend laden
        this.getUserProfile().subscribe({
          next: (user) => {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.authStateSubject.next({
              isAuthenticated: true,
              user,
              accessToken,
              refreshToken
            });
            this._isInitialized = true;
          },
          error: (error) => {
            console.error('Fehler beim Laden des User-Profils beim Start:', error);
            // Fallback: Gespeicherte User-Daten verwenden
            const userStr = localStorage.getItem(this.USER_KEY);
            const user = userStr ? JSON.parse(userStr) : null;
            
            if (user) {
              this.authStateSubject.next({
                isAuthenticated: true,
                user,
                accessToken,
                refreshToken
              });
            } else {
              // Keine User-Daten verfügbar, Logout durchführen
              this.handleLogout();
            }
            this._isInitialized = true;
          }
        });
      } catch (error) {
        console.error('Fehler bei der lokalen Token-Validierung beim Start:', error);
        this.handleLogout();
        this._isInitialized = true;
      }
    } else {
      // Keine Tokens vorhanden, Initialisierung abgeschlossen
      this._isInitialized = true;
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
    const token = this.getAccessToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return this.http.post<string>(`${this.API_URL}/auth/logout`, {}, { headers })
      .pipe(
        tap(() => this.handleLogout()),
        catchError(error => {
          // Auch bei Fehler lokalen Logout durchführen
          console.error('Logout-Request fehlgeschlagen:', error);
          this.handleLogout();
          return throwError(() => error);
        })
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
    const token = this.getAccessToken();
    const headers: { [key: string]: string } = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return this.http.get<UserProfile>(`${this.API_URL}/auth/profile`, { headers })
      .pipe(
        tap(user => this.updateUserProfile(user)),
        catchError(this.handleError)
      );
  }

  /**
   * Validiert den aktuellen Token am Backend
   */
  validateToken(): Observable<boolean> {
    const token = this.getAccessToken();
    
    if (!token) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http.post<boolean>(`${this.API_URL}/auth/validate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(error => {
        console.error('Token-Validierung fehlgeschlagen:', error);
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    // User-Profile vom Backend laden
    this.getUserProfile().subscribe({
      next: (user) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden des User-Profils:', error);
        // Fallback: Token dekodieren
        const user = this.decodeToken(response.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        
        this.authStateSubject.next({
          isAuthenticated: true,
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        });
      }
    });
  }

  public handleLogout(): void {
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
        userId: payload.sub,
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role || 'USER',
        enabled: payload.enabled !== false,
        createdAt: payload.createdAt || new Date().toISOString(),
        lastLogin: payload.lastLogin
      };
    } catch (error) {
      console.error('Fehler beim Dekodieren des Tokens:', error);
      return {
        userId: 0,
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'USER',
        enabled: true,
        createdAt: new Date().toISOString(),
        lastLogin: undefined
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

  /**
   * Prüft ob der Benutzer authentifiziert ist (synchron)
   * Diese Methode prüft nur den lokalen Zustand
   */
  isAuthenticated(): boolean {
    const currentState = this.authStateSubject.value;
    
    // Prüfe ob Tokens vorhanden sind
    if (!currentState.accessToken || !currentState.refreshToken) {
      return false;
    }

    // Prüfe Token-Expiration lokal (ohne Backend-Call)
    try {
      const token = currentState.accessToken;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token ist abgelaufen, führe Logout durch');
        this.handleLogout();
        return false;
      }
    } catch (error) {
      console.error('Fehler beim Prüfen der Token-Expiration:', error);
      this.handleLogout();
      return false;
    }

    return currentState.isAuthenticated;
  }

  /**
   * Prüft ob der Benutzer authentifiziert ist (asynchron mit lokaler Validierung)
   */
  isAuthenticatedAsync(): Observable<boolean> {
    // Warte bis die Initialisierung abgeschlossen ist
    if (!this._isInitialized) {
      return new Observable<boolean>(observer => {
        // Warte bis Initialisierung abgeschlossen ist
        const checkInitialization = () => {
          if (this._isInitialized) {
            observer.next(this.isAuthenticated());
            observer.complete();
          } else {
            setTimeout(checkInitialization, 50);
          }
        };
        checkInitialization();
      });
    }

    const currentState = this.authStateSubject.value;
    
    // Prüfe ob Tokens vorhanden sind
    if (!currentState.accessToken || !currentState.refreshToken) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    // Lokale Token-Validierung (ohne Backend-Call)
    try {
      const token = currentState.accessToken;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token ist abgelaufen, führe Logout durch');
        this.handleLogout();
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      }
      
      return new Observable<boolean>(observer => {
        observer.next(true);
        observer.complete();
      });
    } catch (error) {
      console.error('Fehler beim Prüfen der Token-Expiration:', error);
      this.handleLogout();
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }
  }

  hasRole(role: string): boolean {
    const user = this.authStateSubject.value.user;
    return user?.role === role || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getCurrentUser(): UserProfile | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Prüft ob die Initialisierung abgeschlossen ist
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }
} 