package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST-Controller für Kundenverwaltung
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
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
        Long currentUserId = getCurrentUserId();
        
        Customer customer = mapToCustomer(request);
        Customer savedCustomer = customerService.createCustomer(customer, currentUserId);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToCustomerResponse(savedCustomer));
    }

    /**
     * Findet einen Kunden anhand der ID
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> getCustomer(@PathVariable Long id) {
        return customerService.findById(id)
                .map(customer -> ResponseEntity.ok(mapToCustomerResponse(customer)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Aktualisiert einen Kunden
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return customerService.findById(id)
                .map(existingCustomer -> {
                    Customer updatedCustomer = mapToCustomer(request);
                    updatedCustomer.setId(id);
                    Customer savedCustomer = customerService.updateCustomer(updatedCustomer);
                    return ResponseEntity.ok(mapToCustomerResponse(savedCustomer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Löscht einen Kunden
     * Erlaubt: Nur Administratoren (ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (!customerService.customerExists(id)) {
            return ResponseEntity.notFound().build();
        }
        
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
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
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Customer> customers = customerService.findAllCustomers(pageable);
        Page<CustomerResponse> response = customers.map(this::mapToCustomerResponse);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Erweiterte Kunden-Suche
     * Erlaubt: Authentifizierte Benutzer (USER, ADMIN)
     */
    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<Page<CustomerResponse>> searchCustomers(@RequestBody CustomerSearchRequest request) {
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
        return ResponseEntity.ok(response);
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
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            String username = authentication.getName();
            // Hier könnte man den UserService verwenden, um die User-ID zu finden
            // Für jetzt verwenden wir eine Standard-ID
            return 1L;
        }
        throw new RuntimeException("Kein authentifizierter Benutzer gefunden");
    }
} 