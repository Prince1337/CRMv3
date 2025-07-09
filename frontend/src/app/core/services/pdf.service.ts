import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateOfferPdf(offer: any): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('ANGEBOT', 105, 20, { align: 'center' });
    
    // Angebotsnummer
    doc.setFontSize(12);
    doc.text(`Angebotsnummer: ${offer.offerNumber}`, 20, 40);
    doc.text(`Datum: ${this.formatDate(offer.createdAt)}`, 20, 50);
    if (offer.validUntil) {
      doc.text(`Gültig bis: ${this.formatDate(offer.validUntil)}`, 20, 60);
    }
    
    // Kunde
    doc.setFontSize(14);
    doc.text('Angebot für:', 20, 80);
    doc.setFontSize(12);
    doc.text(offer.customerName || 'Kunde', 20, 90);
    
    // Positionen
    doc.setFontSize(14);
    doc.text('Positionen:', 20, 120);
    
    let yPosition = 140;
    offer.items.forEach((item: any, index: number) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${item.description}`, 20, yPosition);
      doc.text(`${item.quantity}x ${this.formatCurrency(item.unitPrice)}`, 120, yPosition);
      doc.text(this.formatCurrency(item.netAmount || 0), 160, yPosition);
      
      yPosition += 10;
    });
    
    // Summen
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('Zwischensumme:', 120, yPosition);
    doc.text(this.formatCurrency(offer.netAmount || 0), 160, yPosition);
    
    yPosition += 10;
    doc.text('MwSt:', 120, yPosition);
    doc.text(this.formatCurrency(offer.taxAmount || 0), 160, yPosition);
    
    if (offer.discountAmount && offer.discountAmount > 0) {
      yPosition += 10;
      doc.text('Rabatt:', 120, yPosition);
      doc.text(`-${this.formatCurrency(offer.discountAmount)}`, 160, yPosition);
    }
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Gesamtbetrag:', 120, yPosition);
    doc.text(this.formatCurrency(offer.finalAmount || 0), 160, yPosition);
    
    // Status
    yPosition += 20;
    doc.setFontSize(10);
    doc.text(`Status: ${offer.statusDisplayName}`, 20, yPosition);
    
    // Speichern
    doc.save(`angebot-${offer.offerNumber}.pdf`);
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-DE');
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
} 