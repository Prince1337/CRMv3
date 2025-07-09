package eu.pierix.crmv3.web.dto;

import eu.pierix.crmv3.domain.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferRequest {
    private String title;
    private String description;
    private LocalDate validUntil;
    private OfferStatus status;
    private BigDecimal discountPercentage;
    private Long customerId;
    private List<OfferItemRequest> items;
} 