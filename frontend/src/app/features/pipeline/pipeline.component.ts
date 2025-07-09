import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { Customer, CustomerStatus, CustomerPriority, LeadSource, PipelineCustomers, PipelineStatistics } from '../../core/models/customer.models';
import { PipelineUpdateService } from '../../core/services/pipeline-update.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent implements OnInit, OnDestroy {
  pipelineCustomers: PipelineCustomers = {};
  statistics: PipelineStatistics | null = null;
  loading = true;
  error = '';
  
  // Modal-Status
  showStatusModal = false;
  selectedCustomer: Customer | null = null;
  selectedNewStatus: CustomerStatus | null = null;
  private updateSubscription: Subscription | undefined;

  // Pipeline-Status in der richtigen Reihenfolge
  pipelineStatuses = [
    CustomerStatus.NEW,
    CustomerStatus.CONTACTED,
    CustomerStatus.OFFER_CREATED,
    CustomerStatus.WON,
    CustomerStatus.LOST
  ];

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private pipelineUpdateService: PipelineUpdateService
  ) {}

  ngOnInit(): void {
    this.loadPipelineData();
    this.updateSubscription = this.pipelineUpdateService.pipelineUpdate$.subscribe(() => {
      this.loadPipelineData();
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  loadPipelineData(): void {
    this.loading = true;
    this.error = '';

    // Pipeline-Kunden laden
    this.customerService.getPipelineCustomers().subscribe({
      next: (data) => {
        this.pipelineCustomers = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Fehler beim Laden der Pipeline-Daten';
        this.loading = false;
        console.error('Pipeline loading error:', error);
      }
    });

    // Pipeline-Statistiken laden
    this.customerService.getPipelineStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (error) => {
        console.error('Statistics loading error:', error);
      }
    });
  }

  getStatusDisplayName(status: CustomerStatus): string {
    return this.customerService.getStatusDisplayName(status);
  }

  getStatusClass(status: CustomerStatus): string {
    return this.customerService.getStatusClass(status);
  }

  getStatusIcon(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.NEW:
        return '🆕';
      case CustomerStatus.CONTACTED:
        return '📞';
      case CustomerStatus.OFFER_CREATED:
        return '📋';
      case CustomerStatus.WON:
        return '✅';
      case CustomerStatus.LOST:
        return '❌';
      default:
        return '📊';
    }
  }

  getCustomersForStatus(status: CustomerStatus): Customer[] {
    return this.pipelineCustomers[status] || [];
  }

  getNextPossibleStatuses(status: CustomerStatus): CustomerStatus[] {
    return this.customerService.getNextPossibleStatuses(status);
  }

  // Neue Modal-Methoden
  openStatusModal(customer: Customer): void {
    this.selectedCustomer = customer;
    this.selectedNewStatus = null;
    this.showStatusModal = true;
    console.log('Status modal opened for customer:', customer.id);
  }

  closeStatusModal(): void {
    this.showStatusModal = false;
    this.selectedCustomer = null;
    this.selectedNewStatus = null;
  }

  selectStatus(status: CustomerStatus): void {
    this.selectedNewStatus = status;
    console.log('Status selected:', status);
  }

  confirmStatusChange(): void {
    if (!this.selectedCustomer || !this.selectedNewStatus) {
      console.error('No customer or status selected');
      return;
    }

    console.log('Confirming status change:', this.selectedCustomer.id, '->', this.selectedNewStatus);

    this.customerService.changePipelineStatus(this.selectedCustomer.id, this.selectedNewStatus).subscribe({
      next: (updatedCustomer) => {
        console.log('Status change successful:', updatedCustomer);
        
        // Kunden aus der aktuellen Spalte entfernen
        const currentStatus = this.selectedCustomer!.status;
        if (this.pipelineCustomers[currentStatus]) {
          this.pipelineCustomers[currentStatus] = this.pipelineCustomers[currentStatus]
            .filter(c => c.id !== this.selectedCustomer!.id);
        }

        // Kunden zur neuen Spalte hinzufügen
        if (!this.pipelineCustomers[this.selectedNewStatus!]) {
          this.pipelineCustomers[this.selectedNewStatus!] = [];
        }
        this.pipelineCustomers[this.selectedNewStatus!].push(updatedCustomer);

        // Modal schließen
        this.closeStatusModal();
        
        // Statistiken neu laden
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Status change error:', error);
        this.error = 'Fehler beim Ändern des Status';
      }
    });
  }

  moveToNextStep(customer: Customer): void {
    this.customerService.moveToNextPipelineStep(customer.id).subscribe({
      next: (updatedCustomer) => {
        // Kunden aus der aktuellen Spalte entfernen
        const currentStatus = customer.status;
        if (this.pipelineCustomers[currentStatus]) {
          this.pipelineCustomers[currentStatus] = this.pipelineCustomers[currentStatus]
            .filter(c => c.id !== customer.id);
        }

        // Kunden zur neuen Spalte hinzufügen
        const newStatus = updatedCustomer.status;
        if (!this.pipelineCustomers[newStatus]) {
          this.pipelineCustomers[newStatus] = [];
        }
        this.pipelineCustomers[newStatus].push(updatedCustomer);

        // Statistiken neu laden
        this.loadStatistics();
      },
      error: (error) => {
        this.error = 'Fehler beim Weiterschalten';
        console.error('Next step error:', error);
      }
    });
  }

  loadStatistics(): void {
    this.customerService.getPipelineStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (error) => {
        console.error('Statistics loading error:', error);
      }
    });
  }

  viewCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id]);
  }

  editCustomer(customer: Customer): void {
    this.router.navigate(['/customers/edit', customer.id]);
  }

  formatDate(dateString: string): string {
    return this.customerService.formatDate(dateString);
  }

  getCustomerCount(status: CustomerStatus): number {
    return this.getCustomersForStatus(status).length;
  }

  getConversionRate(): number {
    if (!this.statistics) return 0;
    return this.statistics.conversionRate;
  }

  getTotalInPipeline(): number {
    if (!this.statistics) return 0;
    return this.statistics.totalInPipeline;
  }

  getPriorityDisplayName(priority: CustomerPriority): string {
    return this.customerService.getPriorityDisplayName(priority);
  }

  getPriorityClass(priority: CustomerPriority): string {
    return this.customerService.getPriorityClass(priority);
  }

  getLeadSourceDisplayName(source: LeadSource): string {
    return this.customerService.getLeadSourceDisplayName(source);
  }

  // Neue Hilfsmethoden für bessere UI
  getCustomerAge(customer: Customer): string {
    if (!customer.createdAt) return '';
    
    const created = new Date(customer.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 Tag';
    if (diffDays < 7) return `${diffDays} Tage`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Wochen`;
    return `${Math.floor(diffDays / 30)} Monate`;
  }

  getStatusColor(status: CustomerStatus): string {
    switch (status) {
      case CustomerStatus.NEW:
        return '#007AFF';
      case CustomerStatus.CONTACTED:
        return '#FF9500';
      case CustomerStatus.OFFER_CREATED:
        return '#AF52DE';
      case CustomerStatus.WON:
        return '#34C759';
      case CustomerStatus.LOST:
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  }

  getPriorityColor(priority: CustomerPriority): string {
    switch (priority) {
      case CustomerPriority.HIGH:
        return '#FF3B30';
      case CustomerPriority.MEDIUM:
        return '#FF9500';
      case CustomerPriority.LOW:
        return '#34C759';
      default:
        return '#8E8E93';
    }
  }

  // Modal-Handler
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showStatusModal) {
      this.closeStatusModal();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.showStatusModal && target.classList.contains('modal-overlay')) {
      this.closeStatusModal();
    }
  }
} 