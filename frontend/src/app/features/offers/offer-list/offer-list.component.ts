import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { PdfService } from '../../../core/services/pdf.service';
import { Offer, OfferStatus } from '../../../core/models/offer.models';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid min-vh-100 bg-light">
      <!-- Header -->
      <div class="container-fluid py-4">
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <h1 class="h3 mb-0">📄 Angebote</h1>
                <button 
                  routerLink="/offers/new" 
                  class="btn btn-primary">
                  📄 Neues Angebot
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Lädt...</span>
                </div>
                <p class="text-muted">Lade Angebote...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body text-center py-5">
                <div class="display-1 text-danger mb-3">⚠️</div>
                <h3 class="text-danger mb-3">Fehler beim Laden</h3>
                <p class="text-muted mb-4">{{ error }}</p>
                <button (click)="loadOffers()" class="btn btn-outline-primary">
                  🔄 Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="!loading && !error" class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th class="border-0">Angebotsnummer</th>
                        <th class="border-0">Titel</th>
                        <th class="border-0">Kunde</th>
                        <th class="border-0">Status</th>
                        <th class="border-0">Betrag</th>
                        <th class="border-0">Erstellt</th>
                        <th class="border-0">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let offer of offers">
                        <td class="align-middle">
                          <strong>{{ offer.offerNumber }}</strong>
                        </td>
                        <td class="align-middle">
                          <a [routerLink]="['/offers', offer.id]" class="text-decoration-none fw-bold">
                            {{ offer.title }}
                          </a>
                        </td>
                        <td class="align-middle">
                          {{ offer.customerName }}
                        </td>
                        <td class="align-middle">
                          <span [class]="getStatusBadgeClass(offer.status)" class="badge fs-6 px-3 py-2">
                            {{ offer.statusDisplayName }}
                          </span>
                        </td>
                        <td class="align-middle">
                          <span class="fw-bold text-success">{{ offer.finalAmount | currency:'EUR' }}</span>
                        </td>
                        <td class="align-middle">
                          <small class="text-muted">{{ offer.createdAt | date:'short' }}</small>
                        </td>
                        <td class="align-middle">
                          <div class="btn-group btn-group-sm" role="group">
                            <button 
                              [routerLink]="['/offers', offer.id]" 
                              class="btn btn-outline-primary" 
                              title="Anzeigen">
                              <i class="bi bi-eye"></i>
                            </button>
                            <button 
                              *ngIf="offer.status === 'DRAFT'"
                              (click)="markAsSent(offer.id!)" 
                              class="btn btn-outline-success" 
                              title="Versenden">
                              <i class="bi bi-send"></i>
                            </button>
                            <button 
                              *ngIf="offer.status === 'SENT'"
                              (click)="markAsPaid(offer.id!)" 
                              class="btn btn-outline-primary" 
                              title="Als bezahlt markieren">
                              <i class="bi bi-cash"></i>
                            </button>
                            <button 
                              (click)="downloadPdf(offer)" 
                              class="btn btn-outline-secondary" 
                              title="PDF herunterladen">
                              <i class="bi bi-file-pdf"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Empty State -->
                <div *ngIf="offers.length === 0" class="text-center py-5">
                  <div class="text-muted">
                    <div class="display-4 mb-3">📄</div>
                    <h4>Keine Angebote gefunden</h4>
                    <p>Erstellen Sie Ihr erstes Angebot, um zu beginnen.</p>
                    <button 
                      routerLink="/offers/new" 
                      class="btn btn-primary">
                      📄 Neues Angebot erstellen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private offerService: OfferService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    this.error = null;

    this.offerService.getOffers().subscribe({
      next: (response) => {
        this.offers = response.content || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Angebote:', error);
        this.error = 'Fehler beim Laden der Angebote. Bitte versuchen Sie es erneut.';
        this.loading = false;
      }
    });
  }

  markAsSent(id: number): void {
    this.offerService.markAsSent(id).subscribe({
      next: () => {
        this.loadOffers();
      },
      error: (error) => {
        console.error('Fehler beim Versenden:', error);
        alert('Fehler beim Versenden des Angebots. Bitte versuchen Sie es erneut.');
      }
    });
  }

  markAsPaid(id: number): void {
    this.offerService.markAsPaid(id).subscribe({
      next: () => {
        this.loadOffers();
      },
      error: (error) => {
        console.error('Fehler beim Markieren als bezahlt:', error);
        alert('Fehler beim Markieren als bezahlt. Bitte versuchen Sie es erneut.');
      }
    });
  }

  downloadPdf(offer: Offer): void {
    this.pdfService.generateOfferPdf(offer);
  }

  getStatusBadgeClass(status: OfferStatus): string {
    switch (status) {
      case OfferStatus.DRAFT:
        return 'bg-warning';
      case OfferStatus.SENT:
        return 'bg-info';
      case OfferStatus.PAID:
        return 'bg-success';
      case OfferStatus.OVERDUE:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
} 