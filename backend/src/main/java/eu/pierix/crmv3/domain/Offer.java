package eu.pierix.crmv3.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity für Angebote
 */
@Entity
@Table(name = "offers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offer_number", unique = true, nullable = false)
    private String offerNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OfferStatus status = OfferStatus.DRAFT;

    @Column(name = "net_amount", precision = 10, scale = 2)
    private BigDecimal netAmount;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "gross_amount", precision = 10, scale = 2)
    private BigDecimal grossAmount;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount;

    // Beziehungen
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OfferItem> items = new ArrayList<>();

    // Metadaten
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // JPA Lifecycle Callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (offerNumber == null) {
            offerNumber = generateOfferNumber();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Utility Methods
    private String generateOfferNumber() {
        return "OFF-" + System.currentTimeMillis();
    }

    public void addItem(OfferItem item) {
        items.add(item);
        item.setOffer(this);
        calculateTotals();
    }

    public void removeItem(OfferItem item) {
        items.remove(item);
        item.setOffer(null);
        calculateTotals();
    }

    public void calculateTotals() {
        netAmount = items.stream()
                .map(OfferItem::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        taxAmount = items.stream()
                .map(OfferItem::getTaxAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        grossAmount = netAmount.add(taxAmount);

        if (discountPercentage != null && discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = grossAmount.multiply(discountPercentage).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        } else {
            discountAmount = BigDecimal.ZERO;
        }

        finalAmount = grossAmount.subtract(discountAmount);
    }

    public boolean isDraft() {
        return status == OfferStatus.DRAFT;
    }

    public boolean isSent() {
        return status == OfferStatus.SENT;
    }

    public boolean isPaid() {
        return status == OfferStatus.PAID;
    }

    public boolean isOverdue() {
        return status == OfferStatus.OVERDUE;
    }
} 