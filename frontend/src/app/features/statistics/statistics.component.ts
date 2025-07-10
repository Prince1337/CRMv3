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
  templateUrl: './statistics.component.html'
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