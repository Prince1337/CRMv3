package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import eu.pierix.crmv3.domain.Offer;
import eu.pierix.crmv3.infrastructure.OfferRepository;

/**
 * Service für Kundenverwaltung
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    // CRUD Operationen
    /**
     * Erstellt einen neuen Kunden
     */
    public Customer createCustomer(Customer customer, Long createdById) {
        try {
            log.info("Erstelle neuen Kunden: {} {} (Erstellt von User ID: {})", 
                    customer.getFirstName(), customer.getLastName(), createdById);
            
            if (customer == null) {
                throw new IllegalArgumentException("Kunden-Objekt darf nicht null sein");
            }
            
            if (createdById == null) {
                throw new IllegalArgumentException("Ersteller-ID darf nicht null sein");
            }
            
            User createdBy = userRepository.findById(createdById)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + createdById));
            
            customer.setCreatedBy(createdBy);
            Customer savedCustomer = customerRepository.save(customer);
            
            log.info("Kunde erfolgreich erstellt: {} {} (ID: {})", 
                    savedCustomer.getFirstName(), savedCustomer.getLastName(), savedCustomer.getId());
            
            return savedCustomer;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Erstellen des Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Erstellen des Kunden - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Erstellen des Kunden: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Erstellen des Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Erstellen des Kunden", e);
        }
    }

    /**
     * Findet einen Kunden anhand der ID
     */
    public Optional<Customer> findById(Long id) {
        try {
            if (id == null) {
                log.warn("Versuch Kunde mit null-ID zu finden");
                return Optional.empty();
            }
            
            log.debug("Suche Kunde mit ID: {}", id);
            Optional<Customer> customer = customerRepository.findById(id);
            
            if (customer.isPresent()) {
                log.debug("Kunde gefunden: {} {} (ID: {})", 
                        customer.get().getFirstName(), customer.get().getLastName(), id);
            } else {
                log.debug("Kunde mit ID {} nicht gefunden", id);
            }
            
            return customer;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen des Kunden mit ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen des Kunden", e);
        }
    }

    /**
     * Aktualisiert einen Kunden
     */
    public Customer updateCustomer(Customer customer) {
        try {
            if (customer == null) {
                throw new IllegalArgumentException("Kunden-Objekt darf nicht null sein");
            }
            
            if (customer.getId() == null) {
                throw new IllegalArgumentException("Kunden-ID ist erforderlich für Updates");
            }
            
            log.info("Aktualisiere Kunde: {} {} (ID: {})", 
                    customer.getFirstName(), customer.getLastName(), customer.getId());
            
            // Prüfe ob Kunde existiert
            if (!customerRepository.existsById(customer.getId())) {
                throw new RuntimeException("Kunde mit ID " + customer.getId() + " existiert nicht");
            }
            
            Customer updatedCustomer = customerRepository.save(customer);
            
            log.info("Kunde erfolgreich aktualisiert: {} {} (ID: {})", 
                    updatedCustomer.getFirstName(), updatedCustomer.getLastName(), updatedCustomer.getId());
            
            return updatedCustomer;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Aktualisieren des Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Aktualisieren des Kunden - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Aktualisieren des Kunden: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Aktualisieren des Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Aktualisieren des Kunden", e);
        }
    }

    /**
     * Löscht einen Kunden
     */
    public void deleteCustomer(Long id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("Kunden-ID darf nicht null sein");
            }
            
            log.info("Lösche Kunde mit ID: {}", id);
            
            Customer customer = customerRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + id));
            
            log.info("Lösche Kunde: {} {} (ID: {})", 
                    customer.getFirstName(), customer.getLastName(), id);
            
            // Zuerst alle zugehörigen Angebote löschen
            List<Offer> offers = offerRepository.findByCustomer(customer);
            log.info("Lösche {} zugehörige Angebote für Kunde ID: {}", offers.size(), id);
            
            for (Offer offer : offers) {
                try {
                    offerRepository.deleteById(offer.getId());
                    log.debug("Angebot mit ID {} gelöscht", offer.getId());
                } catch (Exception e) {
                    log.error("Fehler beim Löschen des Angebots mit ID {}: {}", offer.getId(), e.getMessage(), e);
                    throw new RuntimeException("Fehler beim Löschen der zugehörigen Angebote", e);
                }
            }
            
            // Dann den Kunden löschen
            customerRepository.deleteById(id);
            
            log.info("Kunde erfolgreich gelöscht: {} {} (ID: {})", 
                    customer.getFirstName(), customer.getLastName(), id);
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Löschen des Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Löschen des Kunden - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Löschen des Kunden: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Löschen des Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Löschen des Kunden", e);
        }
    }

    // Suchmethoden
    /**
     * Findet alle Kunden
     */
    public List<Customer> findAllCustomers() {
        try {
            log.debug("Lade alle Kunden");
            List<Customer> customers = customerRepository.findAll();
            log.debug("{} Kunden geladen", customers.size());
            return customers;
        } catch (Exception e) {
            log.error("Fehler beim Laden aller Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden aller Kunden", e);
        }
    }

    /**
     * Findet Kunden mit Paginierung
     */
    public Page<Customer> findAllCustomers(Pageable pageable) {
        try {
            if (pageable == null) {
                throw new IllegalArgumentException("Pageable-Objekt darf nicht null sein");
            }
            
            log.debug("Lade Kunden mit Paginierung: Seite {}, Größe {}", 
                    pageable.getPageNumber(), pageable.getPageSize());
            
            Page<Customer> customers = customerRepository.findAll(pageable);
            
            log.debug("{} Kunden geladen (Seite {} von {})", 
                    customers.getContent().size(), customers.getNumber(), customers.getTotalPages());
            
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Laden der Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Laden der Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Laden der Kunden", e);
        }
    }

    /**
     * Findet Kunden anhand von Vor- oder Nachname
     */
    public List<Customer> findCustomersByName(String name) {
        try {
            if (name == null || name.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerem Namen zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Namen: '{}'", name);
            List<Customer> customers = customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name);
            
            log.debug("{} Kunden mit Namen '{}' gefunden", customers.size(), name);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Namen '{}': {}", name, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Namen", e);
        }
    }

    /**
     * Findet Kunden anhand der Email
     */
    public List<Customer> findCustomersByEmail(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerer Email zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Email: '{}'", email);
            List<Customer> customers = customerRepository.findByEmailContainingIgnoreCase(email);
            
            log.debug("{} Kunden mit Email '{}' gefunden", customers.size(), email);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Email '{}': {}", email, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Email", e);
        }
    }

    /**
     * Findet Kunden anhand des Firmennamens
     */
    public List<Customer> findCustomersByCompany(String companyName) {
        try {
            if (companyName == null || companyName.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerem Firmennamen zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Firmenname: '{}'", companyName);
            List<Customer> customers = customerRepository.findByCompanyNameContainingIgnoreCase(companyName);
            
            log.debug("{} Kunden mit Firmenname '{}' gefunden", customers.size(), companyName);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Firmenname '{}': {}", companyName, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Firmenname", e);
        }
    }

    /**
     * Findet Kunden anhand der Stadt
     */
    public List<Customer> findCustomersByCity(String city) {
        try {
            if (city == null || city.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerer Stadt zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Stadt: '{}'", city);
            List<Customer> customers = customerRepository.findByCityContainingIgnoreCase(city);
            
            log.debug("{} Kunden mit Stadt '{}' gefunden", customers.size(), city);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Stadt '{}': {}", city, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Stadt", e);
        }
    }

    /**
     * Findet Kunden anhand des Status
     */
    public List<Customer> findCustomersByStatus(CustomerStatus status) {
        try {
            if (status == null) {
                throw new IllegalArgumentException("Status darf nicht null sein");
            }
            
            log.debug("Suche Kunden mit Status: {}", status);
            List<Customer> customers = customerRepository.findByStatus(status);
            
            log.debug("{} Kunden mit Status '{}' gefunden", customers.size(), status);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen von Kunden nach Status - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden nach Status '{}': {}", status, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Status", e);
        }
    }

    /**
     * Findet alle aktiven Kunden
     */
    public List<Customer> findActiveCustomers() {
        try {
            log.debug("Suche aktive Kunden");
            List<Customer> customers = customerRepository.findByStatus(CustomerStatus.ACTIVE);
            
            log.debug("{} aktive Kunden gefunden", customers.size());
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen aktiver Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen aktiver Kunden", e);
        }
    }

    /**
     * Findet alle inaktiven Kunden
     */
    public List<Customer> findInactiveCustomers() {
        try {
            log.debug("Suche inaktive Kunden");
            List<Customer> customers = customerRepository.findByStatus(CustomerStatus.INACTIVE);
            
            log.debug("{} inaktive Kunden gefunden", customers.size());
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen inaktiver Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen inaktiver Kunden", e);
        }
    }

    /**
     * Findet alle potenziellen Kunden
     */
    public List<Customer> findPotentialCustomers() {
        try {
            log.debug("Suche potenzielle Kunden");
            List<Customer> customers = customerRepository.findByStatus(CustomerStatus.POTENTIAL);
            
            log.debug("{} potenzielle Kunden gefunden", customers.size());
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen potenzieller Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen potenzieller Kunden", e);
        }
    }

    // Erweiterte Suchmethoden
    /**
     * Findet Kunden anhand mehrerer Kriterien
     */
    public Page<Customer> searchCustomers(String name, String email, String company, String city, CustomerStatus status, Pageable pageable) {
        try {
            if (pageable == null) {
                throw new IllegalArgumentException("Pageable-Objekt darf nicht null sein");
            }
            
            String statusString = status != null ? status.name() : null;
            
            log.debug("Erweiterte Kunden-Suche - Name: '{}', Email: '{}', Firma: '{}', Stadt: '{}', Status: '{}'", 
                    name, email, company, city, statusString);
            
            // Erstelle eine unsortierte Pageable für die native Query
            Pageable unsortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            Page<Customer> customers = customerRepository.findBySearchCriteria(name, email, company, city, statusString, unsortedPageable);
            
            log.debug("{} Kunden bei erweiterter Suche gefunden (Seite {} von {})", 
                    customers.getContent().size(), customers.getNumber(), customers.getTotalPages());
            
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler bei erweiterter Kunden-Suche - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler bei erweiterter Kunden-Suche: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler bei erweiterter Kunden-Suche", e);
        }
    }

    /**
     * Findet Kunden anhand von Tags
     */
    public List<Customer> findCustomersByTag(String tag) {
        try {
            if (tag == null || tag.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerem Tag zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Tag: '{}'", tag);
            List<Customer> customers = customerRepository.findByTag(tag);
            
            log.debug("{} Kunden mit Tag '{}' gefunden", customers.size(), tag);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Tag '{}': {}", tag, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Tag", e);
        }
    }

    /**
     * Findet Kunden anhand der Quelle
     */
    public List<Customer> findCustomersBySource(String source) {
        try {
            if (source == null || source.trim().isEmpty()) {
                log.warn("Versuch Kunden mit leerer Quelle zu suchen");
                return List.of();
            }
            
            log.debug("Suche Kunden mit Quelle: '{}'", source);
            List<Customer> customers = customerRepository.findBySource(source);
            
            log.debug("{} Kunden mit Quelle '{}' gefunden", customers.size(), source);
            return customers;
            
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden mit Quelle '{}': {}", source, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Quelle", e);
        }
    }

    /**
     * Findet Kunden die seit einem bestimmten Datum nicht kontaktiert wurden
     */
    public List<Customer> findNotContactedCustomers(LocalDateTime since) {
        try {
            if (since == null) {
                throw new IllegalArgumentException("Datum darf nicht null sein");
            }
            
            log.debug("Suche Kunden die seit {} nicht kontaktiert wurden", since);
            List<Customer> customers = customerRepository.findNotContactedSince(since);
            
            log.debug("{} Kunden seit {} nicht kontaktiert", customers.size(), since);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen nicht kontaktierter Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Suchen nicht kontaktierter Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen nicht kontaktierter Kunden", e);
        }
    }

    /**
     * Findet Kunden die nach einem bestimmten Datum erstellt wurden
     */
    public List<Customer> findCustomersCreatedAfter(LocalDateTime date) {
        try {
            if (date == null) {
                throw new IllegalArgumentException("Datum darf nicht null sein");
            }
            
            log.debug("Suche Kunden die nach {} erstellt wurden", date);
            List<Customer> customers = customerRepository.findByCreatedAtAfter(date);
            
            log.debug("{} Kunden nach {} erstellt", customers.size(), date);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen von Kunden nach Erstellungsdatum - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden nach Erstellungsdatum: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Erstellungsdatum", e);
        }
    }

    /**
     * Findet Kunden die nach einem bestimmten Datum zuletzt kontaktiert wurden
     */
    public List<Customer> findCustomersContactedAfter(LocalDateTime date) {
        try {
            if (date == null) {
                throw new IllegalArgumentException("Datum darf nicht null sein");
            }
            
            log.debug("Suche Kunden die nach {} kontaktiert wurden", date);
            List<Customer> customers = customerRepository.findByLastContactAfter(date);
            
            log.debug("{} Kunden nach {} kontaktiert", customers.size(), date);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen von Kunden nach Kontaktdatum - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Suchen von Kunden nach Kontaktdatum: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach Kontaktdatum", e);
        }
    }

    // Zuweisungsmethoden
    /**
     * Findet alle Kunden die einem bestimmten Benutzer zugewiesen sind
     */
    public List<Customer> findCustomersByAssignedUser(Long userId) {
        try {
            if (userId == null) {
                throw new IllegalArgumentException("Benutzer-ID darf nicht null sein");
            }
            
            log.debug("Suche Kunden die Benutzer ID {} zugewiesen sind", userId);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
            
            List<Customer> customers = customerRepository.findByAssignedTo(user);
            
            log.debug("{} Kunden Benutzer ID {} zugewiesen", customers.size(), userId);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen von Kunden nach zugewiesenem Benutzer - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Suchen von Kunden nach zugewiesenem Benutzer - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach zugewiesenem Benutzer: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Suchen von Kunden nach zugewiesenem Benutzer: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Suchen von Kunden nach zugewiesenem Benutzer", e);
        }
    }

    /**
     * Findet alle Kunden die von einem bestimmten Benutzer erstellt wurden
     */
    public List<Customer> findCustomersByCreatedUser(Long userId) {
        try {
            if (userId == null) {
                throw new IllegalArgumentException("Benutzer-ID darf nicht null sein");
            }
            
            log.debug("Suche Kunden die von Benutzer ID {} erstellt wurden", userId);
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
            
            List<Customer> customers = customerRepository.findByCreatedBy(user);
            
            log.debug("{} Kunden von Benutzer ID {} erstellt", customers.size(), userId);
            return customers;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Suchen von Kunden nach erstellem Benutzer - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Suchen von Kunden nach erstellem Benutzer - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Suchen von Kunden nach erstellem Benutzer: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Suchen von Kunden nach erstellem Benutzer: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Suchen von Kunden nach erstellem Benutzer", e);
        }
    }

    /**
     * Weist einen Kunden einem Benutzer zu
     */
    public Customer assignCustomerToUser(Long customerId, Long userId) {
        try {
            if (customerId == null) {
                throw new IllegalArgumentException("Kunden-ID darf nicht null sein");
            }
            
            if (userId == null) {
                throw new IllegalArgumentException("Benutzer-ID darf nicht null sein");
            }
            
            log.info("Weise Kunde ID {} Benutzer ID {} zu", customerId, userId);
            
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
            
            customer.setAssignedTo(user);
            Customer updatedCustomer = customerRepository.save(customer);
            
            log.info("Kunde {} {} erfolgreich Benutzer {} {} zugewiesen", 
                    updatedCustomer.getFirstName(), updatedCustomer.getLastName(),
                    user.getFirstName(), user.getLastName());
            
            return updatedCustomer;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Zuweisen des Kunden - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Zuweisen des Kunden - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zuweisen des Kunden: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Zuweisen des Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Zuweisen des Kunden", e);
        }
    }

    // Status-Management
    /**
     * Ändert den Status eines Kunden
     */
    public Customer changeCustomerStatus(Long customerId, CustomerStatus status) {
        try {
            if (customerId == null) {
                throw new IllegalArgumentException("Kunden-ID darf nicht null sein");
            }
            
            if (status == null) {
                throw new IllegalArgumentException("Status darf nicht null sein");
            }
            
            log.info("Ändere Status von Kunde ID {} zu {}", customerId, status);
            
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
            
            CustomerStatus oldStatus = customer.getStatus();
            customer.setStatus(status);
            Customer updatedCustomer = customerRepository.save(customer);
            
            log.info("Status von Kunde {} {} erfolgreich von {} zu {} geändert", 
                    updatedCustomer.getFirstName(), updatedCustomer.getLastName(), oldStatus, status);
            
            return updatedCustomer;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Ändern des Kundenstatus - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Ändern des Kundenstatus - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Ändern des Kundenstatus: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Ändern des Kundenstatus: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Ändern des Kundenstatus", e);
        }
    }

    /**
     * Markiert einen Kunden als kontaktiert
     */
    public Customer markCustomerAsContacted(Long customerId) {
        try {
            if (customerId == null) {
                throw new IllegalArgumentException("Kunden-ID darf nicht null sein");
            }
            
            log.info("Markiere Kunde ID {} als kontaktiert", customerId);
            
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + customerId));
            
            customer.setStatus(CustomerStatus.CONTACTED);
            customer.setLastContact(LocalDateTime.now());
            Customer updatedCustomer = customerRepository.save(customer);
            
            log.info("Kunde {} {} erfolgreich als kontaktiert markiert", 
                    updatedCustomer.getFirstName(), updatedCustomer.getLastName());
            
            return updatedCustomer;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Markieren des Kunden als kontaktiert - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (RuntimeException e) {
            log.error("Fehler beim Markieren des Kunden als kontaktiert - Runtime-Fehler: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Markieren des Kunden als kontaktiert: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unerwarteter Fehler beim Markieren des Kunden als kontaktiert: {}", e.getMessage(), e);
            throw new RuntimeException("Unerwarteter Fehler beim Markieren des Kunden als kontaktiert", e);
        }
    }

    // Statistik-Methoden
    /**
     * Zählt alle Kunden
     */
    public long countAllCustomers() {
        try {
            long count = customerRepository.count();
            log.debug("Gesamtanzahl Kunden: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Fehler beim Zählen aller Kunden: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zählen aller Kunden", e);
        }
    }

    /**
     * Zählt Kunden nach Status
     */
    public long countCustomersByStatus(CustomerStatus status) {
        try {
            if (status == null) {
                throw new IllegalArgumentException("Status darf nicht null sein");
            }
            
            long count = customerRepository.countByStatus(status);
            log.debug("Anzahl Kunden mit Status {}: {}", status, count);
            return count;
            
        } catch (IllegalArgumentException e) {
            log.error("Fehler beim Zählen von Kunden nach Status - Validierungsfehler: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Fehler beim Zählen von Kunden nach Status '{}': {}", status, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zählen von Kunden nach Status", e);
        }
    }

    /**
     * Zählt Kunden nach Status gruppiert
     */
    public Map<CustomerStatus, Long> countCustomersByStatusGrouped() {
        try {
            log.debug("Zähle Kunden nach Status gruppiert");
            List<Object[]> results = customerRepository.countByStatusGrouped();
            
            Map<CustomerStatus, Long> groupedCounts = results.stream()
                    .collect(Collectors.toMap(
                            row -> (CustomerStatus) row[0],
                            row -> (Long) row[1]
                    ));
            
            log.debug("Kunden nach Status gruppiert: {}", groupedCounts);
            return groupedCounts;
            
        } catch (Exception e) {
            log.error("Fehler beim Zählen von Kunden nach Status gruppiert: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zählen von Kunden nach Status gruppiert", e);
        }
    }

    /**
     * Zählt Kunden nach Stadt gruppiert
     */
    public Map<String, Long> countCustomersByCityGrouped() {
        try {
            log.debug("Zähle Kunden nach Stadt gruppiert");
            List<Object[]> results = customerRepository.countByCityGrouped();
            
            Map<String, Long> groupedCounts = results.stream()
                    .collect(Collectors.toMap(
                            row -> (String) row[0],
                            row -> (Long) row[1]
                    ));
            
            log.debug("Kunden nach Stadt gruppiert: {}", groupedCounts);
            return groupedCounts;
            
        } catch (Exception e) {
            log.error("Fehler beim Zählen von Kunden nach Stadt gruppiert: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zählen von Kunden nach Stadt gruppiert", e);
        }
    }

    /**
     * Zählt Kunden nach Quelle gruppiert
     */
    public Map<String, Long> countCustomersBySourceGrouped() {
        try {
            log.debug("Zähle Kunden nach Quelle gruppiert");
            List<Object[]> results = customerRepository.countBySourceGrouped();
            
            Map<String, Long> groupedCounts = results.stream()
                    .collect(Collectors.toMap(
                            row -> (String) row[0],
                            row -> (Long) row[1]
                    ));
            
            log.debug("Kunden nach Quelle gruppiert: {}", groupedCounts);
            return groupedCounts;
            
        } catch (Exception e) {
            log.error("Fehler beim Zählen von Kunden nach Quelle gruppiert: {}", e.getMessage(), e);
            throw new RuntimeException("Fehler beim Zählen von Kunden nach Quelle gruppiert", e);
        }
    }

    // Utility-Methoden
    /**
     * Prüft ob ein Kunde existiert
     */
    public boolean customerExists(Long id) {
        try {
            if (id == null) {
                log.warn("Versuch Existenz von Kunde mit null-ID zu prüfen");
                return false;
            }
            
            boolean exists = customerRepository.existsById(id);
            log.debug("Kunde mit ID {} existiert: {}", id, exists);
            return exists;
            
        } catch (Exception e) {
            log.error("Fehler beim Prüfen der Kunden-Existenz für ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Prüfen der Kunden-Existenz", e);
        }
    }

    /**
     * Prüft ob eine Email bereits existiert
     */
    public boolean emailExists(String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                log.warn("Versuch Existenz von Email mit leerem Wert zu prüfen");
                return false;
            }
            
            boolean exists = !customerRepository.findByEmailContainingIgnoreCase(email).isEmpty();
            log.debug("Email '{}' existiert bereits: {}", email, exists);
            return exists;
            
        } catch (Exception e) {
            log.error("Fehler beim Prüfen der Email-Existenz für '{}': {}", email, e.getMessage(), e);
            throw new RuntimeException("Fehler beim Prüfen der Email-Existenz", e);
        }
    }
} 