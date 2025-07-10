import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private authSubscription: any;

  ngOnInit(): void {
    // Nur für Debugging: AuthState-Änderungen loggen
    this.authSubscription = this.authService.authState$.subscribe(authState => {
      const currentPath = this.router.url;
      console.log('AuthState geändert:', authState.isAuthenticated, 'Aktueller Pfad:', currentPath);
      
      // Navigation wird nur durch AuthGuard gesteuert, nicht hier
      // Nur bei Login/Register-Seiten zur Dashboard weiterleiten wenn authentifiziert
      if (authState.isAuthenticated && (currentPath === '/login' || currentPath === '/register')) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    console.log('Logout wird ausgeführt...');
    
    // Sofort lokalen Logout durchführen
    this.authService.handleLogout();
    
    // Backend-Logout versuchen (optional, nicht blockierend)
    try {
      this.authService.logout().subscribe({
        next: (response) => {
          console.log('Backend-Logout erfolgreich:', response);
        },
        error: (error) => {
          console.error('Backend-Logout error:', error);
          // Fehler ist nicht kritisch, lokaler Logout wurde bereits durchgeführt
        }
      });
    } catch (error) {
      console.error('Fehler beim Backend-Logout:', error);
    }
    
    // Zur Login-Seite navigieren
    this.router.navigate(['/login']);
  }

  getRoleDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.role) return 'Unbekannt';
    
    switch (user.role) {
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_USER':
        return 'Benutzer';
      default:
        return user.role;
    }
  }

  getInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.firstName || !user?.lastName) return '?';
    
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }
}
