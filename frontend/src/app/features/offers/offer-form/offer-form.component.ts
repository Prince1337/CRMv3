import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { CustomerService } from '../../../core/services/customer.service';
import { OfferRequest, OfferItemRequest, OfferStatus } from '../../../core/models/offer.models';
import { Customer } from '../../../core/models/customer.models';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./offer-form.component.scss'],
  template: `
    <div class="offer-form-container">
      <div class="form-header">
        <h1>Neues Angebot</h1>
        <button 
          (click)="goBack()" 
          class="back-button">
          ← Zurück
        </button>
      </div>

      <form [formGroup]="offerForm" (ngSubmit)="onSubmit()">
        <!-- Kunde auswählen -->
        <div class="form-section">
          <h2>Kunde</h2>
          <div class="form-grid">
            <div class="form-field">
              <label for="customerId" class="required">
                Kunde auswählen
              </label>
              <select 
                id="customerId" 
                formControlName="customerId"
                [disabled]="isLoadingCustomers"
                [class.error]="offerForm.get('customerId')?.invalid && offerForm.get('customerId')?.touched">
                <option value="">
                  {{ isLoadingCustomers ? 'Lade Kunden...' : 'Bitte wählen...' }}
                </option>
                <option *ngFor="let customer of customers || []" [value]="customer.id">
                  {{ customer.companyName || customer.firstName + ' ' + customer.lastName }}
                </option>
              </select>
              <div *ngIf="offerForm.get('customerId')?.invalid && offerForm.get('customerId')?.touched" 
                   class="error-message">
                Bitte wählen Sie einen Kunden aus.
              </div>
            </div>
          </div>
        </div>

        <!-- Angebotsdetails -->
        <div class="form-section">
          <h2>Angebotsdetails</h2>
          <div class="form-grid">
            <div class="form-field">
              <label for="title" class="required">
                Angebotstitel
              </label>
              <input 
                type="text" 
                id="title" 
                formControlName="title"
                [class.error]="offerForm.get('title')?.invalid && offerForm.get('title')?.touched"
                placeholder="z.B. Webentwicklung für Online-Shop">
              <div *ngIf="offerForm.get('title')?.invalid && offerForm.get('title')?.touched" 
                   class="error-message">
                Bitte geben Sie einen Titel ein.
              </div>
            </div>

            <div class="form-field">
              <label for="validUntil" class="required">
                Gültig bis
              </label>
              <input 
                type="date" 
                id="validUntil" 
                formControlName="validUntil"
                [class.error]="offerForm.get('validUntil')?.invalid && offerForm.get('validUntil')?.touched">
              <div *ngIf="offerForm.get('validUntil')?.invalid && offerForm.get('validUntil')?.touched" 
                   class="error-message">
                Bitte geben Sie ein Gültigkeitsdatum ein.
              </div>
            </div>
          </div>

          <div class="form-field">
            <label for="description">
              Beschreibung
            </label>
            <textarea 
              id="description" 
              formControlName="description"
              rows="3"
              placeholder="Detaillierte Beschreibung der Leistungen..."></textarea>
          </div>

          <div class="form-field">
            <label for="discountPercentage">
              Rabatt (%)
            </label>
            <input 
              type="number" 
              id="discountPercentage" 
              formControlName="discountPercentage"
              min="0" 
              max="100" 
              step="0.01"
              placeholder="0.00">
          </div>
        </div>

        <!-- Positionen -->
        <div class="form-section items-section">
          <div class="items-header">
            <h2>Positionen</h2>
            <button 
              type="button"
              (click)="addItem()"
              class="add-item-button">
              + Position hinzufügen
            </button>
          </div>

          <div formArrayName="items">
            <div *ngFor="let item of itemsArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="item-card">
              <div class="item-header">
                <h3>Position {{ i + 1 }}</h3>
                <button 
                  type="button"
                  (click)="removeItem(i)"
                  class="remove-item-button">
                  ✕ Entfernen
                </button>
              </div>

              <div class="item-grid">
                <div class="form-field">
                  <label [for]="'description' + i" class="required">
                    Beschreibung
                  </label>
                  <input 
                    type="text" 
                    [id]="'description' + i"
                    formControlName="description"
                    placeholder="z.B. Webentwicklung">
                </div>

                <div class="form-field">
                  <label [for]="'quantity' + i" class="required">
                    Menge
                  </label>
                  <input 
                    type="number" 
                    [id]="'quantity' + i"
                    formControlName="quantity"
                    min="1"
                    placeholder="1">
                </div>

                <div class="form-field">
                  <label [for]="'unitPrice' + i" class="required">
                    Einzelpreis (€)
                  </label>
                  <input 
                    type="number" 
                    [id]="'unitPrice' + i"
                    formControlName="unitPrice"
                    min="0"
                    step="0.01"
                    placeholder="0.00">
                </div>

                <div class="form-field">
                  <label [for]="'taxRate' + i" class="required">
                    MwSt-Satz (%)
                  </label>
                  <select 
                    [id]="'taxRate' + i"
                    formControlName="taxRate">
                    <option value="19">19% (Standard)</option>
                    <option value="7">7% (ermäßigt)</option>
                    <option value="0">0% (steuerfrei)</option>
                  </select>
                </div>
              </div>

              <!-- Berechnete Werte -->
              <div class="calculated-values">
                <div class="values-grid">
                  <div class="value-item">
                    <div class="label">Netto</div>
                    <div class="amount">{{ calculateNetAmount(i) | currency:'EUR' }}</div>
                  </div>
                  <div class="value-item">
                    <div class="label">MwSt</div>
                    <div class="amount">{{ calculateTaxAmount(i) | currency:'EUR' }}</div>
                  </div>
                  <div class="value-item">
                    <div class="label">Brutto</div>
                    <div class="amount">{{ calculateGrossAmount(i) | currency:'EUR' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="itemsArray.length === 0" class="empty-state">
            <p>Noch keine Positionen hinzugefügt.</p>
            <p>Klicken Sie auf "Position hinzufügen" um zu beginnen.</p>
          </div>
        </div>

        <!-- Zusammenfassung -->
        <div class="form-section summary-section">
          <h2>Zusammenfassung</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="label">Netto-Betrag:</span>
              <span class="amount">{{ calculateTotalNetAmount() | currency:'EUR' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">MwSt:</span>
              <span class="amount">{{ calculateTotalTaxAmount() | currency:'EUR' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Brutto-Betrag:</span>
              <span class="amount">{{ calculateTotalGrossAmount() | currency:'EUR' }}</span>
            </div>
            <div *ngIf="offerForm.get('discountPercentage')?.value" class="summary-item">
              <span class="label">Rabatt ({{ offerForm.get('discountPercentage')?.value }}%):</span>
              <span class="amount discount">-{{ calculateDiscountAmount() | currency:'EUR' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Endbetrag:</span>
              <span class="amount final">{{ calculateFinalAmount() | currency:'EUR' }}</span>
            </div>
          </div>
        </div>

        <!-- Aktionen -->
        <div class="action-buttons">
          <button 
            type="button"
            (click)="goBack()"
            class="cancel-button">
            Abbrechen
          </button>
          <button 
            type="submit"
            [disabled]="offerForm.invalid || isSubmitting"
            class="submit-button">
            <span *ngIf="!isSubmitting">Angebot erstellen</span>
            <span *ngIf="isSubmitting">Wird erstellt...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class OfferFormComponent implements OnInit {
  offerForm: FormGroup;
  customers: Customer[] = [];
  isSubmitting = false;
  isLoadingCustomers = true;

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private customerService: CustomerService,
    private router: Router
  ) {
    this.offerForm = this.fb.group({
      customerId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      validUntil: ['', Validators.required],
      discountPercentage: [0],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadCustomers();
    this.setDefaultValidUntil();
  }

  get itemsArray() {
    return this.offerForm.get('items') as FormArray;
  }

  private loadCustomers() {
    this.isLoadingCustomers = true;
    this.customerService.getCustomers(0, 1000).subscribe({
      next: (response) => {
        // Extrahiere das content-Array aus der paginierten Antwort
        this.customers = response?.content || [];
        this.isLoadingCustomers = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Kunden:', error);
        this.customers = [];
        this.isLoadingCustomers = false;
      }
    });
  }

  private setDefaultValidUntil() {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30); // 30 Tage in der Zukunft
    this.offerForm.patchValue({
      validUntil: defaultDate.toISOString().split('T')[0]
    });
  }

  addItem() {
    const item = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [19, Validators.required]
    });

    this.itemsArray.push(item);
  }

  removeItem(index: number) {
    this.itemsArray.removeAt(index);
  }

  calculateNetAmount(index: number): number {
    const item = this.itemsArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  calculateTaxAmount(index: number): number {
    const netAmount = this.calculateNetAmount(index);
    const taxRate = this.itemsArray.at(index).get('taxRate')?.value || 0;
    return netAmount * (taxRate / 100);
  }

  calculateGrossAmount(index: number): number {
    return this.calculateNetAmount(index) + this.calculateTaxAmount(index);
  }

  calculateTotalNetAmount(): number {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      total += this.calculateNetAmount(i);
    }
    return total;
  }

  calculateTotalTaxAmount(): number {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      total += this.calculateTaxAmount(i);
    }
    return total;
  }

  calculateTotalGrossAmount(): number {
    return this.calculateTotalNetAmount() + this.calculateTotalTaxAmount();
  }

  calculateDiscountAmount(): number {
    const grossAmount = this.calculateTotalGrossAmount();
    const discountPercentage = this.offerForm.get('discountPercentage')?.value || 0;
    return grossAmount * (discountPercentage / 100);
  }

  calculateFinalAmount(): number {
    return this.calculateTotalGrossAmount() - this.calculateDiscountAmount();
  }

  onSubmit() {
    if (this.offerForm.valid) {
      this.isSubmitting = true;

      const formValue = this.offerForm.value;
      const offerRequest: OfferRequest = {
        title: formValue.title,
        description: formValue.description,
        validUntil: formValue.validUntil,
        status: OfferStatus.DRAFT,
        discountPercentage: formValue.discountPercentage,
        customerId: formValue.customerId,
        items: formValue.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate
        }))
      };

      this.offerService.createOffer(offerRequest).subscribe({
        next: (offer) => {
          console.log('Angebot erfolgreich erstellt:', offer);
          this.router.navigate(['/offers']);
        },
        error: (error) => {
          console.error('Fehler beim Erstellen des Angebots:', error);
          // Detaillierte Fehlerinformationen anzeigen
          if (error.status === 500) {
            console.error('Server-Fehler Details:', error.error);
          }
          this.isSubmitting = false;
          // Hier könnte eine Benutzerbenachrichtigung hinzugefügt werden
          alert('Fehler beim Erstellen des Angebots. Bitte versuchen Sie es erneut.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/offers']);
  }
} 