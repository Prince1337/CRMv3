import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="unauthorized-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1>Zugriff verweigert</h1>
        <p>Sie haben keine Berechtigung, diese Seite zu besuchen.</p>
        
        <div class="action-buttons">
          <button (click)="goBack()" class="btn-secondary">
            Zurück
          </button>
          <button (click)="goToDashboard()" class="btn-primary">
            Zum Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .unauthorized-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .unauthorized-icon {
      color: #e74c3c;
      margin-bottom: 20px;
    }

    h1 {
      color: #1e293b;
      margin: 0 0 16px 0;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      color: #64748b;
      margin: 0 0 32px 0;
      font-size: 16px;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      .unauthorized-card {
        padding: 30px 20px;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
} 