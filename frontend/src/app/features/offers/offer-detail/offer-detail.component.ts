import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { PdfService } from '../../../core/services/pdf.service';
import { Offer, OfferStatus } from '../../../core/models/offer.models';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid min-vh-100 bg-light">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="d-flex justify-content-center align-items-center min-vh-100">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Lädt...</span>
          </div>
          <p class="text-muted">Lade Angebotsdetails...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card shadow-sm">
              <div class="card-body text-center">
                <div class="display-1 text-danger mb-3">⚠️</div>
                <h3 class="text-danger mb-3">Fehler beim Laden</h3>
                <p class="text-muted mb-4">{{ error }}</p>
                <button (click)="goBack()" class="btn btn-outline-secondary">
                  ← Zurück zur Übersicht
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="offer && !isLoading" class="container-fluid py-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <button (click)="goBack()" class="btn btn-outline-secondary me-3">
                    ← Zurück
                  </button>
                  <div>
                    <h1 class="h3 mb-1">{{ offer.title }}</h1>
                    <p class="text-muted mb-0">{{ offer.offerNumber }}</p>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button 
                    *ngIf="offer.status === 'DRAFT'"
                    (click)="markAsSent()" 
                    class="btn btn-success">
                    📤 Versenden
                  </button>
                  <button 
                    *ngIf="offer.status === 'SENT'"
                    (click)="markAsPaid()" 
                    class="btn btn-primary">
                    💰 Als bezahlt markieren
                  </button>
                  <button 
                    (click)="downloadPdf()" 
                    class="btn btn-outline-primary">
                    📄 PDF
                  </button>
                  <button 
                    [routerLink]="['/offers', offer.id, 'edit']" 
                    class="btn btn-outline-secondary">
                    ✏️ Bearbeiten
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status and Info -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <span [class]="getStatusBadgeClass(offer.status)" class="badge fs-6 px-3 py-2">
                      {{ offer.statusDisplayName }}
                    </span>
                  </div>
                  <div class="col-md-6">
                    <div class="row text-muted small">
                      <div class="col-6">
                        <strong>Erstellt:</strong><br>
                        {{ offer.createdAt | date:'medium' }}
                      </div>
                      <div class="col-6" *ngIf="offer.sentAt">
                        <strong>Versendet:</strong><br>
                        {{ offer.sentAt | date:'medium' }}
                      </div>
                      <div class="col-6" *ngIf="offer.paidAt">
                        <strong>Bezahlt:</strong><br>
                        {{ offer.paidAt | date:'medium' }}
                      </div>
                      <div class="col-6" *ngIf="offer.validUntil">
                        <strong>Gültig bis:</strong><br>
                        {{ offer.validUntil | date:'mediumDate' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="row">
          <!-- Left Column -->
          <div class="col-lg-8 mb-4">
            <!-- Customer Information -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white">
                <h3 class="h5 mb-0">👤 Kunde</h3>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Name:</strong> {{ offer.customerName }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Kunden-ID:</strong> {{ offer.customerId }}</p>
                  </div>
                </div>
                <div *ngIf="offer.description" class="mt-3">
                  <strong>Beschreibung:</strong>
                  <p class="text-muted mb-0">{{ offer.description }}</p>
                </div>
                <div *ngIf="offer.discountPercentage && offer.discountPercentage > 0" class="mt-2">
                  <strong>Rabatt:</strong> {{ offer.discountPercentage }}%
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h3 class="h5 mb-0">📋 Positionen</h3>
              </div>
              <div class="card-body">
                <div *ngFor="let item of offer.items; let i = index" class="border rounded p-3 mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="h6 mb-0">Position {{ i + 1 }}</h4>
                  </div>
                  <div class="row">
                    <div class="col-12 mb-3">
                      <strong>Beschreibung:</strong> {{ item.description }}
                    </div>
                    <div class="col-md-4">
                      <strong>Menge:</strong> {{ item.quantity }}
                    </div>
                    <div class="col-md-4">
                      <strong>Einzelpreis:</strong> {{ item.unitPrice | currency:'EUR' }}
                    </div>
                    <div class="col-md-4">
                      <strong>MwSt-Satz:</strong> {{ item.taxRate }}%
                    </div>
                  </div>
                  <div class="row mt-3 pt-3 border-top">
                    <div class="col-md-4">
                      <strong>Netto:</strong><br>
                      <span class="text-primary">{{ item.netAmount | currency:'EUR' }}</span>
                    </div>
                    <div class="col-md-4">
                      <strong>MwSt:</strong><br>
                      <span class="text-muted">{{ item.taxAmount | currency:'EUR' }}</span>
                    </div>
                    <div class="col-md-4">
                      <strong>Brutto:</strong><br>
                      <span class="fw-bold">{{ item.grossAmount | currency:'EUR' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-lg-4 mb-4">
            <!-- Summary -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-white">
                <h3 class="h5 mb-0">💰 Zusammenfassung</h3>
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-2">
                  <span>Netto-Betrag:</span>
                  <span>{{ offer.netAmount | currency:'EUR' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>MwSt:</span>
                  <span>{{ offer.taxAmount | currency:'EUR' }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Brutto-Betrag:</span>
                  <span>{{ offer.grossAmount | currency:'EUR' }}</span>
                </div>
                <div *ngIf="offer.discountAmount && offer.discountAmount > 0" class="d-flex justify-content-between mb-2">
                  <span>Rabatt:</span>
                  <span class="text-danger">-{{ offer.discountAmount | currency:'EUR' }}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fw-bold fs-5">
                  <span>Endbetrag:</span>
                  <span class="text-success">{{ offer.finalAmount | currency:'EUR' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="card shadow-sm">
              <div class="card-header bg-white">
                <h3 class="h5 mb-0">⚡ Aktionen</h3>
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <button 
                    *ngIf="offer.status === 'DRAFT'"
                    (click)="markAsSent()" 
                    class="btn btn-success">
                    📤 Versenden
                  </button>
                  <button 
                    *ngIf="offer.status === 'SENT'"
                    (click)="markAsPaid()" 
                    class="btn btn-primary">
                    💰 Als bezahlt markieren
                  </button>
                  <button 
                    (click)="downloadPdf()" 
                    class="btn btn-outline-primary">
                    📄 PDF herunterladen
                  </button>
                  <button 
                    [routerLink]="['/offers', offer.id, 'edit']" 
                    class="btn btn-outline-secondary">
                    ✏️ Bearbeiten
                  </button>
                  <button 
                    (click)="deleteOffer()" 
                    class="btn btn-outline-danger">
                    🗑️ Löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OfferDetailComponent implements OnInit {
  offer: Offer | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.loadOffer();
  }

  loadOffer(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Keine Angebots-ID angegeben';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.offerService.getOffer(parseInt(id)).subscribe({
      next: (offer) => {
        this.offer = offer;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden des Angebots:', error);
        this.error = 'Fehler beim Laden des Angebots. Bitte versuchen Sie es erneut.';
        this.isLoading = false;
      }
    });
  }

  markAsSent(): void {
    if (!this.offer?.id) return;

    this.offerService.markAsSent(this.offer.id).subscribe({
      next: () => {
        this.loadOffer(); // Reload to get updated status
      },
      error: (error) => {
        console.error('Fehler beim Versenden:', error);
        alert('Fehler beim Versenden des Angebots. Bitte versuchen Sie es erneut.');
      }
    });
  }

  markAsPaid(): void {
    if (!this.offer?.id) return;

    this.offerService.markAsPaid(this.offer.id).subscribe({
      next: () => {
        this.loadOffer(); // Reload to get updated status
      },
      error: (error) => {
        console.error('Fehler beim Markieren als bezahlt:', error);
        alert('Fehler beim Markieren als bezahlt. Bitte versuchen Sie es erneut.');
      }
    });
  }

  downloadPdf(): void {
    if (!this.offer) return;

    this.pdfService.generateOfferPdf(this.offer);
  }

  deleteOffer(): void {
    if (!this.offer?.id) return;

    if (confirm('Sind Sie sicher, dass Sie dieses Angebot löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      this.offerService.deleteOffer(this.offer.id).subscribe({
        next: () => {
          this.router.navigate(['/offers']);
        },
        error: (error) => {
          console.error('Fehler beim Löschen:', error);
          alert('Fehler beim Löschen des Angebots. Bitte versuchen Sie es erneut.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/offers']);
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