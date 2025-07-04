import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Gesamtkunden</h3>
            <div class="stat-value">150</div>
            <div class="stat-description">Aktive Kunden in der Datenbank</div>
          </div>

          <div class="stat-card">
            <h3>Aktive Kunden</h3>
            <div class="stat-value">100</div>
            <div class="stat-description">Kunden mit Status "Aktiv"</div>
          </div>

          <div class="stat-card">
            <h3>Potenziell</h3>
            <div class="stat-value">20</div>
            <div class="stat-description">Kunden mit Status "Potenziell"</div>
          </div>

          <div class="stat-card">
            <h3>Inaktiv</h3>
            <div class="stat-value">30</div>
            <div class="stat-description">Kunden mit Status "Inaktiv"</div>
          </div>
        </div>

        <div class="chart-section">
          <h2>Kunden nach Stadt</h2>
          <div class="chart-placeholder">
            <p>Chart-Komponente wird hier implementiert</p>
          </div>
        </div>

        <div class="chart-section">
          <h2>Kunden nach Quelle</h2>
          <div class="chart-placeholder">
            <p>Chart-Komponente wird hier implementiert</p>
          </div>
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      text-align: center;
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

    .chart-section {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-section h2 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .chart-placeholder {
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 0.5rem;
      padding: 3rem;
      text-align: center;
      color: #64748b;
    }

    @media (max-width: 768px) {
      .statistics-main {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .statistics-header h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class StatisticsComponent {
  // Hier werden später die echten Statistiken implementiert
} 