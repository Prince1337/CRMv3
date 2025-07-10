import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="card shadow-sm border-0" style="max-width: 400px;">
          <div class="card-body p-5">
            <!-- Loading Spinner -->
            <div class="mb-4">
              <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Lädt...</span>
              </div>
            </div>
            
            <!-- Loading Text -->
            <h4 class="text-muted mb-2">Lade Daten...</h4>
            <p class="text-muted mb-0">Bitte haben Sie einen Moment Geduld</p>
            
            <!-- Optional: Progress Bar -->
            <div class="mt-4">
              <div class="progress" style="height: 4px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                     role="progressbar" 
                     style="width: 100%">
                </div>
              </div>
            </div>
            
            <!-- Loading Dots Animation -->
            <div class="mt-3">
              <span class="badge bg-primary me-1">●</span>
              <span class="badge bg-primary me-1" style="animation-delay: 0.2s;">●</span>
              <span class="badge bg-primary" style="animation-delay: 0.4s;">●</span>
            </div>
          </div>
        </div>
        
        <!-- Optional: Loading Tips -->
        <div class="mt-4">
          <div class="card border-0 bg-transparent">
            <div class="card-body p-3">
              <small class="text-muted">
                💡 Tipp: Während des Ladens können Sie sich bereits mit der Anwendung vertraut machen
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoadingComponent {} 