export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  POTENTIAL = 'POTENTIAL',
  // Vertriebs-Pipeline Status
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  OFFER_CREATED = 'OFFER_CREATED',
  WON = 'WON',
  LOST = 'LOST'
}

export enum CustomerPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VIP = 'VIP'
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  TRADE_FAIR = 'TRADE_FAIR',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  COLD_CALL = 'COLD_CALL',
  PHONE_CALL = 'PHONE_CALL',
  LINKEDIN = 'LINKEDIN',
  PARTNER = 'PARTNER',
  OTHER = 'OTHER'
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
  priority: CustomerPriority;
  leadSource: LeadSource;
  estimatedValue?: number;
  probability: number; // 0-100%
  expectedCloseDate?: string;
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
  pipelineEntryDate?: string;
  daysInPipeline?: number;
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
  priority: CustomerPriority;
  leadSource: LeadSource;
  estimatedValue?: number;
  probability?: number;
  expectedCloseDate?: string;
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

// Pipeline-spezifische Interfaces
export interface PipelineCustomers {
  [status: string]: Customer[];
}

export interface PipelineStatistics {
  customersByPipelineStatus: { [key: string]: number };
  totalInPipeline: number;
  conversionRate: number;
  wonCount: number;
  lostCount: number;
  totalValue: number;
  averageDealSize: number;
  averageDaysInPipeline: number;
  priorityDistribution: { [key: string]: number };
  sourceDistribution: { [key: string]: number };
}

export interface CustomerStatisticsResponse {
  totalCustomers: number;
  customersByStatus: { [key: string]: number };
  customersByCity: { [key: string]: number };
  customersBySource: { [key: string]: number };
  activeCustomers: number;
  inactiveCustomers: number;
  potentialCustomers: number;
  // Pipeline-spezifische Statistiken
  customersInPipeline?: number;
  wonCustomers?: number;
  lostCustomers?: number;
} 