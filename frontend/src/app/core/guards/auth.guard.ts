import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map, delay, retry } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Warte bis die Initialisierung abgeschlossen ist, dann prüfe Authentifizierung
    return this.authService.isAuthenticatedAsync().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Nur zum Login weiterleiten wenn nicht bereits auf Login-Seite
          const currentPath = this.router.url;
          if (currentPath !== '/login' && currentPath !== '/register') {
            this.router.navigate(['/login']);
          }
          return false;
        }
      })
    );
  }
} 