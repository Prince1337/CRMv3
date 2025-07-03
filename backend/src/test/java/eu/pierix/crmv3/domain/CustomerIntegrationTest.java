package eu.pierix.crmv3.domain;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration-Tests für die Customer-Domain-Klasse mit JPA
 */
@DataJpaTest
@ActiveProfiles("test")
class CustomerIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        // Test-User erstellen
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .firstName("Test")
                .lastName("User")
                .build();
        testUser = entityManager.persistAndFlush(testUser);

        // Test-Customer erstellen
        testCustomer = Customer.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .phone("+49 123 456789")
                .companyName("Test GmbH")
                .city("Berlin")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();
    }

    @Test
    void testCustomerPersistence() {
        // Given: Customer-Objekt
        
        // When: Customer wird persistiert
        Customer savedCustomer = customerRepository.save(testCustomer);
        entityManager.flush();
        entityManager.clear();

        // Then: Customer wird korrekt gespeichert und kann abgerufen werden
        assertNotNull(savedCustomer.getId());
        
        Customer foundCustomer = customerRepository.findById(savedCustomer.getId()).orElse(null);
        assertNotNull(foundCustomer);
        assertEquals("Max", foundCustomer.getFirstName());
        assertEquals("Mustermann", foundCustomer.getLastName());
        assertEquals("max@example.com", foundCustomer.getEmail());
        assertEquals(CustomerStatus.ACTIVE, foundCustomer.getStatus());
        assertNotNull(foundCustomer.getCreatedAt());
        assertNotNull(foundCustomer.getUpdatedAt());
    }

    @Test
    void testCustomerStatusFiltering() {
        // Given: Mehrere Kunden mit verschiedenen Status
        Customer activeCustomer = Customer.builder()
                .firstName("Active")
                .lastName("Customer")
                .email("active@example.com")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();

        Customer inactiveCustomer = Customer.builder()
                .firstName("Inactive")
                .lastName("Customer")
                .email("inactive@example.com")
                .status(CustomerStatus.INACTIVE)
                .createdBy(testUser)
                .build();

        Customer potentialCustomer = Customer.builder()
                .firstName("Potential")
                .lastName("Customer")
                .email("potential@example.com")
                .status(CustomerStatus.POTENTIAL)
                .createdBy(testUser)
                .build();

        customerRepository.saveAll(List.of(activeCustomer, inactiveCustomer, potentialCustomer));
        entityManager.flush();
        entityManager.clear();

        // When: Kunden nach Status gefiltert werden
        List<Customer> activeCustomers = customerRepository.findByStatus(CustomerStatus.ACTIVE);
        List<Customer> inactiveCustomers = customerRepository.findByStatus(CustomerStatus.INACTIVE);
        List<Customer> potentialCustomers = customerRepository.findByStatus(CustomerStatus.POTENTIAL);

        // Then: Korrekte Filterung erfolgt
        assertEquals(1, activeCustomers.size());
        assertEquals(1, inactiveCustomers.size());
        assertEquals(1, potentialCustomers.size());
        assertEquals("Active", activeCustomers.get(0).getFirstName());
        assertEquals("Inactive", inactiveCustomers.get(0).getFirstName());
        assertEquals("Potential", potentialCustomers.get(0).getFirstName());
    }

    @Test
    void testCustomerSearchByName() {
        // Given: Kunden mit verschiedenen Namen
        Customer customer1 = Customer.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();

        Customer customer2 = Customer.builder()
                .firstName("Maria")
                .lastName("Musterfrau")
                .email("maria@example.com")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();

        Customer customer3 = Customer.builder()
                .firstName("Peter")
                .lastName("Maxwell")
                .email("peter@example.com")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();

        customerRepository.saveAll(List.of(customer1, customer2, customer3));
        entityManager.flush();
        entityManager.clear();

        // When: Suche nach Namen
        List<Customer> maxResults = customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase("Max");
        List<Customer> mariaResults = customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase("Maria");

        // Then: Korrekte Suchergebnisse
        assertEquals(2, maxResults.size()); // Max Mustermann und Peter Maxwell
        assertEquals(1, mariaResults.size()); // Maria Musterfrau
    }
} 