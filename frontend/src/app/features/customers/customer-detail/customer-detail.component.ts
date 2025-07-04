import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, CustomerStatus } from '../../../core/models/customer.models';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="customer-detail-container" *ngIf="customer$ | async as customer; else loadingOrError">
      <button class="btn-secondary back-btn" (click)="goBack()">← Zurück zur Liste</button>
      <div class="detail-header">
        <h1>{{ customer.fullName }}</h1>
        <span class="status-badge" [class]="customerService.getStatusClass(customer.status)">
          {{ customer.statusDisplayName }}
        </span>
      </div>
      <div class="detail-content">
        <div class="detail-section">
          <h2>Kontaktdaten</h2>
          <p><strong>E-Mail:</strong> {{ customer.email }}</p>
          <p *ngIf="customer.phone"><strong>Telefon:</strong> {{ customer.phone }}</p>
          <p *ngIf="customer.mobile"><strong>Mobil:</strong> {{ customer.mobile }}</p>
          <p *ngIf="customer.website"><strong>Website:</strong> <a [href]="customer.website" target="_blank">{{ customer.website }}</a></p>
        </div>
        <div class="detail-section">
          <h2>Firma & Position</h2>
          <p *ngIf="customer.companyName"><strong>Firma:</strong> {{ customer.companyName }}</p>
          <p *ngIf="customer.position"><strong>Position:</strong> {{ customer.position }}</p>
          <p *ngIf="customer.department"><strong>Abteilung:</strong> {{ customer.department }}</p>
        </div>
        <div class="detail-section">
          <h2>Adresse</h2>
          <p *ngIf="customer.fullAddress">{{ customer.fullAddress }}</p>
          <ng-container *ngIf="!customer.fullAddress">
            <p *ngIf="customer.street || customer.houseNumber">{{ customer.street }} {{ customer.houseNumber }}</p>
            <p *ngIf="customer.postalCode || customer.city">{{ customer.postalCode }} {{ customer.city }}</p>
            <p *ngIf="customer.country">{{ customer.country }}</p>
          </ng-container>
        </div>
        <div class="detail-section">
          <h2>Weitere Informationen</h2>
          <p *ngIf="customer.source"><strong>Quelle:</strong> {{ customer.source }}</p>
          <p *ngIf="customer.tags"><strong>Tags:</strong> {{ customer.tags }}</p>
          <p *ngIf="customer.notes"><strong>Notizen:</strong> {{ customer.notes }}</p>
          <p *ngIf="customer.internalNotes"><strong>Interne Notizen:</strong> {{ customer.internalNotes }}</p>
        </div>
        <div class="detail-section meta">
          <p><strong>Erstellt am:</strong> {{ customerService.formatDate(customer.createdAt) }}</p>
          <p><strong>Letzte Änderung:</strong> {{ customerService.formatDate(customer.updatedAt) }}</p>
          <p *ngIf="customer.lastContact"><strong>Letzter Kontakt:</strong> {{ customerService.formatDate(customer.lastContact) }}</p>
          <p><strong>Erstellt von:</strong> {{ customer.createdByFullName }}</p>
          <p *ngIf="customer.assignedToFullName"><strong>Zugewiesen an:</strong> {{ customer.assignedToFullName }}</p>
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" (click)="editCustomer(customer.id)">Bearbeiten</button>
      </div>
    </div>
    <ng-template #loadingOrError>
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Lade Kundendaten...</p>
      </div>
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </ng-template>
  `,
  styles: [`
    .customer-detail-container {
      max-width: 700px;
      margin: 2rem auto;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      padding: 2rem 2.5rem 1.5rem 2.5rem;
      position: relative;
    }
    .back-btn {
      position: absolute;
      left: 2rem;
      top: 1.5rem;
      font-size: 1rem;
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      padding: 0;
    }
    .detail-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .detail-header h1 {
      margin: 0;
      font-size: 2rem;
      flex: 1;
    }
    .status-badge {
      padding: 0.3em 1em;
      border-radius: 1em;
      font-size: 1rem;
      font-weight: 500;
      display: inline-block;
    }
    .detail-content {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .detail-section {
      flex: 1 1 250px;
      min-width: 220px;
      margin-bottom: 1rem;
    }
    .detail-section h2 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: #555;
    }
    .meta {
      font-size: 0.95em;
      color: #888;
    }
    .actions {
      text-align: right;
    }
    .btn-primary {
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 0.5em 1.5em;
      font-size: 1rem;
      cursor: pointer;
      margin-left: 0.5em;
    }
    .btn-primary:hover {
      background: #0056b3;
    }
    .loading {
      text-align: center;
      margin: 3rem 0;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-message {
      color: #b00020;
      background: #ffeaea;
      border: 1px solid #ffb3b3;
      padding: 1em;
      border-radius: 4px;
      margin: 2rem auto;
      max-width: 400px;
      text-align: center;
    }
    @media (max-width: 700px) {
      .customer-detail-container {
        padding: 1rem 0.5rem;
      }
      .detail-content {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class CustomerDetailComponent implements OnInit {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  customer$!: Observable<Customer | null>;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.customer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.error = 'Ungültige Kunden-ID.';
          this.loading = false;
          return of(null);
        }
        this.loading = true;
        this.error = '';
        return this.customerService.getCustomer(id).pipe(
          catchError(err => {
            this.error = 'Kunde konnte nicht geladen werden.';
            this.loading = false;
            return of(null);
          })
        );
      })
    );
    this.customer$.subscribe(() => this.loading = false);
  }

  editCustomer(id: number) {
    this.router.navigate(['/customers', id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
} 