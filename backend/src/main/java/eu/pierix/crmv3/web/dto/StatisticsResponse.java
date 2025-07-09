package eu.pierix.crmv3.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO für Statistik-Antworten
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {

    // Übersicht Statistiken
    private OverviewStatistics overview;
    
    // Umsatz Statistiken
    private RevenueStatistics revenue;
    
    // Konversionsraten
    private ConversionStatistics conversion;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStatistics {
        private Long totalCustomers;
        private Long openLeads;
        private Long openTasks;
        private Long activeCustomers;
        private Long potentialCustomers;
        private Long inactiveCustomers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStatistics {
        private BigDecimal totalRevenue;
        private BigDecimal monthlyRevenue;
        private BigDecimal wonRevenue;
        private BigDecimal lostRevenue;
        private List<MonthlyRevenue> monthlyRevenueData;
        private Long wonLeads;
        private Long lostLeads;
        private BigDecimal conversionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
        private Long wonLeads;
        private Long lostLeads;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversionStatistics {
        private BigDecimal leadToCustomerRate;
        private BigDecimal offerToWonRate;
        private BigDecimal overallConversionRate;
        private Map<String, BigDecimal> conversionBySource;
        private Map<String, BigDecimal> conversionByStatus;
    }
} 