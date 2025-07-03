package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service für Kundenverwaltung
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    // CRUD Operationen
    /**
     * Erstellt einen neuen Kunden
     */
    public Customer createCustomer(Customer customer, Long createdById) {
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + createdById));
        
        customer.setCreatedBy(createdBy);
        return customerRepository.save(customer);
    }

    /**
     * Findet einen Kunden anhand der ID
     */
    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    /**
     * Aktualisiert einen Kunden
     */
    public Customer updateCustomer(Customer customer) {
        if (customer.getId() == null) {
            throw new RuntimeException("Kunden-ID ist erforderlich für Updates");
        }
        return customerRepository.save(customer);
    }

    /**
     * Löscht einen Kunden
     */
    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }

    // Suchmethoden
    /**
     * Findet alle Kunden
     */
    public List<Customer> findAllCustomers() {
        return customerRepository.findAll();
    }

    /**
     * Findet Kunden mit Paginierung
     */
    public Page<Customer> findAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }

    /**
     * Findet Kunden anhand von Vor- oder Nachname
     */
    public List<Customer> findCustomersByName(String name) {
        return customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name);
    }

    /**
     * Findet Kunden anhand der Email
     */
    public List<Customer> findCustomersByEmail(String email) {
        return customerRepository.findByEmailContainingIgnoreCase(email);
    }

    /**
     * Findet Kunden anhand des Firmennamens
     */
    public List<Customer> findCustomersByCompany(String companyName) {
        return customerRepository.findByCompanyNameContainingIgnoreCase(companyName);
    }

    /**
     * Findet Kunden anhand der Stadt
     */
    public List<Customer> findCustomersByCity(String city) {
        return customerRepository.findByCityContainingIgnoreCase(city);
    }

    /**
     * Findet Kunden anhand des Status
     */
    public List<Customer> findCustomersByStatus(CustomerStatus status) {
        return customerRepository.findByStatus(status);
    }

    /**
     * Findet alle aktiven Kunden
     */
    public List<Customer> findActiveCustomers() {
        return customerRepository.findByStatus(CustomerStatus.ACTIVE);
    }

    /**
     * Findet alle inaktiven Kunden
     */
    public List<Customer> findInactiveCustomers() {
        return customerRepository.findByStatus(CustomerStatus.INACTIVE);
    }

    /**
     * Findet alle potenziellen Kunden
     */
    public List<Customer> findPotentialCustomers() {
        return customerRepository.findByStatus(CustomerStatus.POTENTIAL);
    }

    // Erweiterte Suchmethoden
    /**
     * Findet Kunden anhand mehrerer Kriterien
     */
    public Page<Customer> searchCustomers(String name, String email, String company, String city, CustomerStatus status, Pageable pageable) {
        return customerRepository.findBySearchCriteria(name, email, company, city, status, pageable);
    }

    /**
     * Findet Kunden anhand von Tags
     */
    public List<Customer> findCustomersByTag(String tag) {
        return customerRepository.findByTag(tag);
    }

    /**
     * Findet Kunden anhand der Quelle
     */
    public List<Customer> findCustomersBySource(String source) {
        return customerRepository.findBySource(source);
    }

    /**
     * Findet Kunden die seit einem bestimmten Datum nicht kontaktiert wurden
     */
    public List<Customer> findNotContactedCustomers(LocalDateTime since) {
        return customerRepository.findNotContactedSince(since);
    }

    /**
     * Findet Kunden die nach einem bestimmten Datum erstellt wurden
     */
    public List<Customer> findCustomersCreatedAfter(LocalDateTime date) {
        return customerRepository.findByCreatedAtAfter(date);
    }

    /**
     * Findet Kunden die nach einem bestimmten Datum zuletzt kontaktiert wurden
     */
    public List<Customer> findCustomersContactedAfter(LocalDateTime date) {
        return customerRepository.findByLastContactAfter(date);
    }

    // Zuweisungsmethoden
    /**
     * Findet alle Kunden die einem bestimmten Benutzer zugewiesen sind
     */
    public List<Customer> findCustomersByAssignedUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        return customerRepository.findByAssignedTo(user);
    }

    /**
     * Findet alle Kunden die von einem bestimmten Benutzer erstellt wurden
     */
    public List<Customer> findCustomersByCreatedUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        return customerRepository.findByCreatedBy(user);
    }

    /**
     * Weist einen Kunden einem Benutzer zu
     */
    public Customer assignCustomerToUser(Long customerId, Long userId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        
        customer.setAssignedTo(user);
        return customerRepository.save(customer);
    }

    // Status-Management
    /**
     * Ändert den Status eines Kunden
     */
    public Customer changeCustomerStatus(Long customerId, CustomerStatus status) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
        
        customer.setStatus(status);
        return customerRepository.save(customer);
    }

    /**
     * Markiert einen Kunden als kontaktiert
     */
    public Customer markCustomerAsContacted(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
        
        customer.setLastContact(LocalDateTime.now());
        return customerRepository.save(customer);
    }

    // Statistik-Methoden
    /**
     * Zählt alle Kunden
     */
    public long countAllCustomers() {
        return customerRepository.count();
    }

    /**
     * Zählt Kunden nach Status
     */
    public long countCustomersByStatus(CustomerStatus status) {
        return customerRepository.countByStatus(status);
    }

    /**
     * Zählt Kunden nach Status gruppiert
     */
    public Map<CustomerStatus, Long> countCustomersByStatusGrouped() {
        List<Object[]> results = customerRepository.countByStatusGrouped();
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (CustomerStatus) row[0],
                        row -> (Long) row[1]
                ));
    }

    /**
     * Zählt Kunden nach Stadt gruppiert
     */
    public Map<String, Long> countCustomersByCityGrouped() {
        List<Object[]> results = customerRepository.countByCityGrouped();
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    /**
     * Zählt Kunden nach Quelle gruppiert
     */
    public Map<String, Long> countCustomersBySourceGrouped() {
        List<Object[]> results = customerRepository.countBySourceGrouped();
        return results.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }

    // Utility-Methoden
    /**
     * Prüft ob ein Kunde existiert
     */
    public boolean customerExists(Long id) {
        return customerRepository.existsById(id);
    }

    /**
     * Prüft ob eine Email bereits existiert
     */
    public boolean emailExists(String email) {
        return !customerRepository.findByEmailContainingIgnoreCase(email).isEmpty();
    }
} 