import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerStatisticsResponse } from '../../core/models/customer.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>🏢 CRM v3 Dashboard</h1>
          <div class="user-info">
            <span>Willkommen, {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <button (click)="logout()" class="logout-button">
              🚪 Abmelden
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="welcome-card">
          <h2>Willkommen im CRM v3</h2>
          <div class="user-details">
            <div class="detail-item">
              <strong>Benutzername:</strong> {{ currentUser?.username || 'Unbekannt' }}
            </div>
            <div class="detail-item">
              <strong>E-Mail:</strong> {{ currentUser?.email || 'Unbekannt' }}
            </div>
            <div class="detail-item">
              <strong>Rolle:</strong> {{ getRoleDisplayName() }}
            </div>
            <div class="detail-item">
              <strong>Status:</strong> 
              <span class="status-badge" [class]="currentUser?.enabled ? 'status-active' : 'status-inactive'">
                {{ currentUser?.enabled ? 'Aktiv' : 'Inaktiv' }}
              </span>
            </div>
            <div class="detail-item" *ngIf="currentUser?.createdAt">
              <strong>Registriert:</strong> {{ formatDate(currentUser?.createdAt) }}
            </div>
            <div class="detail-item" *ngIf="currentUser?.lastLogin">
              <strong>Letzter Login:</strong> {{ formatDate(currentUser?.lastLogin) }}
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <h3>🚀 Schnellzugriff</h3>
          <div class="action-buttons">
            <button (click)="navigateToCustomers()" class="action-button primary">
              👥 Kunden verwalten
            </button>
            <button (click)="navigateToPipeline()" class="action-button secondary">
              📈 Pipeline
            </button>
            <button *ngIf="isAdmin()" (click)="navigateToStatistics()" class="action-button admin">
              📊 Statistiken
            </button>
          </div>
        </div>

        <div class="stats-overview" *ngIf="isAdmin()">
          <div class="stats-header">
            <h3>📈 Übersicht</h3>
            <button (click)="refreshStats()" class="refresh-button" title="Statistiken aktualisieren">
              🔄
            </button>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ customerStats.total || 0 }}</div>
                <div class="stat-label">Gesamt Kunden</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value">{{ customerStats.inPipeline || 0 }}</div>
                <div class="stat-label">In Pipeline</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">{{ customerStats.won || 0 }}</div>
                <div class="stat-label">Gewonnen</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">❌</div>
              <div class="stat-content">
                <div class="stat-value">{{ customerStats.lost || 0 }}</div>
                <div class="stat-label">Verloren</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null;
  customerStats: any = {};
  private authSubscription: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    // User-Informationen vom AuthService beobachten
    this.authSubscription = this.authService.authState$.subscribe(authState => {
      this.currentUser = authState.user;
    });
    
    // Initial User laden
    this.currentUser = this.authService.getCurrentUser();
    
    // User-Profile explizit laden falls nicht vorhanden
    if (!this.currentUser && this.authService.isAuthenticated()) {
      this.authService.getUserProfile().subscribe({
        next: (user) => {
          this.currentUser = user;
          console.log('User-Profile explizit geladen:', user);
        },
        error: (error) => {
          console.error('Fehler beim Laden des User-Profils:', error);
        }
      });
    }
    
    this.loadCustomerStats();
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
    if (!this.currentUser?.role) return 'Unbekannt';
    
    switch (this.currentUser.role) {
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_USER':
        return 'Benutzer';
      default:
        return this.currentUser.role;
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  navigateToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  navigateToPipeline(): void {
    this.router.navigate(['/customers/pipeline']);
  }

  navigateToStatistics(): void {
    this.router.navigate(['/statistics']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unbekannt';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Ungültiges Datum';
    }
  }

  private loadCustomerStats(): void {
    // Statistiken vom Backend laden
    this.customerService.getCustomerStatistics().subscribe({
      next: (stats: CustomerStatisticsResponse) => {
        this.customerStats = {
          total: stats.totalCustomers || 0,
          inPipeline: stats.customersInPipeline || 0,
          won: stats.wonCustomers || 0,
          lost: stats.lostCustomers || 0
        };
        console.log('Dashboard-Statistiken geladen:', this.customerStats);
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kunden-Statistiken:', error);
        // Fallback zu Platzhalter-Daten bei Fehler
        this.customerStats = {
          total: 0,
          inPipeline: 0,
          won: 0,
          lost: 0
        };
      }
    });
  }

  // Öffentliche Methode zum Aktualisieren der Statistiken
  refreshStats(): void {
    this.loadCustomerStats();
  }
} 