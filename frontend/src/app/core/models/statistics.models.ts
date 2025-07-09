/**
 * Models für CRM-Statistiken
 */

export interface StatisticsResponse {
  overview: OverviewStatistics;
  revenue: RevenueStatistics;
  conversion: ConversionStatistics;
}

export interface OverviewStatistics {
  totalCustomers: number;
  openLeads: number;
  openTasks: number;
  activeCustomers: number;
  potentialCustomers: number;
  inactiveCustomers: number;
}

export interface RevenueStatistics {
  totalRevenue: number;
  monthlyRevenue: number;
  wonRevenue: number;
  lostRevenue: number;
  monthlyRevenueData: MonthlyRevenue[];
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  wonLeads: number;
  lostLeads: number;
}

export interface ConversionStatistics {
  leadToCustomerRate: number;
  offerToWonRate: number;
  overallConversionRate: number;
  conversionBySource: { [key: string]: number };
  conversionByStatus: { [key: string]: number };
} 