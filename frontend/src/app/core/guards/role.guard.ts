import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Verwende die asynchrone Authentifizierungsprüfung mit Backend-Validierung
    return this.authService.isAuthenticatedAsync().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/login']);
          return false;
        }

        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
        
        if (hasRequiredRole) {
          return true;
        } else {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      })
    );
  }
} 