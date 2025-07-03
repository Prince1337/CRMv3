import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Willkommen beim crm-v3</h1>
        <p>Sie sind erfolgreich angemeldet!</p>
      </div>
      
      <div class="dashboard-content">
        <div class="welcome-card">
          <h2>Dashboard</h2>
          <p>Hier können Sie Ihre crmnnements verwalten und berechnen.</p>
          
          <div class="user-info" *ngIf="currentUser">
            <h3>Benutzerinformationen</h3>
            <p><strong>Name:</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
            <p><strong>Username:</strong> {{ currentUser.username }}</p>
            <p><strong>Email:</strong> {{ currentUser.email }}</p>
            <p><strong>Rolle:</strong> {{ currentUser.role }}</p>
          </div>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary" (click)="logout()">Abmelden</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .dashboard-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }
    
    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .dashboard-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .welcome-card h2 {
      color: #333;
      margin-bottom: 15px;
    }
    
    .user-info {
      margin-top: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .user-info h3 {
      color: #333;
      margin-bottom: 15px;
    }
    
    .user-info p {
      margin: 8px 0;
      color: #666;
    }
    
    .actions {
      text-align: center;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  `]
})
export class DashboardComponent {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Fehler beim Laden des Benutzerprofils:', error);
        // Bei Fehlern zur Login-Seite weiterleiten
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Fehler beim Logout:', error);
        this.router.navigate(['/login']);
      }
    });
  }
} 