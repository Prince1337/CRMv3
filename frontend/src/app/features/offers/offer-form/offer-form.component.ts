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
  template: `
    <div class="container-fluid min-vh-100 bg-light">
      <div class="container py-4">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <button (click)="goBack()" class="btn btn-outline-secondary me-3">
                    ← Zurück
                  </button>
                  <h1 class="h3 mb-0">📄 Neues Angebot</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form [formGroup]="offerForm" (ngSubmit)="onSubmit()">
          <!-- Kunde auswählen -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header bg-white">
                  <h3 class="h5 mb-0">👤 Kunde</h3>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <label for="customerId" class="form-label">
                        Kunde auswählen <span class="text-danger">*</span>
                      </label>
                      <select 
                        id="customerId" 
                        formControlName="customerId"
                        class="form-select"
                        [class.is-invalid]="offerForm.get('customerId')?.invalid && offerForm.get('customerId')?.touched"
                        [disabled]="isLoadingCustomers">
                        <option value="">
                          {{ isLoadingCustomers ? 'Lade Kunden...' : 'Bitte wählen...' }}
                        </option>
                        <option *ngFor="let customer of customers || []" [value]="customer.id">
                          {{ customer.companyName || customer.firstName + ' ' + customer.lastName }}
                        </option>
                      </select>
                      <div *ngIf="offerForm.get('customerId')?.invalid && offerForm.get('customerId')?.touched" 
                           class="invalid-feedback">
                        Bitte wählen Sie einen Kunden aus.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Angebotsdetails -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header bg-white">
                  <h3 class="h5 mb-0">📋 Angebotsdetails</h3>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="title" class="form-label">
                        Angebotstitel <span class="text-danger">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="title" 
                        formControlName="title"
                        class="form-control"
                        [class.is-invalid]="offerForm.get('title')?.invalid && offerForm.get('title')?.touched"
                        placeholder="z.B. Webentwicklung für Online-Shop">
                      <div *ngIf="offerForm.get('title')?.invalid && offerForm.get('title')?.touched" 
                           class="invalid-feedback">
                        Bitte geben Sie einen Titel ein.
                      </div>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="validUntil" class="form-label">
                        Gültig bis <span class="text-danger">*</span>
                      </label>
                      <input 
                        type="date" 
                        id="validUntil" 
                        formControlName="validUntil"
                        class="form-control"
                        [class.is-invalid]="offerForm.get('validUntil')?.invalid && offerForm.get('validUntil')?.touched">
                      <div *ngIf="offerForm.get('validUntil')?.invalid && offerForm.get('validUntil')?.touched" 
                           class="invalid-feedback">
                        Bitte geben Sie ein Gültigkeitsdatum ein.
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-8 mb-3">
                      <label for="description" class="form-label">
                        Beschreibung
                      </label>
                      <textarea 
                        id="description" 
                        formControlName="description"
                        class="form-control"
                        rows="3"
                        placeholder="Detaillierte Beschreibung der Leistungen..."></textarea>
                    </div>

                    <div class="col-md-4 mb-3">
                      <label for="discountPercentage" class="form-label">
                        Rabatt (%)
                      </label>
                      <input 
                        type="number" 
                        id="discountPercentage" 
                        formControlName="discountPercentage"
                        class="form-control"
                        min="0" 
                        max="100" 
                        step="0.01"
                        placeholder="0.00">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Positionen -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                  <h3 class="h5 mb-0">📦 Positionen</h3>
                  <button 
                    type="button"
                    (click)="addItem()"
                    class="btn btn-outline-primary btn-sm">
                    + Position hinzufügen
                  </button>
                </div>
                <div class="card-body">
                  <div formArrayName="items">
                    <div *ngFor="let item of itemsArray.controls; let i = index" 
                         [formGroupName]="i" 
                         class="border rounded p-3 mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="h6 mb-0">Position {{ i + 1 }}</h4>
                        <button 
                          type="button"
                          (click)="removeItem(i)"
                          class="btn btn-outline-danger btn-sm">
                          ✕ Entfernen
                        </button>
                      </div>

                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label [for]="'description' + i" class="form-label">
                            Beschreibung <span class="text-danger">*</span>
                          </label>
                          <input 
                            type="text" 
                            [id]="'description' + i"
                            formControlName="description"
                            class="form-control"
                            placeholder="z.B. Webentwicklung">
                        </div>

                        <div class="col-md-2 mb-3">
                          <label [for]="'quantity' + i" class="form-label">
                            Menge <span class="text-danger">*</span>
                          </label>
                          <input 
                            type="number" 
                            [id]="'quantity' + i"
                            formControlName="quantity"
                            class="form-control"
                            min="1"
                            placeholder="1">
                        </div>

                        <div class="col-md-2 mb-3">
                          <label [for]="'unitPrice' + i" class="form-label">
                            Einzelpreis (€) <span class="text-danger">*</span>
                          </label>
                          <input 
                            type="number" 
                            [id]="'unitPrice' + i"
                            formControlName="unitPrice"
                            class="form-control"
                            min="0"
                            step="0.01"
                            placeholder="0.00">
                        </div>

                        <div class="col-md-2 mb-3">
                          <label [for]="'taxRate' + i" class="form-label">
                            MwSt-Satz (%) <span class="text-danger">*</span>
                          </label>
                          <select 
                            [id]="'taxRate' + i"
                            formControlName="taxRate"
                            class="form-select">
                            <option value="19">19% (Standard)</option>
                            <option value="7">7% (ermäßigt)</option>
                            <option value="0">0% (steuerfrei)</option>
                          </select>
                        </div>
                      </div>

                      <!-- Berechnete Werte -->
                      <div class="row mt-3 pt-3 border-top">
                        <div class="col-md-4">
                          <strong>Netto:</strong><br>
                          <span class="text-primary">{{ calculateNetAmount(i) | currency:'EUR' }}</span>
                        </div>
                        <div class="col-md-4">
                          <strong>MwSt:</strong><br>
                          <span class="text-muted">{{ calculateTaxAmount(i) | currency:'EUR' }}</span>
                        </div>
                        <div class="col-md-4">
                          <strong>Brutto:</strong><br>
                          <span class="fw-bold">{{ calculateGrossAmount(i) | currency:'EUR' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="itemsArray.length === 0" class="text-center py-4">
                    <div class="text-muted">
                      <div class="display-4 mb-3">📦</div>
                      <p>Noch keine Positionen hinzugefügt.</p>
                      <p>Klicken Sie auf "Position hinzufügen" um zu beginnen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Zusammenfassung -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-header bg-white">
                  <h3 class="h5 mb-0">💰 Zusammenfassung</h3>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="d-flex justify-content-between mb-2">
                        <span>Netto-Betrag:</span>
                        <span>{{ calculateTotalNetAmount() | currency:'EUR' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-2">
                        <span>MwSt:</span>
                        <span>{{ calculateTotalTaxAmount() | currency:'EUR' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-2">
                        <span>Brutto-Betrag:</span>
                        <span>{{ calculateTotalGrossAmount() | currency:'EUR' }}</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div *ngIf="offerForm.get('discountPercentage')?.value" class="d-flex justify-content-between mb-2">
                        <span>Rabatt ({{ offerForm.get('discountPercentage')?.value }}%):</span>
                        <span class="text-danger">-{{ calculateDiscountAmount() | currency:'EUR' }}</span>
                      </div>
                      <hr>
                      <div class="d-flex justify-content-between fw-bold fs-5">
                        <span>Endbetrag:</span>
                        <span class="text-success">{{ calculateFinalAmount() | currency:'EUR' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aktionen -->
          <div class="row">
            <div class="col-12">
              <div class="card shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-end gap-2">
                    <button 
                      type="button"
                      (click)="goBack()"
                      class="btn btn-outline-secondary">
                      Abbrechen
                    </button>
                    <button 
                      type="submit"
                      [disabled]="offerForm.invalid || isSubmitting"
                      class="btn btn-primary">
                      <span *ngIf="!isSubmitting">📄 Angebot erstellen</span>
                      <span *ngIf="isSubmitting">
                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                        Wird erstellt...
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
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