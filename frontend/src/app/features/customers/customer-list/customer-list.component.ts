import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Customer, CustomerStatus, CustomerSearchRequest } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="customer-list-container">
      <header class="customer-header">
        <div class="header-content">
          <h1>Kundenverwaltung</h1>
          <div class="header-actions">
            <button (click)="navigateToPipeline()" class="btn-secondary">
              📊 Pipeline
            </button>
            <button (click)="navigateToNewCustomer()" class="btn-primary">
              <span>+</span> Neuer Kunde
            </button>
          </div>
        </div>
      </header>

      <!-- Suchbereich -->
      <div class="search-section">
        <div class="search-form">
          <div class="search-row">
            <div class="search-field">
              <label for="searchName">Name</label>
              <input 
                type="text" 
                id="searchName" 
                [(ngModel)]="searchRequest.name" 
                placeholder="Name suchen..."
                (keyup.enter)="searchCustomers()"
              />
            </div>
            <div class="search-field">
              <label for="searchEmail">E-Mail</label>
              <input 
                type="email" 
                id="searchEmail" 
                [(ngModel)]="searchRequest.email" 
                placeholder="E-Mail suchen..."
                (keyup.enter)="searchCustomers()"
              />
            </div>
            <div class="search-field">
              <label for="searchCompany">Firma</label>
              <input 
                type="text" 
                id="searchCompany" 
                [(ngModel)]="searchRequest.company" 
                placeholder="Firma suchen..."
                (keyup.enter)="searchCustomers()"
              />
            </div>
          </div>
          <div class="search-row">
            <div class="search-field">
              <label for="searchCity">Stadt</label>
              <input 
                type="text" 
                id="searchCity" 
                [(ngModel)]="searchRequest.city" 
                placeholder="Stadt suchen..."
                (keyup.enter)="searchCustomers()"
              />
            </div>
            <div class="search-field">
              <label for="searchStatus">Status</label>
              <select id="searchStatus" [(ngModel)]="searchRequest.status">
                <option value="">Alle Status</option>
                <option [value]="CustomerStatus.NEW">Neu</option>
                <option [value]="CustomerStatus.CONTACTED">Kontaktiert</option>
                <option [value]="CustomerStatus.OFFER_CREATED">Angebot erstellt</option>
                <option [value]="CustomerStatus.WON">Gewonnen</option>
                <option [value]="CustomerStatus.LOST">Verloren</option>
                <option [value]="CustomerStatus.POTENTIAL">Potenziell</option>
                <option [value]="CustomerStatus.ACTIVE">Aktiv</option>
                <option [value]="CustomerStatus.INACTIVE">Inaktiv</option>
              </select>
            </div>
            <div class="search-field">
              <label for="searchSource">Quelle</label>
              <input 
                type="text" 
                id="searchSource" 
                [(ngModel)]="searchRequest.source" 
                placeholder="Quelle suchen..."
                (keyup.enter)="searchCustomers()"
              />
            </div>
          </div>
          <div class="search-actions">
            <button (click)="searchCustomers()" class="btn-primary">Suchen</button>
            <button (click)="clearSearch()" class="btn-secondary">Zurücksetzen</button>
          </div>
        </div>
      </div>

      <!-- Fehlermeldung -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Ladeindikator -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Lade Kunden...</p>
      </div>

      <!-- Kundenliste -->
      <div *ngIf="!loading && sortedCustomers.length > 0" class="customers-table">
        <table>
          <thead>
            <tr>
              <th (click)="sortBy('firstName')" class="sortable">
                Name
                <span class="sort-arrow" [class]="getSortArrowClass('firstName')">
                  {{ getSortArrow('firstName') }}
                </span>
              </th>
              <th (click)="sortBy('email')" class="sortable">
                E-Mail
                <span class="sort-arrow" [class]="getSortArrowClass('email')">
                  {{ getSortArrow('email') }}
                </span>
              </th>
              <th (click)="sortBy('companyName')" class="sortable">
                Firma
                <span class="sort-arrow" [class]="getSortArrowClass('companyName')">
                  {{ getSortArrow('companyName') }}
                </span>
              </th>
              <th (click)="sortBy('city')" class="sortable">
                Stadt
                <span class="sort-arrow" [class]="getSortArrowClass('city')">
                  {{ getSortArrow('city') }}
                </span>
              </th>
              <th (click)="sortBy('status')" class="sortable">
                Status
                <span class="sort-arrow" [class]="getSortArrowClass('status')">
                  {{ getSortArrow('status') }}
                </span>
              </th>
              <th (click)="sortBy('createdAt')" class="sortable">
                Erstellt
                <span class="sort-arrow" [class]="getSortArrowClass('createdAt')">
                  {{ getSortArrow('createdAt') }}
                </span>
              </th>
              <th (click)="sortBy('lastContact')" class="sortable">
                Letzter Kontakt
                <span class="sort-arrow" [class]="getSortArrowClass('lastContact')">
                  {{ getSortArrow('lastContact') }}
                </span>
              </th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of sortedCustomers">
              <td>
                <a [routerLink]="['/customers', customer.id]" class="customer-name">
                  {{ customer.fullName }}
                </a>
              </td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.companyName || '-' }}</td>
              <td>{{ customer.city || '-' }}</td>
              <td>
                <span [class]="customerService.getStatusClass(customer.status)">
                  {{ customer.statusDisplayName }}
                </span>
              </td>
              <td>{{ customerService.formatDate(customer.createdAt) }}</td>
              <td>{{ customer.lastContact ? customerService.formatDate(customer.lastContact) : 'Nie' }}</td>
              <td class="actions">
                <button (click)="navigateToCustomer(customer.id)" class="btn-icon" title="Anzeigen">
                  👁️
                </button>
                <button (click)="navigateToEdit(customer.id)" class="btn-icon" title="Bearbeiten">
                  ✏️
                </button>
                <button (click)="markAsContacted(customer.id)" class="btn-icon" title="Als kontaktiert markieren">
                  📞
                </button>
                <button 
                  *ngIf="authService.isAdmin()" 
                  (click)="deleteCustomer(customer.id)" 
                  class="btn-icon delete" 
                  title="Löschen"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Keine Kunden -->
      <div *ngIf="!loading && sortedCustomers.length === 0" class="no-customers">
        <p>Keine Kunden gefunden.</p>
        <button (click)="navigateToNewCustomer()" class="btn-primary">Ersten Kunden erstellen</button>
      </div>

      <!-- Paginierung -->
      <div *ngIf="!loading && totalPages > 1" class="pagination">
        <button 
          [disabled]="currentPage === 0" 
          (click)="onPageChange(currentPage - 1)" 
          class="btn-secondary"
        >
          Zurück
        </button>
        <span class="page-info">
          Seite {{ currentPage + 1 }} von {{ totalPages }} 
          ({{ totalElements }} Kunden insgesamt)
        </span>
        <button 
          [disabled]="currentPage === totalPages - 1" 
          (click)="onPageChange(currentPage + 1)" 
          class="btn-secondary"
        >
          Weiter
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  sortedCustomers: Customer[] = [];
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  error = '';

  // Sortierung
  currentSortField = 'createdAt';
  currentSortDirection: 'asc' | 'desc' = 'desc';

  searchRequest: CustomerSearchRequest = {
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  };

  CustomerStatus = CustomerStatus; // Für Template-Zugriff

  constructor(
    public customerService: CustomerService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.error = '';

    // Verwende searchCustomers auch für normale Ladung, um Sortierung zu unterstützen
    this.customerService.searchCustomers(this.searchRequest).subscribe({
      next: (response) => {
        this.customers = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.applySorting();
      },
      error: (error) => {
        this.error = 'Fehler beim Laden der Kunden: ' + error.message;
        this.loading = false;
      }
    });
  }

  searchCustomers(): void {
    this.currentPage = 0;
    this.searchRequest.page = 0;
    this.searchRequest.size = this.pageSize;
    this.loading = true;
    this.error = '';

    this.customerService.searchCustomers(this.searchRequest).subscribe({
      next: (response) => {
        this.customers = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.applySorting();
      },
      error: (error) => {
        this.error = 'Fehler bei der Suche: ' + error.message;
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchRequest = {
      page: 0,
      size: 20,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };
    this.currentPage = 0;
    this.currentSortField = 'createdAt';
    this.currentSortDirection = 'desc';
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchRequest.page = page;
    this.searchCustomers();
  }

  // Frontend-Sortierung
  sortBy(field: string): void {
    if (this.currentSortField === field) {
      // Wenn bereits nach diesem Feld sortiert wird, Richtung umkehren
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Neues Feld, Standardrichtung ist aufsteigend
      this.currentSortField = field;
      this.currentSortDirection = 'asc';
    }
    
    this.applySorting();
  }

  applySorting(): void {
    this.sortedCustomers = [...this.customers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Werte basierend auf Sortierfeld extrahieren
      switch (this.currentSortField) {
        case 'firstName':
          aValue = a.firstName?.toLowerCase() || '';
          bValue = b.firstName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'companyName':
          aValue = a.companyName?.toLowerCase() || '';
          bValue = b.companyName?.toLowerCase() || '';
          break;
        case 'city':
          aValue = a.city?.toLowerCase() || '';
          bValue = b.city?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.statusDisplayName?.toLowerCase() || '';
          bValue = b.statusDisplayName?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastContact':
          aValue = a.lastContact ? new Date(a.lastContact).getTime() : 0;
          bValue = b.lastContact ? new Date(b.lastContact).getTime() : 0;
          break;
        default:
          aValue = aValue || '';
          bValue = bValue || '';
      }

      // Sortierung anwenden
      if (this.currentSortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  getSortArrow(field: string): string {
    if (this.currentSortField !== field) {
      return '↕️'; // Neutral
    }
    return this.currentSortDirection === 'asc' ? '↑' : '↓';
  }

  getSortArrowClass(field: string): string {
    if (this.currentSortField !== field) {
      return 'sort-neutral';
    }
    return this.currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
  }

  navigateToCustomer(id: number): void {
    this.router.navigate(['/customers', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/customers', id, 'edit']);
  }

  navigateToNewCustomer(): void {
    this.router.navigate(['/customers', 'new']);
  }

  navigateToPipeline(): void {
    this.router.navigate(['/customers/pipeline']);
  }

  markAsContacted(id: number): void {
    this.customerService.markCustomerAsContacted(id).subscribe({
      next: () => {
        this.searchCustomers();
      },
      error: (error) => {
        this.error = 'Fehler beim Markieren als kontaktiert: ' + error.message;
      }
    });
  }

  deleteCustomer(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.searchCustomers();
        },
        error: (error) => {
          this.error = 'Fehler beim Löschen: ' + error.message;
        }
      });
    }
  }
} 