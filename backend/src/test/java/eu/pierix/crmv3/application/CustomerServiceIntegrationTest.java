package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration-Tests für den CustomerService
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CustomerServiceIntegrationTest {

    @Autowired
    private CustomerService customerService;

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
        testUser = userRepository.save(testUser);

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
    void testCreateAndFindCustomer() {
        // Given: Customer-Objekt
        
        // When: Customer wird über Service erstellt
        Customer createdCustomer = customerService.createCustomer(testCustomer, testUser.getId());
        
        // Then: Customer wird korrekt erstellt
        assertNotNull(createdCustomer.getId());
        assertEquals(testUser, createdCustomer.getCreatedBy());
        
        // When: Customer wird über Service gefunden
        Optional<Customer> foundCustomer = customerService.findById(createdCustomer.getId());
        
        // Then: Customer wird korrekt gefunden
        assertTrue(foundCustomer.isPresent());
        assertEquals("Max", foundCustomer.get().getFirstName());
        assertEquals("Mustermann", foundCustomer.get().getLastName());
        assertEquals("max@example.com", foundCustomer.get().getEmail());
    }

    @Test
    void testCustomerSearchAndFiltering() {
        // Given: Mehrere Kunden mit verschiedenen Eigenschaften
        Customer customer1 = Customer.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .companyName("Test GmbH")
                .city("Berlin")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();

        Customer customer2 = Customer.builder()
                .firstName("Maria")
                .lastName("Musterfrau")
                .email("maria@example.com")
                .companyName("Test GmbH")
                .city("Hamburg")
                .status(CustomerStatus.POTENTIAL)
                .createdBy(testUser)
                .build();

        Customer customer3 = Customer.builder()
                .firstName("Peter")
                .lastName("Maxwell")
                .email("peter@example.com")
                .companyName("Other GmbH")
                .city("München")
                .status(CustomerStatus.INACTIVE)
                .createdBy(testUser)
                .build();

        customerService.createCustomer(customer1, testUser.getId());
        customerService.createCustomer(customer2, testUser.getId());
        customerService.createCustomer(customer3, testUser.getId());

        // When: Erweiterte Suche wird durchgeführt
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<Customer> searchResults = customerService.searchCustomers(
                "Max", "max@example.com", "Test GmbH", "Berlin", CustomerStatus.ACTIVE, pageRequest
        );

        // Then: Korrekte Suchergebnisse
        assertEquals(1, searchResults.getTotalElements());
        assertEquals("Max", searchResults.getContent().get(0).getFirstName());
    }

    @Test
    void testCustomerStatistics() {
        // Given: Kunden mit verschiedenen Status und Städten
        Customer activeCustomer = Customer.builder()
                .firstName("Active")
                .lastName("Customer")
                .email("active@example.com")
                .city("Berlin")
                .status(CustomerStatus.ACTIVE)
                .source("Website")
                .createdBy(testUser)
                .build();

        Customer inactiveCustomer = Customer.builder()
                .firstName("Inactive")
                .lastName("Customer")
                .email("inactive@example.com")
                .city("Hamburg")
                .status(CustomerStatus.INACTIVE)
                .source("Website")
                .createdBy(testUser)
                .build();

        Customer potentialCustomer = Customer.builder()
                .firstName("Potential")
                .lastName("Customer")
                .email("potential@example.com")
                .city("Berlin")
                .status(CustomerStatus.POTENTIAL)
                .source("Empfehlung")
                .createdBy(testUser)
                .build();

        customerService.createCustomer(activeCustomer, testUser.getId());
        customerService.createCustomer(inactiveCustomer, testUser.getId());
        customerService.createCustomer(potentialCustomer, testUser.getId());

        // When: Statistiken werden abgerufen
        long totalCustomers = customerService.countAllCustomers();
        long activeCustomers = customerService.countCustomersByStatus(CustomerStatus.ACTIVE);
        long inactiveCustomers = customerService.countCustomersByStatus(CustomerStatus.INACTIVE);
        long potentialCustomers = customerService.countCustomersByStatus(CustomerStatus.POTENTIAL);
        
        Map<CustomerStatus, Long> customersByStatus = customerService.countCustomersByStatusGrouped();
        Map<String, Long> customersByCity = customerService.countCustomersByCityGrouped();
        Map<String, Long> customersBySource = customerService.countCustomersBySourceGrouped();

        // Then: Korrekte Statistiken
        assertEquals(3, totalCustomers);
        assertEquals(1, activeCustomers);
        assertEquals(1, inactiveCustomers);
        assertEquals(1, potentialCustomers);
        
        assertEquals(3, customersByStatus.size());
        assertEquals(2, customersByCity.size()); // Berlin (2), Hamburg (1)
        assertEquals(2, customersBySource.size()); // Website (2), Empfehlung (1)
    }
} 