export enum OfferStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export interface OfferItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  netAmount?: number;
  taxAmount?: number;
  grossAmount?: number;
}

export interface OfferItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface Offer {
  id?: number;
  offerNumber?: string;
  title: string;
  description?: string;
  validUntil?: string;
  status: OfferStatus;
  statusDisplayName?: string;
  netAmount?: number;
  taxAmount?: number;
  grossAmount?: number;
  discountPercentage?: number;
  discountAmount?: number;
  finalAmount?: number;
  customerId: number;
  customerName?: string;
  createdById?: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string;
  paidAt?: string;
  items: OfferItem[];
}

export interface OfferRequest {
  title: string;
  description?: string;
  validUntil?: string;
  status?: OfferStatus;
  discountPercentage?: number;
  customerId: number;
  items: OfferItemRequest[];
}

export interface OfferSearchRequest {
  customerId?: number;
  status?: OfferStatus;
  createdById?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
} 