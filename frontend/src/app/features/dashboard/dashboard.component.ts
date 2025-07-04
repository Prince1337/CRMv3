import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>CRM v3 Dashboard</h1>
          <div class="user-info">
            <span>Willkommen, {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <button (click)="logout()" class="logout-button">Abmelden</button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="welcome-card">
          <h2>Willkommen im CRM v3</h2>
          <p>Sie sind erfolgreich angemeldet als {{ currentUser?.username }}</p>
          <p>Rolle: {{ getRoleDisplayName() }}</p>
        </div>

        <div class="quick-actions">
          <h3>Schnellzugriff</h3>
          <div class="action-buttons">
            <button (click)="navigateToCustomers()" class="action-button">
              Kunden verwalten
            </button>
            <button *ngIf="isAdmin()" (click)="navigateToStatistics()" class="action-button">
              Statistiken
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .dashboard-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info span {
      color: #64748b;
      font-size: 0.875rem;
    }

    .logout-button {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .logout-button:hover {
      background: #dc2626;
    }

    .dashboard-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-card {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .welcome-card h2 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .welcome-card p {
      margin: 0.5rem 0;
      color: #64748b;
    }

    .quick-actions {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .quick-actions h3 {
      margin: 0 0 1rem 0;
      color: #1e293b;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .action-button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .action-button:hover {
      background: #2563eb;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .user-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .dashboard-main {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: UserProfile | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  getRoleDisplayName(): string {
    if (this.authService.isAdmin()) {
      return 'Administrator';
    }
    return 'Benutzer';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  navigateToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  navigateToStatistics(): void {
    this.router.navigate(['/statistics']);
  }
} 