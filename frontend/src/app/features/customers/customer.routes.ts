import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const CUSTOMER_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./customer-list/customer-list.component').then(m => m.CustomerListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'new', 
    loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: ':id', 
    loadComponent: () => import('./customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: ':id/edit', 
    loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  }
]; 