package eu.pierix.crmv3.web.dto;

import eu.pierix.crmv3.domain.CustomerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO für Kunden-Suchanfragen
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSearchRequest {

    @Size(max = 100, message = "Name darf maximal 100 Zeichen lang sein")
    private String name;
    @Size(max = 255, message = "Email darf maximal 255 Zeichen lang sein")
    private String email;
    @Size(max = 255, message = "Firma darf maximal 255 Zeichen lang sein")
    private String company;
    @Size(max = 100, message = "Stadt darf maximal 100 Zeichen lang sein")
    private String city;
    private CustomerStatus status;
    @Size(max = 100, message = "Tag darf maximal 100 Zeichen lang sein")
    private String tag;
    @Size(max = 100, message = "Quelle darf maximal 100 Zeichen lang sein")
    private String source;
    private Long assignedToId;
    private Long createdById;
    
    // Paginierung
    @Min(value = 0, message = "Seite muss >= 0 sein")
    @Builder.Default
    private Integer page = 0;
    @Min(value = 1, message = "Größe muss >= 1 sein")
    @Max(value = 100, message = "Größe darf maximal 100 sein")
    @Builder.Default
    private Integer size = 20;
    @Size(max = 50, message = "Sortierfeld darf maximal 50 Zeichen lang sein")
    @Builder.Default
    private String sortBy = "createdAt";
    @Pattern(regexp = "^(asc|desc)$", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Sortierrichtung muss 'asc' oder 'desc' sein")
    @Builder.Default
    private String sortDirection = "desc";
} 