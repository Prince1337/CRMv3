package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.OfferService;
import eu.pierix.crmv3.application.CustomerService;
import eu.pierix.crmv3.domain.*;
import eu.pierix.crmv3.web.dto.OfferItemResponse;
import eu.pierix.crmv3.web.dto.OfferRequest;
import eu.pierix.crmv3.web.dto.OfferResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OfferController {

    private final OfferService offerService;
    private final CustomerService customerService;

    @PostMapping
    public ResponseEntity<OfferResponse> createOffer(@RequestBody OfferRequest request, Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        
        Offer offer = Offer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .validUntil(request.getValidUntil())
                .status(request.getStatus() != null ? request.getStatus() : OfferStatus.DRAFT)
                .discountPercentage(request.getDiscountPercentage())
                .build();
        
        // Kunde setzen
        if (request.getCustomerId() != null) {
            Customer customer = customerService.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Kunde nicht gefunden: " + request.getCustomerId()));
            offer.setCustomer(customer);
        }
        
        // Positionen hinzufügen
        if (request.getItems() != null) {
            request.getItems().forEach(itemRequest -> {
                OfferItem item = OfferItem.builder()
                        .description(itemRequest.getDescription())
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(itemRequest.getUnitPrice())
                        .taxRate(itemRequest.getTaxRate())
                        .build();
                // Beträge sofort berechnen
                item.calculateAmounts();
                offer.addItem(item);
            });
        }
        
        Offer savedOffer = offerService.createOffer(offer, userId);
        return ResponseEntity.ok(mapToResponse(savedOffer));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOffer(@PathVariable Long id) {
        return offerService.findById(id)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OfferResponse> updateOffer(@PathVariable Long id, @RequestBody OfferRequest request) {
        return offerService.findById(id)
                .map(offer -> {
                    offer.setTitle(request.getTitle());
                    offer.setDescription(request.getDescription());
                    offer.setValidUntil(request.getValidUntil());
                    offer.setStatus(request.getStatus());
                    offer.setDiscountPercentage(request.getDiscountPercentage());
                    
                    // Positionen aktualisieren
                    offer.getItems().clear();
                    if (request.getItems() != null) {
                        request.getItems().forEach(itemRequest -> {
                            OfferItem item = OfferItem.builder()
                                    .description(itemRequest.getDescription())
                                    .quantity(itemRequest.getQuantity())
                                    .unitPrice(itemRequest.getUnitPrice())
                                    .taxRate(itemRequest.getTaxRate())
                                    .build();
                            offer.addItem(item);
                        });
                    }
                    
                    Offer updatedOffer = offerService.updateOffer(offer);
                    return ResponseEntity.ok(mapToResponse(updatedOffer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffer(@PathVariable Long id) {
        if (offerService.offerExists(id)) {
            offerService.deleteOffer(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<Page<OfferResponse>> getOffers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) OfferStatus status,
            @RequestParam(required = false) Long createdById) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Offer> offers = offerService.searchOffers(customerId, status, createdById, pageable);
        Page<OfferResponse> responses = offers.map(this::mapToResponse);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<OfferResponse> markAsSent(@PathVariable Long id) {
        Offer offer = offerService.markAsSent(id);
        return ResponseEntity.ok(mapToResponse(offer));
    }

    @PostMapping("/{id}/paid")
    public ResponseEntity<OfferResponse> markAsPaid(@PathVariable Long id) {
        Offer offer = offerService.markAsPaid(id);
        return ResponseEntity.ok(mapToResponse(offer));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<OfferResponse>> getOverdueOffers() {
        List<Offer> overdueOffers = offerService.findOverdueOffers();
        List<OfferResponse> responses = overdueOffers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<OfferStatus, Long>> getOfferStatistics() {
        Map<OfferStatus, Long> statistics = offerService.countOffersByStatusGrouped();
        return ResponseEntity.ok(statistics);
    }

    private OfferResponse mapToResponse(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .offerNumber(offer.getOfferNumber())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .validUntil(offer.getValidUntil())
                .status(offer.getStatus())
                .statusDisplayName(offer.getStatus().getDisplayName())
                .netAmount(offer.getNetAmount())
                .taxAmount(offer.getTaxAmount())
                .grossAmount(offer.getGrossAmount())
                .discountPercentage(offer.getDiscountPercentage())
                .discountAmount(offer.getDiscountAmount())
                .finalAmount(offer.getFinalAmount())
                .customerId(offer.getCustomer() != null ? offer.getCustomer().getId() : null)
                .customerName(offer.getCustomer() != null ? offer.getCustomer().getFullName() : null)
                .createdById(offer.getCreatedBy() != null ? offer.getCreatedBy().getId() : null)
                .createdByName(offer.getCreatedBy() != null ? offer.getCreatedBy().getFullName() : null)
                .createdAt(offer.getCreatedAt())
                .updatedAt(offer.getUpdatedAt())
                .sentAt(offer.getSentAt())
                .paidAt(offer.getPaidAt())
                .items(offer.getItems().stream()
                        .map(this::mapToItemResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private OfferItemResponse mapToItemResponse(OfferItem item) {
        return OfferItemResponse.builder()
                .id(item.getId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .taxRate(item.getTaxRate())
                .netAmount(item.getNetAmount())
                .taxAmount(item.getTaxAmount())
                .grossAmount(item.getGrossAmount())
                .build();
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        // Vereinfachung: User-ID aus Authentication extrahieren
        // In der Praxis würde hier die User-ID aus dem JWT-Token extrahiert
        return 1L; // Placeholder
    }
} 