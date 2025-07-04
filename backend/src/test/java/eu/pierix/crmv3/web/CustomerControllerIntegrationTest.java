package eu.pierix.crmv3.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import eu.pierix.crmv3.application.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import java.util.Map;
import java.util.Optional;
import java.util.Collections;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import eu.pierix.crmv3.web.dto.CustomerRequest;

@WebMvcTest(
    controllers = CustomerController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = eu.pierix.crmv3.application.JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CustomerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Mock-Benutzer für Tests erstellen
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            "testuser",
            null,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    void dummyTest() {
        // Beispiel-Test, bitte durch echte Tests ersetzen
    }

    @Test
    void testCreateCustomer() throws Exception {
        CustomerRequest request = CustomerRequest.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .build();

        Customer savedCustomer = Customer.builder()
                .id(1L)
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .build();

        when(customerService.createCustomer(any(Customer.class), anyLong())).thenReturn(savedCustomer);

        mockMvc.perform(post("/api/customers")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("Max"))
                .andExpect(jsonPath("$.lastName").value("Mustermann"))
                .andExpect(jsonPath("$.email").value("max@example.com"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetCustomer() throws Exception {
        Customer customer = Customer.builder()
                .id(1L)
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .status(CustomerStatus.ACTIVE)
                .build();

        when(customerService.findById(1L)).thenReturn(Optional.of(customer));

        mockMvc.perform(get("/api/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.firstName").value("Max"))
                .andExpect(jsonPath("$.lastName").value("Mustermann"))
                .andExpect(jsonPath("$.email").value("max@example.com"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void testGetCustomerStatistics() throws Exception {
        when(customerService.countAllCustomers()).thenReturn(3L);
        when(customerService.countCustomersByStatus(CustomerStatus.ACTIVE)).thenReturn(1L);
        when(customerService.countCustomersByStatus(CustomerStatus.INACTIVE)).thenReturn(1L);
        when(customerService.countCustomersByStatus(CustomerStatus.POTENTIAL)).thenReturn(1L);
        when(customerService.countCustomersByStatusGrouped()).thenReturn(
                Map.of(CustomerStatus.ACTIVE, 1L, CustomerStatus.INACTIVE, 1L, CustomerStatus.POTENTIAL, 1L)
        );
        when(customerService.countCustomersByCityGrouped()).thenReturn(Map.of("Berlin", 2L, "Hamburg", 1L));
        when(customerService.countCustomersBySourceGrouped()).thenReturn(Map.of("Website", 2L, "Empfehlung", 1L));

        mockMvc.perform(get("/api/customers/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCustomers").value(3))
                .andExpect(jsonPath("$.activeCustomers").value(1))
                .andExpect(jsonPath("$.inactiveCustomers").value(1))
                .andExpect(jsonPath("$.potentialCustomers").value(1))
                .andExpect(jsonPath("$.customersByCity.Berlin").value(2))
                .andExpect(jsonPath("$.customersBySource.Website").value(2));
    }
}