import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <nav class="nav-container" *ngIf="authService.isAuthenticated()">
        <div class="nav-content">
          <a routerLink="/dashboard" class="nav-brand">
            🏢 CRM v3
          </a>
          
          <div class="nav-menu">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              📊 Dashboard
            </a>
            <a routerLink="/customers" routerLinkActive="active" class="nav-link">
              👥 Kunden
            </a>
            <a routerLink="/customers/pipeline" routerLinkActive="active" class="nav-link">
              📈 Pipeline
            </a>
            <a routerLink="/statistics" routerLinkActive="active" class="nav-link">
              📊 Statistiken
            </a>
            
            <div class="nav-user">
              <div class="user-info">
                <div class="user-name">{{ authService.getCurrentUser()?.firstName }} {{ authService.getCurrentUser()?.lastName }}</div>
                <div class="user-role">{{ authService.getCurrentUser()?.role }}</div>
              </div>
              <button (click)="logout()" class="logout-btn">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private authSubscription: any;

  ngOnInit(): void {
    // Kontinuierlich auf AuthState-Änderungen reagieren
    this.authSubscription = this.authService.authState$.subscribe(authState => {
      const currentPath = this.router.url;
      console.log('AuthState geändert:', authState.isAuthenticated, 'Aktueller Pfad:', currentPath);
      
      if (authState.isAuthenticated) {
        // Wenn authentifiziert und auf Login/Register, zum Dashboard weiterleiten
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          console.log('Weiterleitung zum Dashboard...');
          this.router.navigate(['/dashboard']);
        }
      } else {
        // Wenn nicht authentifiziert und nicht auf Login/Register, zum Login weiterleiten
        if (currentPath !== '/login' && currentPath !== '/register') {
          console.log('Weiterleitung zum Login...');
          this.router.navigate(['/login']);
        }
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
}
