import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Customer, 
  CustomerRequest, 
  CustomerSearchRequest, 
  CustomerSearchResponse, 
  CustomerStatisticsResponse,
  CustomerStatus 
} from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  // CRUD Operationen
  getCustomers(page = 0, size = 20, sortBy = 'createdAt', sortDirection: 'asc' | 'desc' = 'desc'): Observable<CustomerSearchResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<CustomerSearchResponse>(this.API_URL, { params });
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.API_URL}/${id}`);
  }

  createCustomer(customer: CustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.API_URL, customer);
  }

  updateCustomer(id: number, customer: CustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${this.API_URL}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Erweiterte Suche
  searchCustomers(searchRequest: CustomerSearchRequest): Observable<CustomerSearchResponse> {
    return this.http.post<CustomerSearchResponse>(`${this.API_URL}/search`, searchRequest);
  }

  // Status-basierte Filter
  getCustomersByStatus(status: CustomerStatus): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.API_URL}/status/${status}`);
  }

  // Status ändern
  changeCustomerStatus(id: number, status: CustomerStatus): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/status?status=${status}`, {});
  }

  // Als kontaktiert markieren
  markCustomerAsContacted(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/contact`, {});
  }

  // Kunden zuweisen (nur Admin)
  assignCustomer(id: number, userId: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/assign?userId=${userId}`, {});
  }

  // Statistiken (nur Admin)
  getCustomerStatistics(): Observable<CustomerStatisticsResponse> {
    return this.http.get<CustomerStatisticsResponse>(`${this.API_URL}/statistics`);
  }

  // Hilfsmethoden
  getStatusDisplayName(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'Aktiv';
      case CustomerStatus.INACTIVE: return 'Inaktiv';
      case CustomerStatus.POTENTIAL: return 'Potenziell';
      default: return status;
    }
  }

  getStatusClass(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'badge-success';
      case CustomerStatus.INACTIVE: return 'badge-secondary';
      case CustomerStatus.POTENTIAL: return 'badge-warning';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 