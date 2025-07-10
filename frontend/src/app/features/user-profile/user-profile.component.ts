import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid min-vh-100 bg-light">
      <!-- Main Content -->
      <main class="container-fluid py-5 px-4">
        <div class="row">
          <!-- Profile Header -->
          <div class="col-12 mb-5">
            <div class="card shadow-sm">
              <div class="card-header bg-white py-4">
                <h1 class="h3 mb-0">👤 Benutzerprofil</h1>
                <p class="text-muted mb-0">Verwalten Sie Ihre persönlichen Informationen</p>
              </div>
            </div>
          </div>

          <!-- Profile Information -->
          <div class="col-lg-8 mb-5">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-4">
                <h2 class="h4 mb-0">📋 Persönliche Informationen</h2>
              </div>
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-4">
                      <label class="form-label fw-bold">Vorname:</label>
                      <div class="form-control-plaintext">{{ currentUser?.firstName || 'Nicht angegeben' }}</div>
                    </div>
                    <div class="mb-4">
                      <label class="form-label fw-bold">Nachname:</label>
                      <div class="form-control-plaintext">{{ currentUser?.lastName || 'Nicht angegeben' }}</div>
                    </div>
                    <div class="mb-4">
                      <label class="form-label fw-bold">Benutzername:</label>
                      <div class="form-control-plaintext">{{ currentUser?.username || 'Nicht angegeben' }}</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-4">
                      <label class="form-label fw-bold">E-Mail:</label>
                      <div class="form-control-plaintext">{{ currentUser?.email || 'Nicht angegeben' }}</div>
                    </div>
                    <div class="mb-4">
                      <label class="form-label fw-bold">Rolle:</label>
                      <div class="form-control-plaintext">
                        <span class="badge" [class]="getRoleBadgeClass()">
                          {{ getRoleDisplayName() }}
                        </span>
                      </div>
                    </div>
                    <div class="mb-4">
                      <label class="form-label fw-bold">Status:</label>
                      <div class="form-control-plaintext">
                        <span class="badge" [class]="currentUser?.enabled ? 'bg-success' : 'bg-danger'">
                          {{ currentUser?.enabled ? 'Aktiv' : 'Inaktiv' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Details -->
          <div class="col-lg-4 mb-5">
            <div class="card shadow-sm h-100">
              <div class="card-header bg-white py-4">
                <h3 class="h5 mb-0">🔐 Kontodetails</h3>
              </div>
              <div class="card-body p-4">
                <div class="mb-4">
                  <label class="form-label fw-bold">Registriert:</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(currentUser?.createdAt) }}
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-bold">Letzter Login:</label>
                  <div class="form-control-plaintext">
                    {{ formatDate(currentUser?.lastLogin) }}
                  </div>
                </div>
                                  <div class="mb-4">
                    <label class="form-label fw-bold">Konto-ID:</label>
                    <div class="form-control-plaintext">
                      <code class="text-muted">{{ currentUser?.userId || 'Nicht verfügbar' }}</code>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white py-4">
                <h3 class="h5 mb-0">⚙️ Aktionen</h3>
              </div>
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-primary w-100 py-3">
                      ✏️ Profil bearbeiten
                    </button>
                  </div>
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-warning w-100 py-3">
                      🔑 Passwort ändern
                    </button>
                  </div>
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-outline-secondary w-100 py-3">
                      📧 E-Mail ändern
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Information -->
        <div class="row mt-5">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white py-4">
                <h3 class="h5 mb-0">🔒 Sicherheitsinformationen</h3>
              </div>
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <div class="card border-0 bg-light">
                      <div class="card-body text-center">
                        <div class="display-6 mb-2">🔐</div>
                        <h6 class="card-title">Passwort</h6>
                        <p class="card-text small text-muted">Zuletzt geändert vor 30 Tagen</p>
                        <button class="btn btn-sm btn-outline-primary">Aktualisieren</button>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <div class="card border-0 bg-light">
                      <div class="card-body text-center">
                        <div class="display-6 mb-2">📱</div>
                        <h6 class="card-title">Zwei-Faktor-Auth</h6>
                        <p class="card-text small text-muted">Nicht aktiviert</p>
                        <button class="btn btn-sm btn-outline-success">Aktivieren</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class UserProfileComponent implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null;
  private authSubscription: any;

  constructor(
    private authService: AuthService,
    private router: Router
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
          console.log('User-Profile geladen:', user);
        },
        error: (error) => {
          console.error('Fehler beim Laden des User-Profils:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
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

  getRoleBadgeClass(): string {
    if (!this.currentUser?.role) return 'bg-secondary';
    
    switch (this.currentUser.role) {
      case 'ROLE_ADMIN':
        return 'bg-danger';
      case 'ROLE_USER':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Nicht verfügbar';
    
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
} 