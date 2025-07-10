import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateOfferPdf(offer: any): void {
    const doc = new jsPDF();
    
    // Farben definieren (RGB)
    const primaryColor = [52, 78, 65]; // CRM Deep Forest
    const secondaryColor = [88, 129, 87]; // CRM Forest
    const accentColor = [163, 177, 138]; // CRM Sage
    const textColor = [51, 51, 51];
    const lightGray = [128, 128, 128];
    
    // Header mit Logo-Bereich
    this.drawHeader(doc, offer, primaryColor, secondaryColor);
    
    // Kundeninformationen
    this.drawCustomerSection(doc, offer, primaryColor, textColor);
    
    // Angebotsdetails
    this.drawOfferDetails(doc, offer, primaryColor, textColor);
    
    // Positionen-Tabelle
    this.drawItemsTable(doc, offer, primaryColor, secondaryColor, accentColor, textColor, lightGray);
    
    // Zusammenfassung
    this.drawSummary(doc, offer, primaryColor, secondaryColor, textColor);
    
    // Footer
    this.drawFooter(doc, offer, lightGray);
    
    // Speichern
    doc.save(`angebot-${offer.offerNumber}.pdf`);
  }

  private drawHeader(doc: jsPDF, offer: any, primaryColor: number[], secondaryColor: number[]): void {
    // Hintergrund-Balken
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Logo-Bereich (Platzhalter)
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(20, 10, 40, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('CRM v3', 40, 22, { align: 'center' });
    
    // Titel
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ANGEBOT', 150, 25, { align: 'center' });
    
    // Angebotsnummer und Datum
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Angebotsnummer: ${offer.offerNumber}`, 150, 35, { align: 'center' });
    // Reset Textfarbe
    doc.setTextColor(51, 51, 51);
  }

  private drawCustomerSection(doc: jsPDF, offer: any, primaryColor: number[], textColor: number[]): void {
    let y = 60;
    
    // Abschnitt-Titel
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KUNDENINFORMATIONEN', 105, y, { align: 'center' });
    
    y += 15;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Kundenname
    doc.setFont('helvetica', 'bold');
    doc.text('Kunde:', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(offer.customerName || 'Nicht angegeben', 60, y);
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Kunden-ID:', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(offer.customerId?.toString() || 'N/A', 60, y);
  }

  private drawOfferDetails(doc: jsPDF, offer: any, primaryColor: number[], textColor: number[]): void {
    let y = 100;
    
    // Abschnitt-Titel
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANGEBOTSDETAILS', 105, y, { align: 'center' });
    
    y += 15;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Angebotstitel
    doc.setFont('helvetica', 'bold');
    doc.text('Titel:', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(offer.title || 'Nicht angegeben', 60, y);
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Erstellt:', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(offer.createdAt), 60, y);
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Gültig bis:', 25, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(offer.validUntil), 60, y);
    
    if (offer.description) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Beschreibung:', 25, y);
      doc.setFont('helvetica', 'normal');
      
      // Text umbrechen
      const lines = doc.splitTextToSize(offer.description, 120);
      doc.text(lines, 60, y);
      y += lines.length * 5;
    }
    
    if (offer.discountPercentage && offer.discountPercentage > 0) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Rabatt:', 25, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${offer.discountPercentage}%`, 60, y);
    }
  }

  private drawItemsTable(doc: jsPDF, offer: any, primaryColor: number[], secondaryColor: number[], accentColor: number[], textColor: number[], lightGray: number[]): void {
    let y = 160;
    
    // Tabellen-Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('POSITIONEN', 105, y, { align: 'center' });
    
    y += 15;
    
    // Tabellen-Header
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(20, y - 3, 170, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Pos.', 25, y);
    doc.text('Beschreibung', 45, y);
    doc.text('Menge', 120, y);
    doc.text('Einzelpreis', 140, y);
    doc.text('MwSt', 160, y);
    doc.text('Netto', 180, y);
    
    y += 10;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    
    // Positionen
    offer.items.forEach((item: any, index: number) => {
      // Prüfen ob neue Seite nötig
      if (y > 250) {
        doc.addPage();
        y = 20;
        // Tabellen-Header auf neuer Seite
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(20, y - 3, 170, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Pos.', 25, y);
        doc.text('Beschreibung', 45, y);
        doc.text('Menge', 120, y);
        doc.text('Einzelpreis', 140, y);
        doc.text('MwSt', 160, y);
        doc.text('Netto', 180, y);
        y += 10;
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', 'normal');
      }
      
      // Zeilen-Hintergrund abwechselnd
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 3, 170, 6, 'F');
      }
      
      doc.setFontSize(9);
      doc.text((index + 1).toString(), 25, y);
      
      // Beschreibung umbrechen
      const descLines = doc.splitTextToSize(item.description, 60);
      doc.text(descLines, 45, y);
      
      doc.text(item.quantity.toString(), 120, y);
      doc.text(this.formatCurrency(item.unitPrice), 140, y);
      doc.text(`${item.taxRate}%`, 160, y);
      doc.text(this.formatCurrency(item.netAmount || 0), 180, y);
      
      // Höhe basierend auf Beschreibung
      const lineHeight = Math.max(descLines.length * 3, 6);
      y += lineHeight;
    });
  }

  private drawSummary(doc: jsPDF, offer: any, primaryColor: number[], secondaryColor: number[], textColor: number[]): void {
    let y = doc.internal.pageSize.height - 80;
    
    // Zusammenfassung-Box
    doc.setFillColor(245, 245, 245);
    doc.rect(110, y - 5, 80, 60, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(110, y - 5, 80, 60, 'S');
    
    // Titel
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(110, y - 5, 80, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ZUSAMMENFASSUNG', 150, y, { align: 'center' });
    
    y += 15;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Summen
    doc.setFont('helvetica', 'bold');
    doc.text('Netto-Betrag:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatCurrency(offer.netAmount || 0), 180, y, { align: 'right' });
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('MwSt:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatCurrency(offer.taxAmount || 0), 180, y, { align: 'right' });
    
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Brutto-Betrag:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatCurrency(offer.grossAmount || 0), 180, y, { align: 'right' });
    
    if (offer.discountAmount && offer.discountAmount > 0) {
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Rabatt:', 115, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 53, 69); // Rot für Rabatt
      doc.text(`-${this.formatCurrency(offer.discountAmount)}`, 180, y, { align: 'right' });
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    }
    
    // Trennlinie
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(115, y, 185, y);
    
    // Endbetrag
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Endbetrag:', 115, y);
    doc.text(this.formatCurrency(offer.finalAmount || 0), 180, y, { align: 'right' });
  }

  private drawFooter(doc: jsPDF, offer: any, lightGray: number[]): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Footer-Linie
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.line(20, pageHeight - 30, 190, pageHeight - 30);
    
    // Footer-Text
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${offer.statusDisplayName}`, 20, pageHeight - 20);
    doc.text(`Erstellt am: ${this.formatDate(offer.createdAt)}`, 20, pageHeight - 15);
    
    if (offer.sentAt) {
      doc.text(`Versendet am: ${this.formatDate(offer.sentAt)}`, 20, pageHeight - 10);
    }
    
    if (offer.paidAt) {
      doc.text(`Bezahlt am: ${this.formatDate(offer.paidAt)}`, 20, pageHeight - 5);
    }
    
    // Seitenzahl
    doc.text(`Seite ${doc.getCurrentPageInfo().pageNumber}`, 190, pageHeight - 15, { align: 'right' });
  }

  private formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
} 