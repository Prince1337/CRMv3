import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Customer, CustomerStatus, CustomerSearchRequest } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { PipelineUpdateService } from '../../../core/services/pipeline-update.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-list.component.html'
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
    private router: Router,
    private pipelineUpdateService: PipelineUpdateService
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
      return 'bi-arrow-down-up';
    }
    return this.currentSortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
    if (confirm('Möchten Sie diesen Kunden wirklich als kontaktiert markieren?')) {
      this.customerService.markCustomerAsContacted(id).subscribe({
        next: () => {
          this.loadCustomers(); // Reload all customers to see the change
          this.pipelineUpdateService.notifyPipelineUpdate();
        },
        error: (err) => {
          this.error = 'Fehler beim Markieren des Kunden als kontaktiert.';
          console.error(err);
        }
      });
    }
  }

  deleteCustomer(id: number): void {
    if (confirm('Möchten Sie diesen Kunden wirklich löschen? Dies kann nicht rückgängig gemacht werden.')) {
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