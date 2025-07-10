package eu.pierix.crmv3.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entity für Angebotspositionen
 */
@Entity
@Table(name = "offer_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("19.00"); // Standard MwSt

    @Column(name = "net_amount", precision = 10, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "gross_amount", precision = 10, scale = 2)
    private BigDecimal grossAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private Offer offer;

    @PrePersist
    @PreUpdate
    protected void onSaveOrUpdate() {
        calculateAmounts();
    }
    
    public void calculateAmounts() {
        if (quantity != null && unitPrice != null) {
            netAmount = unitPrice.multiply(new BigDecimal(quantity));
            
            if (taxRate != null) {
                taxAmount = netAmount.multiply(taxRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            } else {
                taxAmount = BigDecimal.ZERO;
            }

            if (netAmount != null) {
                grossAmount = netAmount.add(taxAmount);
            }
            
        } else {
            netAmount = BigDecimal.ZERO;
            taxAmount = BigDecimal.ZERO;
            grossAmount = BigDecimal.ZERO;
        }
    }
} 