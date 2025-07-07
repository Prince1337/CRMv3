import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Customer, CustomerRequest, CustomerStatus, CustomerPriority, LeadSource } from '../../../core/models/customer.models';
import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="customer-form-container">
      <header class="form-header">
        <div class="header-content">
          <h1>{{ isEditMode ? 'Kunde bearbeiten' : 'Neuen Kunden erstellen' }}</h1>
          <button (click)="goBack()" class="btn-secondary">
            ← Zurück zur Liste
          </button>
        </div>
      </header>

      <!-- Fehlermeldung -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Ladeindikator -->
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ isEditMode ? 'Lade Kundendaten...' : 'Erstelle Kunde...' }}</p>
      </div>

      <!-- Formular -->
      <form *ngIf="!loading" [formGroup]="customerForm" (ngSubmit)="onSubmit()" class="customer-form">
        <div class="form-sections">
          <!-- Persönliche Daten -->
          <div class="form-section">
            <h2>Persönliche Daten</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="firstName">Vorname *</label>
                <input 
                  type="text" 
                  id="firstName" 
                  formControlName="firstName"
                  [class.invalid]="isFieldInvalid('firstName')"
                  placeholder="Vorname eingeben"
                />
                <div class="error-message" *ngIf="isFieldInvalid('firstName')">
                  {{ getErrorMessage('firstName') }}
                </div>
              </div>
              <div class="form-field">
                <label for="lastName">Nachname *</label>
                <input 
                  type="text" 
                  id="lastName" 
                  formControlName="lastName"
                  [class.invalid]="isFieldInvalid('lastName')"
                  placeholder="Nachname eingeben"
                />
                <div class="error-message" *ngIf="isFieldInvalid('lastName')">
                  {{ getErrorMessage('lastName') }}
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="email">E-Mail *</label>
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  [class.invalid]="isFieldInvalid('email')"
                  placeholder="E-Mail-Adresse eingeben"
                />
                <div class="error-message" *ngIf="isFieldInvalid('email')">
                  {{ getErrorMessage('email') }}
                </div>
              </div>
              <div class="form-field">
                <label for="phone">Telefon</label>
                <input 
                  type="tel" 
                  id="phone" 
                  formControlName="phone"
                  placeholder="Telefonnummer eingeben"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="mobile">Mobil</label>
                <input 
                  type="tel" 
                  id="mobile" 
                  formControlName="mobile"
                  placeholder="Mobilnummer eingeben"
                />
              </div>
              <div class="form-field">
                <label for="website">Website</label>
                <input 
                  type="url" 
                  id="website" 
                  formControlName="website"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          <!-- Firmendaten -->
          <div class="form-section">
            <h2>Firmendaten</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="companyName">Firmenname</label>
                <input 
                  type="text" 
                  id="companyName" 
                  formControlName="companyName"
                  placeholder="Firmenname eingeben"
                />
              </div>
              <div class="form-field">
                <label for="position">Position</label>
                <input 
                  type="text" 
                  id="position" 
                  formControlName="position"
                  placeholder="Position eingeben"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="department">Abteilung</label>
                <input 
                  type="text" 
                  id="department" 
                  formControlName="department"
                  placeholder="Abteilung eingeben"
                />
              </div>
            </div>
          </div>

          <!-- Adresse -->
          <div class="form-section">
            <h2>Adresse</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="street">Straße</label>
                <input 
                  type="text" 
                  id="street" 
                  formControlName="street"
                  placeholder="Straße eingeben"
                />
              </div>
              <div class="form-field">
                <label for="houseNumber">Hausnummer</label>
                <input 
                  type="text" 
                  id="houseNumber" 
                  formControlName="houseNumber"
                  placeholder="Hausnummer eingeben"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="postalCode">PLZ</label>
                <input 
                  type="text" 
                  id="postalCode" 
                  formControlName="postalCode"
                  placeholder="PLZ eingeben"
                />
              </div>
              <div class="form-field">
                <label for="city">Stadt</label>
                <input 
                  type="text" 
                  id="city" 
                  formControlName="city"
                  placeholder="Stadt eingeben"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="country">Land</label>
                <input 
                  type="text" 
                  id="country" 
                  formControlName="country"
                  placeholder="Land eingeben"
                />
              </div>
            </div>
          </div>

          <!-- Status und Quellen -->
          <div class="form-section">
            <h2>Status und Quellen</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="status">Status *</label>
                <select 
                  id="status" 
                  formControlName="status"
                  [class.invalid]="isFieldInvalid('status')"
                >
                  <option [value]="CustomerStatus.NEW">Neu</option>
                  <option [value]="CustomerStatus.CONTACTED">Kontaktiert</option>
                  <option [value]="CustomerStatus.OFFER_CREATED">Angebot erstellt</option>
                  <option [value]="CustomerStatus.WON">Gewonnen</option>
                  <option [value]="CustomerStatus.LOST">Verloren</option>
                  <option [value]="CustomerStatus.POTENTIAL">Potenziell</option>
                  <option [value]="CustomerStatus.ACTIVE">Aktiv</option>
                  <option [value]="CustomerStatus.INACTIVE">Inaktiv</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('status')">
                  {{ getErrorMessage('status') }}
                </div>
              </div>
              <div class="form-field">
                <label for="source">Quelle</label>
                <input 
                  type="text" 
                  id="source" 
                  formControlName="source"
                  placeholder="z.B. Website, Empfehlung, Messe"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="tags">Tags</label>
                <input 
                  type="text" 
                  id="tags" 
                  formControlName="tags"
                  placeholder="Tags durch Komma getrennt"
                />
              </div>
            </div>
          </div>

          <!-- Pipeline-Management -->
          <div class="form-section">
            <h2>Pipeline-Management</h2>
            <div class="form-row">
              <div class="form-field">
                <label for="priority">Priorität *</label>
                <select 
                  id="priority" 
                  formControlName="priority"
                  [class.invalid]="isFieldInvalid('priority')"
                >
                  <option [value]="CustomerPriority.LOW">Niedrig</option>
                  <option [value]="CustomerPriority.MEDIUM">Mittel</option>
                  <option [value]="CustomerPriority.HIGH">Hoch</option>
                  <option [value]="CustomerPriority.VIP">VIP</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('priority')">
                  {{ getErrorMessage('priority') }}
                </div>
              </div>
              <div class="form-field">
                <label for="leadSource">Lead-Quelle *</label>
                <select 
                  id="leadSource" 
                  formControlName="leadSource"
                  [class.invalid]="isFieldInvalid('leadSource')"
                >
                  <option [value]="LeadSource.WEBSITE">Website</option>
                  <option [value]="LeadSource.REFERRAL">Empfehlung</option>
                  <option [value]="LeadSource.TRADE_FAIR">Messe</option>
                  <option [value]="LeadSource.SOCIAL_MEDIA">Social Media</option>
                  <option [value]="LeadSource.EMAIL_CAMPAIGN">E-Mail Kampagne</option>
                  <option [value]="LeadSource.COLD_CALL">Kaltakquise</option>
                  <option [value]="LeadSource.PARTNER">Partner</option>
                  <option [value]="LeadSource.OTHER">Sonstiges</option>
                </select>
                <div class="error-message" *ngIf="isFieldInvalid('leadSource')">
                  {{ getErrorMessage('leadSource') }}
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="estimatedValue">Geschätzter Wert (€)</label>
                <input 
                  type="number" 
                  id="estimatedValue" 
                  formControlName="estimatedValue"
                  placeholder="z.B. 50000"
                  min="0"
                />
              </div>
              <div class="form-field">
                <label for="probability">Wahrscheinlichkeit (%)</label>
                <input 
                  type="number" 
                  id="probability" 
                  formControlName="probability"
                  placeholder="z.B. 75"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-field">
                <label for="expectedCloseDate">Erwartetes Abschlussdatum</label>
                <input 
                  type="date" 
                  id="expectedCloseDate" 
                  formControlName="expectedCloseDate"
                />
              </div>
            </div>
          </div>

          <!-- Notizen -->
          <div class="form-section">
            <h2>Notizen</h2>
            <div class="form-row">
              <div class="form-field full-width">
                <label for="notes">Öffentliche Notizen</label>
                <textarea 
                  id="notes" 
                  formControlName="notes"
                  rows="3"
                  placeholder="Öffentliche Notizen eingeben..."
                ></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-field full-width">
                <label for="internalNotes">Interne Notizen</label>
                <textarea 
                  id="internalNotes" 
                  formControlName="internalNotes"
                  rows="3"
                  placeholder="Interne Notizen eingeben..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Formular-Aktionen -->
        <div class="form-actions">
          <button 
            type="button" 
            (click)="goBack()" 
            class="btn-secondary"
            [disabled]="submitting"
          >
            Abbrechen
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="customerForm.invalid || submitting"
          >
            <span *ngIf="!submitting">{{ isEditMode ? 'Aktualisieren' : 'Erstellen' }}</span>
            <span *ngIf="submitting">Speichern...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode = false;
  customerId?: number;
  loading = false;
  submitting = false;
  error = '';

  CustomerStatus = CustomerStatus; // Für Template-Zugriff
  CustomerPriority = CustomerPriority; // Für Template-Zugriff
  LeadSource = LeadSource; // Für Template-Zugriff

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.customerForm = this.createForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.customerId = +id;
      this.loadCustomer(this.customerId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      mobile: [''],
      companyName: [''],
      position: [''],
      department: [''],
      street: [''],
      houseNumber: [''],
      postalCode: [''],
      city: [''],
      country: [''],
      website: [''],
      status: [CustomerStatus.NEW, Validators.required], // Standard: NEW für Pipeline
      priority: [CustomerPriority.MEDIUM, Validators.required],
      leadSource: [LeadSource.WEBSITE, Validators.required],
      estimatedValue: [null],
      probability: [25], // Standard-Wahrscheinlichkeit für NEW
      expectedCloseDate: [''],
      source: [''],
      tags: [''],
      notes: [''],
      internalNotes: [''],
      lastContact: ['']
    });
  }

  private loadCustomer(id: number): void {
    this.loading = true;
    this.error = '';

    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '',
          mobile: customer.mobile || '',
          companyName: customer.companyName || '',
          position: customer.position || '',
          department: customer.department || '',
          street: customer.street || '',
          houseNumber: customer.houseNumber || '',
          postalCode: customer.postalCode || '',
          city: customer.city || '',
          country: customer.country || '',
          website: customer.website || '',
          status: customer.status,
          priority: customer.priority || CustomerPriority.MEDIUM,
          leadSource: customer.leadSource || LeadSource.WEBSITE,
          estimatedValue: customer.estimatedValue || null,
          probability: customer.probability || 25,
          expectedCloseDate: customer.expectedCloseDate || '',
          source: customer.source || '',
          tags: customer.tags || '',
          notes: customer.notes || '',
          internalNotes: customer.internalNotes || '',
          lastContact: customer.lastContact || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fehler beim Laden des Kunden: ' + error.message;
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.submitting = true;
      this.error = '';

      const customerData: CustomerRequest = this.customerForm.value;

      if (this.isEditMode && this.customerId) {
        this.customerService.updateCustomer(this.customerId, customerData).subscribe({
          next: (customer) => {
            this.submitting = false;
            this.router.navigate(['/customers', customer.id]);
          },
          error: (error) => {
            this.error = 'Fehler beim Aktualisieren: ' + error.message;
            this.submitting = false;
          }
        });
      } else {
        this.customerService.createCustomer(customerData).subscribe({
          next: (customer) => {
            this.submitting = false;
            this.router.navigate(['/customers', customer.id]);
          },
          error: (error) => {
            this.error = 'Fehler beim Erstellen: ' + error.message;
            this.submitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} ist erforderlich`;
    }
    
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      if (field?.hasError('minlength')) {
        return `${this.getFieldDisplayName(fieldName)} muss mindestens 2 Zeichen lang sein`;
      }
    }
    
    if (fieldName === 'email' && field?.hasError('email')) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      status: 'Status'
    };
    return displayNames[fieldName] || fieldName;
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }
} 