export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  POTENTIAL = 'POTENTIAL'
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
  position?: string;
  department?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  fullAddress?: string;
  status: CustomerStatus;
  statusDisplayName: string;
  source?: string;
  tags?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
  createdById: number;
  createdByFullName: string;
  assignedToId?: number;
  assignedToFullName?: string;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  companyName?: string;
  position?: string;
  department?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  website?: string;
  status: CustomerStatus;
  source?: string;
  tags?: string;
  notes?: string;
  internalNotes?: string;
  assignedToId?: number;
  lastContact?: string;
}

export interface CustomerSearchRequest {
  name?: string;
  email?: string;
  company?: string;
  city?: string;
  status?: CustomerStatus;
  tag?: string;
  source?: string;
  assignedToId?: number;
  createdById?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CustomerSearchResponse {
  content: Customer[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction: string;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

export interface CustomerStatisticsResponse {
  totalCustomers: number;
  customersByStatus: { [key: string]: number };
  customersByCity: { [key: string]: number };
  customersBySource: { [key: string]: number };
  activeCustomers: number;
  inactiveCustomers: number;
  potentialCustomers: number;
} 