import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StatisticsResponse } from '../models/statistics.models';
import { ApiConfig } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly API_URL = `${ApiConfig.API_BASE_URL}/statistics`;

  constructor(private http: HttpClient) {}

  /**
   * Lädt alle CRM-Statistiken
   */
  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(this.API_URL);
  }

  /**
   * Formatiert eine Zahl als Währung
   */
  formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '0,00 €';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Formatiert eine Prozentzahl
   */
  formatPercentage(value: number | null | undefined): string {
    if (value == null) return '0%';
    return `${value.toFixed(1)}%`;
  }

  /**
   * Formatiert eine große Zahl mit Tausendertrennzeichen
   */
  formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';
    return new Intl.NumberFormat('de-DE').format(value);
  }
} 