import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'unauthorized', loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers', 
    loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers/new', 
    loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers/pipeline', 
    loadComponent: () => import('./features/customers/pipeline/pipeline.component').then(m => m.PipelineComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers/:id', 
    loadComponent: () => import('./features/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers/:id/edit', 
    loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'statistics', 
    loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { path: '**', redirectTo: '/dashboard' }
];
