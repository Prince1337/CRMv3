import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offer, OfferRequest, OfferSearchRequest, OfferStatus } from '../models/offer.models';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private apiUrl = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) { }

  getOffers(searchRequest: OfferSearchRequest = {}): Observable<any> {
    let params = new HttpParams();
    
    if (searchRequest.customerId) {
      params = params.set('customerId', searchRequest.customerId.toString());
    }
    if (searchRequest.status) {
      params = params.set('status', searchRequest.status);
    }
    if (searchRequest.createdById) {
      params = params.set('createdById', searchRequest.createdById.toString());
    }
    if (searchRequest.page !== undefined) {
      params = params.set('page', searchRequest.page.toString());
    }
    if (searchRequest.size) {
      params = params.set('size', searchRequest.size.toString());
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getOffer(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`);
  }

  createOffer(offer: OfferRequest): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, offer);
  }

  updateOffer(id: number, offer: OfferRequest): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${id}`, offer);
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  markAsSent(id: number): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/send`, {});
  }

  markAsPaid(id: number): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/paid`, {});
  }

  getOverdueOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.apiUrl}/overdue`);
  }

  getOfferStatistics(): Observable<Record<OfferStatus, number>> {
    return this.http.get<Record<OfferStatus, number>>(`${this.apiUrl}/statistics`);
  }
} 