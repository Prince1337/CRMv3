package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST-Controller für Kundenverwaltung
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CustomerController {

    private final CustomerService customerService;

    // CRUD Operationen
    /**
     * Erstellt einen neuen Kunden
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        try {
            log.info("Erstelle neuen Kunden: {} {}", request.getFirstName(), request.getLastName());
            
            if (request == null) {
                log.error("CustomerRequest ist null");
                return ResponseEntity.badRequest().build();
            }
            
            Long currentUserId = getCurrentUserId();
            log.debug("Aktueller Benutzer ID: {}", currentUserId);
            
            Customer customer = mapToCustomer(request);
            Customer savedCustomer = customerService.createCustomer(customer, currentUserId);
            
            CustomerResponse response = mapToCustomerResponse(savedCustomer);
            log.info("Kunde erfolgreich erstellt: {} {} (ID: {})", 
                    savedCustomer.getFirstName(), savedCustomer.getLastName(), savedCustomer.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validierungsfehler beim Erstellen des Kunden: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Runtime-Fehler beim Erstellen des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Erstellen des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Findet einen Kunden anhand der ID
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long id) {
        try {
            log.debug("Suche Kunde mit ID: {}", id);
            
            if (id == null) {
                log.warn("Versuch Kunde mit null-ID zu finden");
                return ResponseEntity.badRequest().build();
            }
            
            Optional<Customer> customerOpt = customerService.findById(id);
            
            if (customerOpt.isPresent()) {
                Customer customer = customerOpt.get();
                CustomerResponse response = mapToCustomerResponse(customer);
                log.debug("Kunde gefunden: {} {} (ID: {})", 
                        customer.getFirstName(), customer.getLastName(), id);
                return ResponseEntity.ok(response);
            } else {
                log.debug("Kunde mit ID {} nicht gefunden", id);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen des Kunden mit ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Aktualisiert einen Kunden
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        try {
            log.info("Aktualisiere Kunde mit ID: {}", id);
            
            if (id == null) {
                log.error("Kunden-ID ist null");
                return ResponseEntity.badRequest().build();
            }
            
            if (request == null) {
                log.error("CustomerRequest ist null");
                return ResponseEntity.badRequest().build();
            }
            
            Optional<Customer> existingCustomerOpt = customerService.findById(id);
            
            if (existingCustomerOpt.isPresent()) {
                Customer existingCustomer = existingCustomerOpt.get();
                log.debug("Bestehender Kunde gefunden: {} {} (ID: {})", 
                        existingCustomer.getFirstName(), existingCustomer.getLastName(), id);
                
                Customer updatedCustomer = mapToCustomer(request);
                updatedCustomer.setId(id);
                
                // Behalte das lastContact-Feld bei, wenn es nicht explizit gesetzt wird
                if (request.getLastContact() == null) {
                    updatedCustomer.setLastContact(existingCustomer.getLastContact());
                }
                
                Customer savedCustomer = customerService.updateCustomer(updatedCustomer);
                CustomerResponse response = mapToCustomerResponse(savedCustomer);
                
                log.info("Kunde erfolgreich aktualisiert: {} {} (ID: {})", 
                        savedCustomer.getFirstName(), savedCustomer.getLastName(), id);
                
                return ResponseEntity.ok(response);
            } else {
                log.warn("Kunde mit ID {} nicht gefunden für Update", id);
                return ResponseEntity.notFound().build();
            }
            
        } catch (IllegalArgumentException e) {
            log.error("Validierungsfehler beim Aktualisieren des Kunden: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Runtime-Fehler beim Aktualisieren des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Aktualisieren des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Löscht einen Kunden
     * Erlaubt: Nur Administratoren (ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        try {
            log.info("Lösche Kunde mit ID: {}", id);
            
            if (id == null) {
                log.error("Kunden-ID ist null");
                return ResponseEntity.badRequest().build();
            }
            
            if (!customerService.customerExists(id)) {
                log.warn("Kunde mit ID {} existiert nicht für Löschung", id);
                return ResponseEntity.notFound().build();
            }
            
            customerService.deleteCustomer(id);
            log.info("Kunde mit ID {} erfolgreich gelöscht", id);
            
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            log.error("Validierungsfehler beim Löschen des Kunden: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Runtime-Fehler beim Löschen des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Löschen des Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Suchmethoden
    /**
     * Findet alle Kunden mit Paginierung
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        
        try {
            log.debug("Lade alle Kunden - Seite: {}, Größe: {}, Sortierung: {} {}", 
                    page, size, sortBy, sortDirection);
            
            Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Customer> customers = customerService.findAllCustomers(pageable);
            Page<CustomerResponse> response = customers.map(this::mapToCustomerResponse);
            
            log.debug("{} Kunden geladen (Seite {} von {})", 
                    customers.getContent().size(), customers.getNumber(), customers.getTotalPages());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validierungsfehler beim Laden der Kunden: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Fehler beim Laden der Kunden: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Erweiterte Kunden-Suche
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<CustomerResponse>> searchCustomers(@RequestBody CustomerSearchRequest request) {
        try {
            if (request == null) {
                log.error("CustomerSearchRequest ist null");
                return ResponseEntity.badRequest().build();
            }
            
            log.debug("Erweiterte Kunden-Suche - Name: '{}', Email: '{}', Firma: '{}', Stadt: '{}', Status: '{}'", 
                    request.getName(), request.getEmail(), request.getCompany(), request.getCity(), request.getStatus());
            
            Sort sort = Sort.by(Sort.Direction.fromString(request.getSortDirection()), request.getSortBy());
            Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
            
            Page<Customer> customers = customerService.searchCustomers(
                    request.getName(),
                    request.getEmail(),
                    request.getCompany(),
                    request.getCity(),
                    request.getStatus(),
                    pageable
            );
            
            Page<CustomerResponse> response = customers.map(this::mapToCustomerResponse);
            
            log.debug("{} Kunden bei erweiterter Suche gefunden (Seite {} von {})", 
                    customers.getContent().size(), customers.getNumber(), customers.getTotalPages());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validierungsfehler bei erweiterter Kunden-Suche: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Fehler bei erweiterter Kunden-Suche: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Findet Kunden anhand des Namens
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<CustomerResponse>> searchCustomersByName(@RequestParam String name) {
        List<Customer> customers = customerService.findCustomersByName(name);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet Kunden anhand der Email
     */
    @GetMapping("/search/email")
    public ResponseEntity<List<CustomerResponse>> searchCustomersByEmail(@RequestParam String email) {
        List<Customer> customers = customerService.findCustomersByEmail(email);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet Kunden anhand des Firmennamens
     */
    @GetMapping("/search/company")
    public ResponseEntity<List<CustomerResponse>> searchCustomersByCompany(@RequestParam String company) {
        List<Customer> customers = customerService.findCustomersByCompany(company);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet Kunden anhand der Stadt
     */
    @GetMapping("/search/city")
    public ResponseEntity<List<CustomerResponse>> searchCustomersByCity(@RequestParam String city) {
        List<Customer> customers = customerService.findCustomersByCity(city);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Status-basierte Methoden
    /**
     * Findet alle Kunden mit einem bestimmten Status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CustomerResponse>> getCustomersByStatus(@PathVariable CustomerStatus status) {
        List<Customer> customers = customerService.findCustomersByStatus(status);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet alle aktiven Kunden
     */
    @GetMapping("/active")
    public ResponseEntity<List<CustomerResponse>> getActiveCustomers() {
        List<Customer> customers = customerService.findActiveCustomers();
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet alle inaktiven Kunden
     */
    @GetMapping("/inactive")
    public ResponseEntity<List<CustomerResponse>> getInactiveCustomers() {
        List<Customer> customers = customerService.findInactiveCustomers();
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Findet alle potenziellen Kunden
     */
    @GetMapping("/potential")
    public ResponseEntity<List<CustomerResponse>> getPotentialCustomers() {
        List<Customer> customers = customerService.findPotentialCustomers();
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Vertriebs-Pipeline Endpunkte
    /**
     * Findet alle Kunden in der Vertriebs-Pipeline
     */
    @GetMapping("/pipeline")
    public ResponseEntity<Map<String, List<CustomerResponse>>> getPipelineCustomers() {
        Map<String, List<CustomerResponse>> pipeline = new HashMap<>();
        
        // Alle Pipeline-Status durchgehen
        for (CustomerStatus status : CustomerStatus.values()) {
            if (status.isPipelineStatus()) {
                List<Customer> customers = customerService.findCustomersByStatus(status);
                List<CustomerResponse> response = customers.stream()
                        .map(this::mapToCustomerResponse)
                        .collect(Collectors.toList());
                pipeline.put(status.name(), response);
            }
        }
        
        return ResponseEntity.ok(pipeline);
    }

    /**
     * Findet Kunden mit einem bestimmten Pipeline-Status
     */
    @GetMapping("/pipeline/{status}")
    public ResponseEntity<List<CustomerResponse>> getPipelineCustomersByStatus(@PathVariable CustomerStatus status) {
        if (!status.isPipelineStatus()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<Customer> customers = customerService.findCustomersByStatus(status);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Ändert den Status eines Kunden in der Pipeline
     */
    @PatchMapping("/{id}/pipeline-status")
    public ResponseEntity<CustomerResponse> changePipelineStatus(
            @PathVariable Long id,
            @RequestParam CustomerStatus newStatus) {
        
        if (!newStatus.isPipelineStatus()) {
            return ResponseEntity.badRequest().build();
        }
        
        Customer customer = customerService.changeCustomerStatus(id, newStatus);
        CustomerResponse response = mapToCustomerResponse(customer);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Bewegt einen Kunden zum nächsten Status in der Pipeline
     */
    @PatchMapping("/{id}/next-pipeline-step")
    public ResponseEntity<CustomerResponse> moveToNextPipelineStep(@PathVariable Long id) {
        Optional<Customer> customerOpt = customerService.findById(id);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Customer customer = customerOpt.get();
        CustomerStatus currentStatus = customer.getStatus();
        CustomerStatus[] nextStatuses = currentStatus.getNextPossibleStatuses();
        
        if (nextStatuses.length == 0) {
            return ResponseEntity.badRequest().build();
        }
        
        // Standardmäßig zum ersten nächsten Status wechseln
        CustomerStatus nextStatus = nextStatuses[0];
        Customer updatedCustomer = customerService.changeCustomerStatus(id, nextStatus);
        CustomerResponse response = mapToCustomerResponse(updatedCustomer);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Gibt Pipeline-Statistiken zurück
     */
    @GetMapping("/pipeline/statistics")
    public ResponseEntity<Map<String, Object>> getPipelineStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Anzahl pro Pipeline-Status
        Map<String, Long> customersByPipelineStatus = new HashMap<>();
        for (CustomerStatus status : CustomerStatus.values()) {
            if (status.isPipelineStatus()) {
                long count = customerService.countCustomersByStatus(status);
                customersByPipelineStatus.put(status.getDisplayName(), count);
            }
        }
        statistics.put("customersByPipelineStatus", customersByPipelineStatus);
        
        // Gesamtanzahl in Pipeline
        long totalInPipeline = customersByPipelineStatus.values().stream().mapToLong(Long::longValue).sum();
        statistics.put("totalInPipeline", totalInPipeline);
        
        // Conversion-Rate (Gewonnen / Gesamt)
        long wonCount = customerService.countCustomersByStatus(CustomerStatus.WON);
        long lostCount = customerService.countCustomersByStatus(CustomerStatus.LOST);
        long totalClosed = wonCount + lostCount;
        
        if (totalClosed > 0) {
            double conversionRate = (double) wonCount / totalClosed * 100;
            statistics.put("conversionRate", Math.round(conversionRate * 100.0) / 100.0);
        } else {
            statistics.put("conversionRate", 0.0);
        }
        
        statistics.put("wonCount", wonCount);
        statistics.put("lostCount", lostCount);
        
        return ResponseEntity.ok(statistics);
    }

    // Status-Management
    /**
     * Ändert den Status eines Kunden
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> changeCustomerStatus(
            @PathVariable Long id,
            @RequestParam CustomerStatus status) {
        
        Customer customer = customerService.changeCustomerStatus(id, status);
        return ResponseEntity.ok(mapToCustomerResponse(customer));
    }

    /**
     * Markiert einen Kunden als kontaktiert
     */
    @PatchMapping("/{id}/contact")
    public ResponseEntity<CustomerResponse> markCustomerAsContacted(@PathVariable Long id) {
        Customer customer = customerService.markCustomerAsContacted(id);
        return ResponseEntity.ok(mapToCustomerResponse(customer));
    }

    // Zuweisungsmethoden
    /**
     * Weist einen Kunden einem Benutzer zu
     * Erlaubt: Nur Administratoren (ADMIN)
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerResponse> assignCustomerToUser(
            @PathVariable Long id,
            @RequestParam Long userId) {
        
        Customer customer = customerService.assignCustomerToUser(id, userId);
        return ResponseEntity.ok(mapToCustomerResponse(customer));
    }

    /**
     * Findet alle Kunden die einem bestimmten Benutzer zugewiesen sind
     */
    @GetMapping("/assigned/{userId}")
    public ResponseEntity<List<CustomerResponse>> getCustomersByAssignedUser(@PathVariable Long userId) {
        List<Customer> customers = customerService.findCustomersByAssignedUser(userId);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToCustomerResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    // Statistiken
    /**
     * Liefert Kundenstatistiken
     * Erlaubt: Nur Administratoren (ADMIN)
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerStatisticsResponse> getCustomerStatistics() {
        long totalCustomers = customerService.countAllCustomers();
        long activeCustomers = customerService.countCustomersByStatus(CustomerStatus.ACTIVE);
        long inactiveCustomers = customerService.countCustomersByStatus(CustomerStatus.INACTIVE);
        long potentialCustomers = customerService.countCustomersByStatus(CustomerStatus.POTENTIAL);
        
        // Pipeline-spezifische Statistiken
        long wonCustomers = customerService.countCustomersByStatus(CustomerStatus.WON);
        long lostCustomers = customerService.countCustomersByStatus(CustomerStatus.LOST);
        long customersInPipeline = customerService.countCustomersByStatus(CustomerStatus.NEW) +
                                 customerService.countCustomersByStatus(CustomerStatus.CONTACTED) +
                                 customerService.countCustomersByStatus(CustomerStatus.OFFER_CREATED);
        
        Map<String, Long> customersByStatus = customerService.countCustomersByStatusGrouped()
                .entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> entry.getKey().getDisplayName(),
                        Map.Entry::getValue
                ));
        
        Map<String, Long> customersByCity = customerService.countCustomersByCityGrouped();
        Map<String, Long> customersBySource = customerService.countCustomersBySourceGrouped();
        
        CustomerStatisticsResponse statistics = CustomerStatisticsResponse.builder()
                .totalCustomers(totalCustomers)
                .customersByStatus(customersByStatus)
                .customersByCity(customersByCity)
                .customersBySource(customersBySource)
                .activeCustomers(activeCustomers)
                .inactiveCustomers(inactiveCustomers)
                .potentialCustomers(potentialCustomers)
                .wonCustomers(wonCustomers)
                .lostCustomers(lostCustomers)
                .customersInPipeline(customersInPipeline)
                .build();
        
        return ResponseEntity.ok(statistics);
    }

    // Utility-Methoden
    /**
     * Prüft ob eine Email bereits existiert
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = customerService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    // Mapping-Methoden
    private Customer mapToCustomer(CustomerRequest request) {
        return Customer.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .companyName(request.getCompanyName())
                .position(request.getPosition())
                .department(request.getDepartment())
                .street(request.getStreet())
                .houseNumber(request.getHouseNumber())
                .postalCode(request.getPostalCode())
                .city(request.getCity())
                .country(request.getCountry())
                .website(request.getWebsite())
                .status(request.getStatus() != null ? request.getStatus() : CustomerStatus.POTENTIAL)
                .source(request.getSource())
                .tags(request.getTags())
                .notes(request.getNotes())
                .internalNotes(request.getInternalNotes())
                .lastContact(request.getLastContact())
                .build();
    }

    private CustomerResponse mapToCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .mobile(customer.getMobile())
                .fullName(customer.getFullName())
                .companyName(customer.getCompanyName())
                .position(customer.getPosition())
                .department(customer.getDepartment())
                .street(customer.getStreet())
                .houseNumber(customer.getHouseNumber())
                .postalCode(customer.getPostalCode())
                .city(customer.getCity())
                .country(customer.getCountry())
                .website(customer.getWebsite())
                .fullAddress(customer.getFullAddress())
                .status(customer.getStatus())
                .statusDisplayName(customer.getStatus().getDisplayName())
                .source(customer.getSource())
                .tags(customer.getTags())
                .notes(customer.getNotes())
                .internalNotes(customer.getInternalNotes())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .lastContact(customer.getLastContact())
                .createdById(customer.getCreatedBy() != null ? customer.getCreatedBy().getId() : null)
                .createdByFullName(customer.getCreatedBy() != null ? customer.getCreatedBy().getFullName() : null)
                .assignedToId(customer.getAssignedTo() != null ? customer.getAssignedTo().getId() : null)
                .assignedToFullName(customer.getAssignedTo() != null ? customer.getAssignedTo().getFullName() : null)
                .build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            // Hier könnte man den UserService verwenden, um die User-ID zu finden
            // Für jetzt verwenden wir eine Standard-ID basierend auf dem Benutzernamen
            if ("testuser".equals(username)) {
                return 1L; // Test-Benutzer ID
            }
            return 1L; // Standard-ID für andere Benutzer
        }
        throw new RuntimeException("Kein authentifizierter Benutzer gefunden");
    }
}