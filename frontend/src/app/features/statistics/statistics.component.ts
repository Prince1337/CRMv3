import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../core/services/statistics.service';
import { StatisticsResponse } from '../../core/models/statistics.models';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="statistics-container">
      <header class="statistics-header">
        <h1>CRM Statistiken</h1>
        <p>Administrator-Bereich</p>
      </header>

      <main class="statistics-main">
        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Lade Statistiken...</span>
          </div>
          <p class="mt-3">Lade Statistiken...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Fehler beim Laden der Statistiken</h4>
          <p>{{ error }}</p>
          <button class="btn btn-outline-danger" (click)="loadStatistics()">
            Erneut versuchen
          </button>
        </div>

        <!-- Statistics Content -->
        <div *ngIf="!loading && !error && statistics" class="statistics-content">
          <!-- Übersicht -->
          <section class="overview-section">
            <h2>Übersicht</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Gesamtkunden</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.totalCustomers) }}</div>
                <div class="stat-description">Alle Kunden in der Datenbank</div>
              </div>

              <div class="stat-card">
                <h3>Offene Leads</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.openLeads) }}</div>
                <div class="stat-description">Leads in der Pipeline</div>
              </div>

              <div class="stat-card">
                <h3>Offene Aufgaben</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.openTasks) }}</div>
                <div class="stat-description">Noch zu erledigende Aufgaben</div>
              </div>

              <div class="stat-card">
                <h3>Aktive Kunden</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.activeCustomers) }}</div>
                <div class="stat-description">Kunden mit Status "Aktiv"</div>
              </div>

              <div class="stat-card">
                <h3>Potenziell</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.potentialCustomers) }}</div>
                <div class="stat-description">Kunden mit Status "Potenziell"</div>
              </div>

              <div class="stat-card">
                <h3>Inaktiv</h3>
                <div class="stat-value">{{ formatNumber(statistics.overview.inactiveCustomers) }}</div>
                <div class="stat-description">Kunden mit Status "Inaktiv"</div>
              </div>
            </div>
          </section>

          <!-- Umsatz -->
          <section class="revenue-section">
            <h2>Umsatz & Leads</h2>
            <div class="revenue-grid">
              <div class="revenue-card">
                <h3>Gesamtumsatz</h3>
                <div class="stat-value">{{ formatCurrency(statistics.revenue.totalRevenue) }}</div>
                <div class="stat-description">Gesamter Umsatz aus bezahlten Rechnungen</div>
              </div>

              <div class="revenue-card">
                <h3>Monatlicher Umsatz</h3>
                <div class="stat-value">{{ formatCurrency(statistics.revenue.monthlyRevenue) }}</div>
                <div class="stat-description">Umsatz im aktuellen Monat</div>
              </div>

              <div class="revenue-card">
                <h3>Gewonnene Leads</h3>
                <div class="stat-value text-success">{{ formatNumber(statistics.revenue.wonLeads) }}</div>
                <div class="stat-description">Erfolgreich gewonnene Leads</div>
              </div>

              <div class="revenue-card">
                <h3>Verlorene Leads</h3>
                <div class="stat-value text-danger">{{ formatNumber(statistics.revenue.lostLeads) }}</div>
                <div class="stat-description">Verlorene Leads</div>
              </div>

              <div class="revenue-card">
                <h3>Konversionsrate</h3>
                <div class="stat-value">{{ formatPercentage(statistics.revenue.conversionRate) }}</div>
                <div class="stat-description">Rate gewonnener vs. verlorener Leads</div>
              </div>

              <div class="revenue-card">
                <h3>Gewonnener Umsatz</h3>
                <div class="stat-value text-success">{{ formatCurrency(statistics.revenue.wonRevenue) }}</div>
                <div class="stat-description">Umsatz aus gewonnenen Leads</div>
              </div>
            </div>

            <!-- Monatliche Umsatzdaten -->
            <div class="monthly-revenue-section">
              <h3>Umsatz nach Monat</h3>
              <div class="monthly-revenue-grid">
                <div *ngFor="let monthData of statistics.revenue.monthlyRevenueData" class="month-card">
                  <h4>{{ formatMonth(monthData.month) }}</h4>
                  <div class="month-revenue">{{ formatCurrency(monthData.revenue) }}</div>
                  <div class="month-leads">
                    <span class="text-success">+{{ monthData.wonLeads }}</span>
                    <span class="text-danger">-{{ monthData.lostLeads }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Konversionsraten -->
          <section class="conversion-section">
            <h2>Konversionsraten</h2>
            <div class="conversion-grid">
              <div class="conversion-card">
                <h3>Lead zu Kunde</h3>
                <div class="stat-value">{{ formatPercentage(statistics.conversion.leadToCustomerRate) }}</div>
                <div class="stat-description">Rate der Leads die zu Kunden werden</div>
              </div>

              <div class="conversion-card">
                <h3>Angebot zu Gewonnen</h3>
                <div class="stat-value">{{ formatPercentage(statistics.conversion.offerToWonRate) }}</div>
                <div class="stat-description">Rate der Angebote die gewonnen werden</div>
              </div>

              <div class="conversion-card">
                <h3>Gesamtkonversion</h3>
                <div class="stat-value">{{ formatPercentage(statistics.conversion.overallConversionRate) }}</div>
                <div class="stat-description">Gesamte Konversionsrate</div>
              </div>
            </div>

            <!-- Konversion nach Quelle -->
            <div class="conversion-details">
              <h3>Konversion nach Quelle</h3>
              <div class="conversion-source-grid">
                <div *ngFor="let source of getConversionSources()" class="source-card">
                  <h4>{{ source.name }}</h4>
                  <div class="source-rate">{{ formatPercentage(source.rate) }}</div>
                </div>
              </div>
            </div>

            <!-- Konversion nach Status -->
            <div class="conversion-details">
              <h3>Konversion nach Status</h3>
              <div class="conversion-status-grid">
                <div *ngFor="let status of getConversionStatuses()" class="status-card">
                  <h4>{{ status.name }}</h4>
                  <div class="status-rate">{{ formatPercentage(status.rate) }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .statistics-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .statistics-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 2rem 0;
      text-align: center;
    }

    .statistics-header h1 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 2rem;
      font-weight: 600;
    }

    .statistics-header p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }

    .statistics-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
    }

    .statistics-content section {
      margin-bottom: 3rem;
    }

    .statistics-content h2 {
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      margin: 0 0 1rem 0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .stat-description {
      color: #64748b;
      font-size: 0.875rem;
    }

    .revenue-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .revenue-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .monthly-revenue-section {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .monthly-revenue-section h3 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .monthly-revenue-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .month-card {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;
    }

    .month-card h4 {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .month-revenue {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .month-leads {
      font-size: 0.875rem;
    }

    .conversion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .conversion-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .conversion-details {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .conversion-details h3 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .conversion-source-grid,
    .conversion-status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .source-card,
    .status-card {
      background: #f8fafc;
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;
    }

    .source-card h4,
    .status-card h4 {
      margin: 0 0 0.5rem 0;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .source-rate,
    .status-rate {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .text-success {
      color: #10b981 !important;
    }

    .text-danger {
      color: #ef4444 !important;
    }

    @media (max-width: 768px) {
      .statistics-main {
        padding: 1rem;
      }

      .stats-grid,
      .revenue-grid,
      .conversion-grid {
        grid-template-columns: 1fr;
      }

      .monthly-revenue-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .statistics-header h1 {
        font-size: 1.5rem;
      }

      .stat-value {
        font-size: 2rem;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  statistics: StatisticsResponse | null = null;
  loading = false;
  error: string | null = null;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.statisticsService.getStatistics()
      .pipe(
        catchError(error => {
          console.error('Fehler beim Laden der Statistiken:', error);
          this.error = 'Fehler beim Laden der Statistiken. Bitte versuchen Sie es erneut.';
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(data => {
        if (data) {
          this.statistics = data;
        }
      });
  }

  formatNumber(value: number | null | undefined): string {
    return this.statisticsService.formatNumber(value);
  }

  formatCurrency(value: number | null | undefined): string {
    return this.statisticsService.formatCurrency(value);
  }

  formatPercentage(value: number | null | undefined): string {
    return this.statisticsService.formatPercentage(value);
  }

  formatMonth(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }

  getConversionSources(): Array<{name: string, rate: number}> {
    if (!this.statistics?.conversion.conversionBySource) return [];
    
    return Object.entries(this.statistics.conversion.conversionBySource)
      .map(([name, rate]) => ({ name, rate }))
      .sort((a, b) => b.rate - a.rate);
  }

  getConversionStatuses(): Array<{name: string, rate: number}> {
    if (!this.statistics?.conversion.conversionByStatus) return [];
    
    return Object.entries(this.statistics.conversion.conversionByStatus)
      .map(([name, rate]) => ({ name, rate }))
      .sort((a, b) => b.rate - a.rate);
  }
} 