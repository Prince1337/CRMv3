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
  templateUrl: './customer-form.component.html',
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
  leadSourceValues = Object.values(LeadSource);

  constructor(
    private fb: FormBuilder,
    public customerService: CustomerService,
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
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')]],
      mobile: ['', [Validators.pattern('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s\\./0-9]*$')]],
      website: ['', [Validators.pattern('https?://.+')]],
      companyName: ['', [Validators.maxLength(100)]],
      position: ['', [Validators.maxLength(50)]],
      department: ['', [Validators.maxLength(50)]],
      street: ['', [Validators.maxLength(100)]],
      houseNumber: ['', [Validators.maxLength(10)]],
      postalCode: ['', [Validators.maxLength(10)]],
      city: ['', [Validators.maxLength(50)]],
      country: ['', [Validators.maxLength(50)]],
      status: [CustomerStatus.NEW, Validators.required],
      priority: [CustomerPriority.MEDIUM, Validators.required],
      leadSource: [LeadSource.OTHER, Validators.required],
      estimatedValue: [0, [Validators.min(0)]],
      probability: [0, [Validators.min(0), Validators.max(100)]],
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