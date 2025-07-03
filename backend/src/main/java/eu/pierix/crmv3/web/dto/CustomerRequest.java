package eu.pierix.crmv3.web.dto;

import eu.pierix.crmv3.domain.CustomerStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für Kundenanfragen (Erstellen/Aktualisieren)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    // Kontaktdaten
    @NotBlank(message = "Vorname ist erforderlich")
    @Size(max = 100, message = "Vorname darf maximal 100 Zeichen lang sein")
    private String firstName;

    @NotBlank(message = "Nachname ist erforderlich")
    @Size(max = 100, message = "Nachname darf maximal 100 Zeichen lang sein")
    private String lastName;

    @Email(message = "Email muss ein gültiges Format haben")
    @Size(max = 255, message = "Email darf maximal 255 Zeichen lang sein")
    private String email;

    @Size(max = 30, message = "Telefonnummer darf maximal 30 Zeichen lang sein")
    //@Pattern(regexp = "^[+0-9 ()-]*$", message = "Telefonnummer enthält ungültige Zeichen")
    private String phone;

    @Size(max = 30, message = "Handynummer darf maximal 30 Zeichen lang sein")
    //@Pattern(regexp = "^[+0-9 ()-]*$", message = "Handynummer enthält ungültige Zeichen")
    private String mobile;

    // Firmendaten
    @Size(max = 255, message = "Firmenname darf maximal 255 Zeichen lang sein")
    private String companyName;
    @Size(max = 100, message = "Position darf maximal 100 Zeichen lang sein")
    private String position;
    @Size(max = 100, message = "Abteilung darf maximal 100 Zeichen lang sein")
    private String department;
    @Size(max = 255, message = "Straße darf maximal 255 Zeichen lang sein")
    private String street;
    @Size(max = 20, message = "Hausnummer darf maximal 20 Zeichen lang sein")
    private String houseNumber;
    @Size(max = 20, message = "PLZ darf maximal 20 Zeichen lang sein")
    private String postalCode;
    @Size(max = 100, message = "Stadt darf maximal 100 Zeichen lang sein")
    private String city;
    @Size(max = 100, message = "Land darf maximal 100 Zeichen lang sein")
    private String country;
    @Size(max = 255, message = "Website darf maximal 255 Zeichen lang sein")
    private String website;

    // Status und Kategorisierung
    private CustomerStatus status;
    @Size(max = 100, message = "Quelle darf maximal 100 Zeichen lang sein")
    private String source;
    @Size(max = 255, message = "Tags dürfen maximal 255 Zeichen lang sein")
    private String tags;

    // Notizen
    @Size(max = 2000, message = "Notizen dürfen maximal 2000 Zeichen lang sein")
    private String notes;
    @Size(max = 2000, message = "Interne Notizen dürfen maximal 2000 Zeichen lang sein")
    private String internalNotes;

    // Zuweisung
    private Long assignedToId;
} 