package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit-Tests für den CustomerService
 */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer testCustomer;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .build();

        testCustomer = Customer.builder()
                .id(1L)
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .createdBy(testUser)
                .build();
    }

    @Test
    void testCreateCustomer() {
        // Given: Valid customer data und user
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When: Customer wird erstellt
        Customer createdCustomer = customerService.createCustomer(testCustomer, 1L);

        // Then: Customer wird korrekt erstellt und gespeichert
        assertNotNull(createdCustomer);
        assertEquals(testUser, createdCustomer.getCreatedBy());
        verify(customerRepository).save(any(Customer.class));
        verify(userRepository).findById(1L);
    }

    @Test
    void testFindCustomersByStatus() {
        // Given: Liste von Kunden mit bestimmtem Status
        List<Customer> customers = Arrays.asList(testCustomer);
        when(customerRepository.findByStatus(CustomerStatus.ACTIVE)).thenReturn(customers);

        // When: Kunden nach Status gesucht
        List<Customer> foundCustomers = customerService.findCustomersByStatus(CustomerStatus.ACTIVE);

        // Then: Korrekte Kunden werden zurückgegeben
        assertNotNull(foundCustomers);
        assertEquals(1, foundCustomers.size());
        assertEquals(testCustomer, foundCustomers.get(0));
        verify(customerRepository).findByStatus(CustomerStatus.ACTIVE);
    }

    @Test
    void testChangeCustomerStatus() {
        // Given: Existierender Customer
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When: Status geändert
        Customer updatedCustomer = customerService.changeCustomerStatus(1L, CustomerStatus.INACTIVE);

        // Then: Status wird korrekt geändert
        assertNotNull(updatedCustomer);
        verify(customerRepository).findById(1L);
        verify(customerRepository).save(any(Customer.class));
    }
} 