import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, CustomerStatus } from '../../../core/models/customer.models';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-detail.component.html'
})
export class CustomerDetailComponent implements OnInit {
  customerService = inject(CustomerService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  customer$!: Observable<Customer | null>;
  loading = true;
  error = '';
  
  // Löschfunktion Variablen
  showDeleteConfirm = false;
  customerToDelete: Customer | null = null;
  deleting = false;

  ngOnInit(): void {
    this.customer$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        if (!id) {
          this.error = 'Ungültige Kunden-ID.';
          this.loading = false;
          return of(null);
        }
        this.loading = true;
        this.error = '';
        return this.customerService.getCustomer(id).pipe(
          catchError(err => {
            this.error = 'Kunde konnte nicht geladen werden.';
            this.loading = false;
            return of(null);
          })
        );
      })
    );
    this.customer$.subscribe(() => this.loading = false);
  }

  editCustomer(id: number) {
    this.router.navigate(['/customers', id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/customers']);
  }
  
  // Löschfunktion Methoden
  confirmDelete(customer: Customer) {
    this.customerToDelete = customer;
    this.showDeleteConfirm = true;
  }
  
  cancelDelete() {
    this.showDeleteConfirm = false;
    this.customerToDelete = null;
    this.deleting = false;
  }
  
  deleteCustomer() {
    if (!this.customerToDelete) return;
    
    this.deleting = true;
    this.customerService.deleteCustomer(this.customerToDelete.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.customerToDelete = null;
        // Zurück zur Kundenliste navigieren
        this.router.navigate(['/customers']);
      },
      error: (error) => {
        this.deleting = false;
        console.error('Fehler beim Löschen des Kunden:', error);
        // Hier könnte man eine Fehlermeldung anzeigen
        alert('Fehler beim Löschen des Kunden. Bitte versuchen Sie es erneut.');
      }
    });
  }
} 