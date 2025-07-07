import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Customer, 
  CustomerRequest, 
  CustomerSearchRequest, 
  CustomerStatisticsResponse,
  CustomerStatus,
  CustomerPriority,
  LeadSource,
  PipelineCustomers,
  PipelineStatistics
} from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  // CRUD Operationen
  getCustomers(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.API_URL, { params });
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
  searchCustomers(searchRequest: CustomerSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/search`, searchRequest);
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

  // Pipeline-spezifische Methoden
  getPipelineCustomers(): Observable<PipelineCustomers> {
    return this.http.get<PipelineCustomers>(`${this.API_URL}/pipeline`);
  }

  getPipelineCustomersByStatus(status: CustomerStatus): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.API_URL}/pipeline/${status}`);
  }

  changePipelineStatus(id: number, newStatus: CustomerStatus): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/pipeline-status?newStatus=${newStatus}`, {});
  }

  moveToNextPipelineStep(id: number): Observable<Customer> {
    return this.http.patch<Customer>(`${this.API_URL}/${id}/next-pipeline-step`, {});
  }

  getPipelineStatistics(): Observable<PipelineStatistics> {
    return this.http.get<PipelineStatistics>(`${this.API_URL}/pipeline/statistics`);
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
      case CustomerStatus.NEW: return 'Neu';
      case CustomerStatus.CONTACTED: return 'Kontaktiert';
      case CustomerStatus.OFFER_CREATED: return 'Angebot erstellt';
      case CustomerStatus.WON: return 'Gewonnen';
      case CustomerStatus.LOST: return 'Verloren';
      default: return status;
    }
  }

  getPriorityDisplayName(priority: CustomerPriority): string {
    switch (priority) {
      case CustomerPriority.LOW: return 'Niedrig';
      case CustomerPriority.MEDIUM: return 'Mittel';
      case CustomerPriority.HIGH: return 'Hoch';
      case CustomerPriority.VIP: return 'VIP';
      default: return priority;
    }
  }

  getLeadSourceDisplayName(source: LeadSource): string {
    switch (source) {
      case LeadSource.WEBSITE: return 'Website';
      case LeadSource.REFERRAL: return 'Empfehlung';
      case LeadSource.TRADE_FAIR: return 'Messe';
      case LeadSource.SOCIAL_MEDIA: return 'Social Media';
      case LeadSource.EMAIL_CAMPAIGN: return 'E-Mail Kampagne';
      case LeadSource.COLD_CALL: return 'Kaltakquise';
      case LeadSource.PARTNER: return 'Partner';
      case LeadSource.OTHER: return 'Sonstiges';
      default: return source;
    }
  }

  getPriorityClass(priority: CustomerPriority): string {
    switch (priority) {
      case CustomerPriority.LOW: return 'priority-low';
      case CustomerPriority.MEDIUM: return 'priority-medium';
      case CustomerPriority.HIGH: return 'priority-high';
      case CustomerPriority.VIP: return 'priority-vip';
      default: return 'priority-medium';
    }
  }

  calculateProbability(status: CustomerStatus): number {
    switch (status) {
      case CustomerStatus.NEW: return 10;
      case CustomerStatus.CONTACTED: return 25;
      case CustomerStatus.OFFER_CREATED: return 60;
      case CustomerStatus.WON: return 100;
      case CustomerStatus.LOST: return 0;
      default: return 0;
    }
  }

  getNextPipelineStep(currentStatus: CustomerStatus): CustomerStatus | null {
    switch (currentStatus) {
      case CustomerStatus.NEW: return CustomerStatus.CONTACTED;
      case CustomerStatus.CONTACTED: return CustomerStatus.OFFER_CREATED;
      case CustomerStatus.OFFER_CREATED: return CustomerStatus.WON;
      default: return null;
    }
  }

  getStatusClass(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.ACTIVE: return 'badge-success';
      case CustomerStatus.INACTIVE: return 'badge-secondary';
      case CustomerStatus.POTENTIAL: return 'badge-warning';
      case CustomerStatus.NEW: return 'badge-info';
      case CustomerStatus.CONTACTED: return 'badge-primary';
      case CustomerStatus.OFFER_CREATED: return 'badge-warning';
      case CustomerStatus.WON: return 'badge-success';
      case CustomerStatus.LOST: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  isPipelineStatus(status: CustomerStatus): boolean {
    return status === CustomerStatus.NEW || 
           status === CustomerStatus.CONTACTED || 
           status === CustomerStatus.OFFER_CREATED || 
           status === CustomerStatus.WON || 
           status === CustomerStatus.LOST;
  }

  getNextPossibleStatuses(status: CustomerStatus): CustomerStatus[] {
    switch (status) {
      case CustomerStatus.NEW:
        return [CustomerStatus.CONTACTED, CustomerStatus.LOST];
      case CustomerStatus.CONTACTED:
        return [CustomerStatus.OFFER_CREATED, CustomerStatus.LOST];
      case CustomerStatus.OFFER_CREATED:
        return [CustomerStatus.WON, CustomerStatus.LOST];
      case CustomerStatus.WON:
        return [CustomerStatus.ACTIVE];
      case CustomerStatus.LOST:
        return [CustomerStatus.POTENTIAL];
      default:
        return [];
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