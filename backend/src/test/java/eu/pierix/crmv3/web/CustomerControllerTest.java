package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.web.dto.CustomerRequest;
import eu.pierix.crmv3.web.dto.CustomerResponse;
import eu.pierix.crmv3.web.dto.CustomerSearchRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit-Tests für den CustomerController
 */
@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    @Mock
    private CustomerService customerService;

    @InjectMocks
    private CustomerController customerController;

    private Customer testCustomer;
    private CustomerRequest testCustomerRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
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

        testCustomerRequest = CustomerRequest.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .build();
    }

    @Test
    void testCreateCustomer() {
        // Given: Valid customer request
        when(customerService.createCustomer(any(Customer.class), anyLong())).thenReturn(testCustomer);

        // When: Customer wird erstellt
        ResponseEntity<CustomerResponse> response = customerController.createCustomer(testCustomerRequest);

        // Then: Response ist korrekt
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Max Mustermann", response.getBody().getFullName());
        verify(customerService).createCustomer(any(Customer.class), anyLong());
    }

    @Test
    void testGetCustomer() {
        // Given: Customer existiert
        when(customerService.findById(1L)).thenReturn(Optional.of(testCustomer));

        // When: Customer wird abgerufen
        ResponseEntity<CustomerResponse> response = customerController.getCustomer(1L);

        // Then: Customer wird korrekt zurückgegeben
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        verify(customerService).findById(1L);
    }

    @Test
    void testGetCustomerNotFound() {
        // Given: Customer existiert nicht
        when(customerService.findById(999L)).thenReturn(Optional.empty());

        // When: Nicht existierender Customer wird abgerufen
        ResponseEntity<CustomerResponse> response = customerController.getCustomer(999L);

        // Then: 404 Not Found wird zurückgegeben
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(customerService).findById(999L);
    }
} 