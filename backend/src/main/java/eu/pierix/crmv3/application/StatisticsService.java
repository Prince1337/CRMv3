package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.*;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.OfferRepository;
import eu.pierix.crmv3.web.dto.StatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service für die Berechnung von CRM-Statistiken
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final CustomerRepository customerRepository;
    private final OfferRepository offerRepository;

    /**
     * Berechnet alle Statistiken für das Dashboard
     */
    public StatisticsResponse getStatistics() {
        try {
            log.info("Berechne CRM-Statistiken...");
            
            StatisticsResponse.OverviewStatistics overview = calculateOverviewStatistics();
            StatisticsResponse.RevenueStatistics revenue = calculateRevenueStatistics();
            StatisticsResponse.ConversionStatistics conversion = calculateConversionStatistics();

            return StatisticsResponse.builder()
                    .overview(overview)
                    .revenue(revenue)
                    .conversion(conversion)
                    .build();
                    
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Statistiken: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden der Statistiken: " + e.getMessage());
        }
    }

    /**
     * Berechnet Übersichtsstatistiken
     */
    private StatisticsResponse.OverviewStatistics calculateOverviewStatistics() {
        try {
            // Gesamtkunden
            long totalCustomers = customerRepository.count();
            
            // Offene Leads (NEW, CONTACTED, OFFER_CREATED)
            long openLeads = customerRepository.countByStatusIn(
                Arrays.asList(CustomerStatus.NEW, CustomerStatus.CONTACTED, CustomerStatus.OFFER_CREATED)
            );
            
            // Offene Aufgaben (noch nicht implementiert, daher 0)
            long openTasks = 0L;
            
            // Kunden nach Status
            long activeCustomers = customerRepository.countByStatus(CustomerStatus.ACTIVE);
            long potentialCustomers = customerRepository.countByStatus(CustomerStatus.POTENTIAL);
            long inactiveCustomers = customerRepository.countByStatus(CustomerStatus.INACTIVE);

            return StatisticsResponse.OverviewStatistics.builder()
                    .totalCustomers(totalCustomers)
                    .openLeads(openLeads)
                    .openTasks(openTasks)
                    .activeCustomers(activeCustomers)
                    .potentialCustomers(potentialCustomers)
                    .inactiveCustomers(inactiveCustomers)
                    .build();
                    
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Übersichtsstatistiken: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden der Übersichtsstatistiken");
        }
    }

    /**
     * Berechnet Umsatzstatistiken
     */
    private StatisticsResponse.RevenueStatistics calculateRevenueStatistics() {
        try {
            // Gesamtumsatz aus bezahlten Angeboten
            BigDecimal totalRevenue = offerRepository.findByStatus(OfferStatus.PAID)
                    .stream()
                    .map(Offer::getFinalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Monatlicher Umsatz (aktueller Monat)
            LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);
            BigDecimal monthlyRevenue = offerRepository.findByStatusAndCreatedAtAfter(OfferStatus.PAID, currentMonth.atStartOfDay())
                    .stream()
                    .map(Offer::getFinalAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Gewonnene vs. verlorene Leads
            long wonLeads = customerRepository.countByStatus(CustomerStatus.WON);
            long lostLeads = customerRepository.countByStatus(CustomerStatus.LOST);

            // Umsatz aus gewonnenen Leads (identisch mit Gesamtumsatz aus bezahlten Angeboten)
            BigDecimal wonRevenue = totalRevenue;

            // Umsatz aus verlorenen Leads (0, da verloren)
            BigDecimal lostRevenue = BigDecimal.ZERO;

            // Konversionsrate
            BigDecimal conversionRate = BigDecimal.ZERO;
            if (wonLeads + lostLeads > 0) {
                conversionRate = BigDecimal.valueOf(wonLeads)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(wonLeads + lostLeads), 2, RoundingMode.HALF_UP);
            }

            // Monatliche Umsatzdaten (letzte 6 Monate)
            List<StatisticsResponse.MonthlyRevenue> monthlyRevenueData = calculateMonthlyRevenueData();

            return StatisticsResponse.RevenueStatistics.builder()
                    .totalRevenue(totalRevenue)
                    .monthlyRevenue(monthlyRevenue)
                    .wonRevenue(wonRevenue)
                    .lostRevenue(lostRevenue)
                    .monthlyRevenueData(monthlyRevenueData)
                    .wonLeads(wonLeads)
                    .lostLeads(lostLeads)
                    .conversionRate(conversionRate)
                    .build();
                    
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Umsatzstatistiken: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden der Umsatzstatistiken");
        }
    }

    /**
     * Berechnet monatliche Umsatzdaten
     */
    private List<StatisticsResponse.MonthlyRevenue> calculateMonthlyRevenueData() {
        try {
            List<StatisticsResponse.MonthlyRevenue> monthlyData = new ArrayList<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            
            // Letzte 6 Monate
            for (int i = 5; i >= 0; i--) {
                LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
                LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                
                BigDecimal monthRevenue = offerRepository.findByStatusAndCreatedAtBetween(
                        OfferStatus.PAID, 
                        monthStart.atStartOfDay(), 
                        monthEnd.atTime(23, 59, 59)
                ).stream()
                .map(Offer::getFinalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long monthWonLeads = customerRepository.countByStatusAndCreatedAtBetween(
                        CustomerStatus.WON,
                        monthStart.atStartOfDay(),
                        monthEnd.atTime(23, 59, 59)
                );

                long monthLostLeads = customerRepository.countByStatusAndCreatedAtBetween(
                        CustomerStatus.LOST,
                        monthStart.atStartOfDay(),
                        monthEnd.atTime(23, 59, 59)
                );

                monthlyData.add(StatisticsResponse.MonthlyRevenue.builder()
                        .month(monthStart.format(formatter))
                        .revenue(monthRevenue)
                        .wonLeads(monthWonLeads)
                        .lostLeads(monthLostLeads)
                        .build());
            }

            return monthlyData;
            
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der monatlichen Umsatzdaten: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Berechnet Konversionsraten
     */
    private StatisticsResponse.ConversionStatistics calculateConversionStatistics() {
        try {
            // Lead zu Kunde Konversionsrate
            long totalLeads = customerRepository.countByStatusIn(
                Arrays.asList(CustomerStatus.NEW, CustomerStatus.CONTACTED, CustomerStatus.OFFER_CREATED, CustomerStatus.WON, CustomerStatus.LOST)
            );
            long convertedLeads = customerRepository.countByStatus(CustomerStatus.WON);
            
            BigDecimal leadToCustomerRate = BigDecimal.ZERO;
            if (totalLeads > 0) {
                leadToCustomerRate = BigDecimal.valueOf(convertedLeads)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalLeads), 2, RoundingMode.HALF_UP);
            }

            // Angebot zu Gewonnen Konversionsrate
            long totalOffers = offerRepository.count();
            long wonOffers = offerRepository.countByStatus(OfferStatus.PAID);
            
            BigDecimal offerToWonRate = BigDecimal.ZERO;
            if (totalOffers > 0) {
                offerToWonRate = BigDecimal.valueOf(wonOffers)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalOffers), 2, RoundingMode.HALF_UP);
            }

            // Gesamtkonversionsrate
            BigDecimal overallConversionRate = BigDecimal.ZERO;
            if (totalLeads > 0) {
                overallConversionRate = BigDecimal.valueOf(convertedLeads)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalLeads), 2, RoundingMode.HALF_UP);
            }

            // Konversionsraten nach Quelle
            Map<String, BigDecimal> conversionBySource = calculateConversionBySource();
            
            // Konversionsraten nach Status
            Map<String, BigDecimal> conversionByStatus = calculateConversionByStatus();

            return StatisticsResponse.ConversionStatistics.builder()
                    .leadToCustomerRate(leadToCustomerRate)
                    .offerToWonRate(offerToWonRate)
                    .overallConversionRate(overallConversionRate)
                    .conversionBySource(conversionBySource)
                    .conversionByStatus(conversionByStatus)
                    .build();
                    
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Konversionsraten: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden der Konversionsraten");
        }
    }

    /**
     * Berechnet Konversionsraten nach Quelle
     */
    private Map<String, BigDecimal> calculateConversionBySource() {
        try {
            Map<String, BigDecimal> conversionBySource = new HashMap<>();
            
            // Alle Lead-Quellen durchgehen
            for (LeadSource source : LeadSource.values()) {
                long totalLeadsFromSource = customerRepository.countByLeadSource(source);
                long wonLeadsFromSource = customerRepository.countByLeadSourceAndStatus(source, CustomerStatus.WON);
                
                BigDecimal conversionRate = BigDecimal.ZERO;
                if (totalLeadsFromSource > 0) {
                    conversionRate = BigDecimal.valueOf(wonLeadsFromSource)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(BigDecimal.valueOf(totalLeadsFromSource), 2, RoundingMode.HALF_UP);
                }
                
                conversionBySource.put(source.getDisplayName(), conversionRate);
            }
            
            return conversionBySource;
            
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Konversionsraten nach Quelle: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    /**
     * Berechnet Konversionsraten nach Status
     */
    private Map<String, BigDecimal> calculateConversionByStatus() {
        try {
            Map<String, BigDecimal> conversionByStatus = new HashMap<>();
            
            // Pipeline-Status durchgehen
            for (CustomerStatus status : Arrays.asList(CustomerStatus.NEW, CustomerStatus.CONTACTED, CustomerStatus.OFFER_CREATED)) {
                long totalInStatus = customerRepository.countByStatus(status);
                long wonFromStatus = customerRepository.countByStatus(CustomerStatus.WON);
                
                BigDecimal conversionRate = BigDecimal.ZERO;
                if (totalInStatus > 0) {
                    conversionRate = BigDecimal.valueOf(wonFromStatus)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(BigDecimal.valueOf(totalInStatus), 2, RoundingMode.HALF_UP);
                }
                
                conversionByStatus.put(status.getDisplayName(), conversionRate);
            }
            
            return conversionByStatus;
            
        } catch (Exception e) {
            log.error("Fehler beim Berechnen der Konversionsraten nach Status: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }
} 