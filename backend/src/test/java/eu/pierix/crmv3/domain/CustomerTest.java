package eu.pierix.crmv3.domain;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit-Tests für die Customer-Domain-Klasse
 */
class CustomerTest {

    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .firstName("Max")
                .lastName("Mustermann")
                .email("max.mustermann@example.com")
                .phone("+49 123 456789")
                .companyName("Test GmbH")
                .city("Berlin")
                .status(CustomerStatus.ACTIVE)
                .build();
    }

    @Test
    void testGetFullName() {
        // Given: Customer mit Vor- und Nachname
        
        // When: getFullName() wird aufgerufen
        String fullName = customer.getFullName();
        
        // Then: Vollständiger Name wird korrekt zurückgegeben
        assertEquals("Max Mustermann", fullName);
    }

    @Test
    void testGetFullAddress() {
        // Given: Customer mit Adressdaten
        customer.setStreet("Musterstraße");
        customer.setHouseNumber("123");
        customer.setPostalCode("10115");
        customer.setCountry("Deutschland");
        
        // When: getFullAddress() wird aufgerufen
        String fullAddress = customer.getFullAddress();
        
        // Then: Vollständige Adresse wird korrekt formatiert
        assertEquals("Musterstraße 123, 10115 Berlin, Deutschland", fullAddress);
    }

    @Test
    void testStatusMethods() {
        // Given: Customer mit verschiedenen Status
        
        // When & Then: Status-Methoden funktionieren korrekt
        assertTrue(customer.isActive());
        assertFalse(customer.isInactive());
        assertFalse(customer.isPotential());
        
        customer.setStatus(CustomerStatus.INACTIVE);
        assertFalse(customer.isActive());
        assertTrue(customer.isInactive());
        assertFalse(customer.isPotential());
        
        customer.setStatus(CustomerStatus.POTENTIAL);
        assertFalse(customer.isActive());
        assertFalse(customer.isInactive());
        assertTrue(customer.isPotential());
    }
} 