package eu.pierix.crmv3.web.dto;

import eu.pierix.crmv3.domain.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferResponse {
    private Long id;
    private String offerNumber;
    private String title;
    private String description;
    private LocalDate validUntil;
    private OfferStatus status;
    private String statusDisplayName;
    private BigDecimal netAmount;
    private BigDecimal taxAmount;
    private BigDecimal grossAmount;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private Long customerId;
    private String customerName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime sentAt;
    private LocalDateTime paidAt;
    private List<OfferItemResponse> items;
} 