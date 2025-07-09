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
  styleUrls: ['./offer-detail.component.scss'],
  template: `
    <div class="offer-detail-container">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Lade Angebotsdetails...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-state">
        <div class="error-icon">⚠</div>
        <h3>Fehler beim Laden</h3>
        <p>{{ error }}</p>
        <button (click)="goBack()" class="back-button">Zurück zur Übersicht</button>
      </div>

      <!-- Content -->
      <div *ngIf="offer && !isLoading" class="offer-content">
        <!-- Header -->
        <div class="detail-header">
          <div class="header-left">
            <button (click)="goBack()" class="back-button">
              ← Zurück
            </button>
            <div class="offer-info">
              <h1>{{ offer.title }}</h1>
              <p class="offer-number">{{ offer.offerNumber }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button 
              *ngIf="offer.status === 'DRAFT'"
              (click)="markAsSent()" 
              class="action-button send-button">
              Versenden
            </button>
            <button 
              *ngIf="offer.status === 'SENT'"
              (click)="markAsPaid()" 
              class="action-button paid-button">
              Als bezahlt markieren
            </button>
            <button 
              (click)="downloadPdf()" 
              class="action-button pdf-button">
              📄 PDF herunterladen
            </button>
            <button 
              [routerLink]="['/offers', offer.id, 'edit']" 
              class="action-button edit-button">
              Bearbeiten
            </button>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="status-section">
          <span [class]="getStatusBadgeClass(offer.status)" class="status-badge">
            {{ offer.statusDisplayName }}
          </span>
          <div class="status-info">
            <p *ngIf="offer.createdAt">
              <strong>Erstellt:</strong> {{ offer.createdAt | date:'medium' }}
            </p>
            <p *ngIf="offer.sentAt">
              <strong>Versendet:</strong> {{ offer.sentAt | date:'medium' }}
            </p>
            <p *ngIf="offer.paidAt">
              <strong>Bezahlt:</strong> {{ offer.paidAt | date:'medium' }}
            </p>
            <p *ngIf="offer.validUntil">
              <strong>Gültig bis:</strong> {{ offer.validUntil | date:'mediumDate' }}
            </p>
          </div>
        </div>

        <!-- Main Content -->
        <div class="detail-grid">
          <!-- Left Column -->
          <div class="detail-left">
            <!-- Customer Information -->
            <div class="detail-section">
              <h2>Kunde</h2>
              <div class="customer-info">
                <p><strong>Name:</strong> {{ offer.customerName }}</p>
                <p><strong>Kunden-ID:</strong> {{ offer.customerId }}</p>
              </div>
            </div>

            <!-- Offer Details -->
            <div class="detail-section">
              <h2>Angebotsdetails</h2>
              <div class="offer-details">
                <p *ngIf="offer.description">
                  <strong>Beschreibung:</strong><br>
                  {{ offer.description }}
                </p>
                <p *ngIf="offer.discountPercentage && offer.discountPercentage > 0">
                  <strong>Rabatt:</strong> {{ offer.discountPercentage }}%
                </p>
              </div>
            </div>

            <!-- Items -->
            <div class="detail-section">
              <h2>Positionen</h2>
              <div class="items-list">
                <div *ngFor="let item of offer.items; let i = index" class="item-card">
                  <div class="item-header">
                    <h3>Position {{ i + 1 }}</h3>
                  </div>
                  <div class="item-details">
                    <p><strong>Beschreibung:</strong> {{ item.description }}</p>
                    <div class="item-grid">
                      <div class="item-field">
                        <span class="label">Menge:</span>
                        <span class="value">{{ item.quantity }}</span>
                      </div>
                      <div class="item-field">
                        <span class="label">Einzelpreis:</span>
                        <span class="value">{{ item.unitPrice | currency:'EUR' }}</span>
                      </div>
                      <div class="item-field">
                        <span class="label">MwSt-Satz:</span>
                        <span class="value">{{ item.taxRate }}%</span>
                      </div>
                    </div>
                    <div class="item-totals">
                      <div class="total-item">
                        <span class="label">Netto:</span>
                        <span class="amount">{{ item.netAmount | currency:'EUR' }}</span>
                      </div>
                      <div class="total-item">
                        <span class="label">MwSt:</span>
                        <span class="amount">{{ item.taxAmount | currency:'EUR' }}</span>
                      </div>
                      <div class="total-item">
                        <span class="label">Brutto:</span>
                        <span class="amount">{{ item.grossAmount | currency:'EUR' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="detail-right">
            <!-- Summary -->
            <div class="detail-section summary-section">
              <h2>Zusammenfassung</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Netto-Betrag:</span>
                  <span class="amount">{{ offer.netAmount | currency:'EUR' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">MwSt:</span>
                  <span class="amount">{{ offer.taxAmount | currency:'EUR' }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Brutto-Betrag:</span>
                  <span class="amount">{{ offer.grossAmount | currency:'EUR' }}</span>
                </div>
                <div *ngIf="offer.discountAmount && offer.discountAmount > 0" class="summary-item">
                  <span class="label">Rabatt:</span>
                  <span class="amount discount">-{{ offer.discountAmount | currency:'EUR' }}</span>
                </div>
                <div class="summary-item final">
                  <span class="label">Endbetrag:</span>
                  <span class="amount">{{ offer.finalAmount | currency:'EUR' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="detail-section">
              <h2>Aktionen</h2>
              <div class="actions-grid">
                <button 
                  *ngIf="offer.status === 'DRAFT'"
                  (click)="markAsSent()" 
                  class="action-button send-button">
                  📤 Versenden
                </button>
                <button 
                  *ngIf="offer.status === 'SENT'"
                  (click)="markAsPaid()" 
                  class="action-button paid-button">
                  💰 Als bezahlt markieren
                </button>
                <button 
                  (click)="downloadPdf()" 
                  class="action-button pdf-button">
                  📄 PDF herunterladen
                </button>
                <button 
                  [routerLink]="['/offers', offer.id, 'edit']" 
                  class="action-button edit-button">
                  ✏️ Bearbeiten
                </button>
                <button 
                  (click)="deleteOffer()" 
                  class="action-button delete-button">
                  🗑️ Löschen
                </button>
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
        return 'status-badge draft';
      case OfferStatus.SENT:
        return 'status-badge sent';
      case OfferStatus.PAID:
        return 'status-badge paid';
      case OfferStatus.OVERDUE:
        return 'status-badge overdue';
      default:
        return 'status-badge draft';
    }
  }
} 