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
  styleUrls: ['./offer-list.component.scss'],
  template: `
    <div class="offer-list-container">
      <div class="list-header">
        <h1>Angebote</h1>
        <button 
          routerLink="/offers/new" 
          class="new-offer-button">
          Neues Angebot
        </button>
      </div>

      <div class="table-container">
        <table class="offer-table">
          <thead>
            <tr>
              <th>Angebotsnummer</th>
              <th>Titel</th>
              <th>Kunde</th>
              <th>Status</th>
              <th>Betrag</th>
              <th>Erstellt</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let offer of offers">
              <td class="offer-number">
                {{ offer.offerNumber }}
              </td>
              <td class="offer-title">
                {{ offer.title }}
              </td>
              <td class="customer-name">
                {{ offer.customerName }}
              </td>
              <td>
                <span [class]="getStatusBadgeClass(offer.status)" class="status-badge">
                  {{ offer.statusDisplayName }}
                </span>
              </td>
              <td class="amount">
                {{ offer.finalAmount | currency:'EUR' }}
              </td>
              <td class="date">
                {{ offer.createdAt | date:'short' }}
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    [routerLink]="['/offers', offer.id]" 
                    class="view-button">
                    Anzeigen
                  </button>
                  <button 
                    *ngIf="offer.status === 'DRAFT'"
                    (click)="markAsSent(offer.id!)" 
                    class="send-button">
                    Versenden
                  </button>
                  <button 
                    *ngIf="offer.status === 'SENT'"
                    (click)="markAsPaid(offer.id!)" 
                    class="paid-button">
                    Als bezahlt markieren
                  </button>
                  <button 
                    (click)="downloadPdf(offer)" 
                    class="pdf-button">
                    📄 PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class OfferListComponent implements OnInit {
  offers: Offer[] = [];

  constructor(
    private offerService: OfferService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offerService.getOffers().subscribe(response => {
      this.offers = response.content || response;
    });
  }

  markAsSent(id: number): void {
    this.offerService.markAsSent(id).subscribe(() => {
      this.loadOffers();
    });
  }

  markAsPaid(id: number): void {
    this.offerService.markAsPaid(id).subscribe(() => {
      this.loadOffers();
    });
  }

  downloadPdf(offer: Offer): void {
    this.pdfService.generateOfferPdf(offer);
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