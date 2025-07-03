package eu.pierix.crmv3.web.dto;

import eu.pierix.crmv3.domain.CustomerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO für Kundenantworten
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long id;
    
    // Kontaktdaten
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String mobile;
    private String fullName;

    // Firmendaten
    private String companyName;
    private String position;
    private String department;
    private String street;
    private String houseNumber;
    private String postalCode;
    private String city;
    private String country;
    private String website;
    private String fullAddress;

    // Status und Kategorisierung
    private CustomerStatus status;
    private String statusDisplayName;
    private String source;
    private String tags;

    // Notizen
    private String notes;
    private String internalNotes;

    // Metadaten
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastContact;

    // Zugewiesene Benutzer
    private Long createdById;
    private String createdByFullName;
    private Long assignedToId;
    private String assignedToFullName;
} 