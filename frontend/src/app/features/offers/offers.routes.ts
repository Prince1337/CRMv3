import { Routes } from '@angular/router';
import { OfferListComponent } from './offer-list/offer-list.component';

export const OFFER_ROUTES: Routes = [
  {
    path: '',
    component: OfferListComponent
  },
  {
    path: 'new',
    loadComponent: () => import('./offer-form/offer-form.component').then(m => m.OfferFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./offer-detail/offer-detail.component').then(m => m.OfferDetailComponent)
  }
]; 