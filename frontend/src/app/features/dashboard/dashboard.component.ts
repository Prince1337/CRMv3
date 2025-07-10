import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';
import { CustomerService } from '../../core/services/customer.service';
import { CustomerStatisticsResponse } from '../../core/models/customer.models';
import { gsap } from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
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
    this.animateDashboard();
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

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  navigateToCustomers(): void {
    this.router.navigate(['/customers']);
  }

  navigateToOffers(): void {
    this.router.navigate(['/offers']);
  }

  navigateToInvoices(): void {
    this.router.navigate(['/invoices']);
  }

  navigateToPipeline(): void {
    this.router.navigate(['/pipeline']);
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

  private animateDashboard() {
    gsap.from('.card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
} 