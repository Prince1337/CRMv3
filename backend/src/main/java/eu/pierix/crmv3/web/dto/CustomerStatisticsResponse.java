package eu.pierix.crmv3.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO für Kundenstatistiken
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerStatisticsResponse {

    private Long totalCustomers;
    private Map<String, Long> customersByStatus;
    private Map<String, Long> customersByCity;
    private Map<String, Long> customersBySource;
    private Long activeCustomers;
    private Long inactiveCustomers;
    private Long potentialCustomers;
} 