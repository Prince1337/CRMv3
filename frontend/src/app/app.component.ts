import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Prüfe den Authentifizierungsstatus beim Start
    this.authService.authState$.pipe(take(1)).subscribe(authState => {
      const currentPath = this.router.url;
      
      if (authState.isAuthenticated) {
        // Wenn authentifiziert und auf Login/Register, zum Dashboard weiterleiten
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
          this.router.navigate(['/dashboard']);
        }
      } else {
        // Wenn nicht authentifiziert und nicht auf Login/Register, zum Login weiterleiten
        if (currentPath !== '/login' && currentPath !== '/register') {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}
