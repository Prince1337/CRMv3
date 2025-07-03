import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingComponent } from './loading.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-init',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <app-loading></app-loading>
  `
})
export class InitComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
} 