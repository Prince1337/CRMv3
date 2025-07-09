package eu.pierix.crmv3.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferItemResponse {
    private Long id;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal netAmount;
    private BigDecimal taxAmount;
    private BigDecimal grossAmount;
} 