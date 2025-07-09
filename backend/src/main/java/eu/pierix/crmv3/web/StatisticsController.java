package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.StatisticsService;
import eu.pierix.crmv3.web.dto.StatisticsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller für CRM-Statistiken
 */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Slf4j
public class StatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Lädt alle CRM-Statistiken
     * 
     * @return Statistiken für Dashboard
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatisticsResponse> getStatistics() {
        try {
            log.info("Statistiken werden angefordert");
            
            StatisticsResponse statistics = statisticsService.getStatistics();
            
            log.info("Statistiken erfolgreich geladen");
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("Fehler beim Laden der Statistiken: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 