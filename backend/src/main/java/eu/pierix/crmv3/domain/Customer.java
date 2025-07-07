package eu.pierix.crmv3.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer-Entity für die Kundenverwaltung
 */
@Entity
@Table(name = "customers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kontaktdaten
    @NotBlank(message = "Vorname ist erforderlich")
    @Size(max = 100, message = "Vorname darf maximal 100 Zeichen lang sein")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Nachname ist erforderlich")
    @Size(max = 100, message = "Nachname darf maximal 100 Zeichen lang sein")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email(message = "Email muss ein gültiges Format haben")
    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "mobile")
    private String mobile;

    // Firmendaten
    @Column(name = "company_name")
    private String companyName;

    @Column(name = "position")
    private String position;

    @Column(name = "department")
    private String department;

    @Column(name = "street")
    private String street;

    @Column(name = "house_number")
    private String houseNumber;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country;

    @Column(name = "website")
    private String website;

    // Status und Kategorisierung
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CustomerStatus status = CustomerStatus.NEW; // Standard: NEW für Pipeline

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CustomerPriority priority = CustomerPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LeadSource leadSource = LeadSource.WEBSITE;

    @Column(name = "estimated_value")
    private Double estimatedValue;

    @Column(name = "probability")
    @Builder.Default
    private Integer probability = 25; // Standard-Wahrscheinlichkeit für NEW

    @Column(name = "expected_close_date")
    private LocalDateTime expectedCloseDate;

    @Column(name = "pipeline_entry_date")
    private LocalDateTime pipelineEntryDate;

    @Column(name = "source")
    private String source; // Woher kommt der Kunde (Website, Empfehlung, etc.)

    @Column(name = "tags")
    private String tags; // Komma-getrennte Tags für Kategorisierung

    // Notizen und zusätzliche Informationen
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // Metadaten
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_contact")
    private LocalDateTime lastContact;

    // Beziehung zum erstellen User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    // JPA Lifecycle Callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Wenn Status NEW ist, setze Pipeline-Eintrittsdatum
        if (status == CustomerStatus.NEW && pipelineEntryDate == null) {
            pipelineEntryDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Utility Methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String getFullAddress() {
        StringBuilder address = new StringBuilder();
        if (street != null && !street.isEmpty()) {
            address.append(street);
            if (houseNumber != null && !houseNumber.isEmpty()) {
                address.append(" ").append(houseNumber);
            }
            address.append(", ");
        }
        if (postalCode != null && !postalCode.isEmpty()) {
            address.append(postalCode).append(" ");
        }
        if (city != null && !city.isEmpty()) {
            address.append(city);
        }
        if (country != null && !country.isEmpty()) {
            address.append(", ").append(country);
        }
        return address.toString();
    }

    public boolean isActive() {
        return status == CustomerStatus.ACTIVE;
    }

    public boolean isPotential() {
        return status == CustomerStatus.POTENTIAL;
    }

    public boolean isInactive() {
        return status == CustomerStatus.INACTIVE;
    }
} 