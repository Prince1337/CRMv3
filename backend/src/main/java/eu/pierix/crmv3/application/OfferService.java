package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.*;
import eu.pierix.crmv3.infrastructure.OfferRepository;
import eu.pierix.crmv3.infrastructure.CustomerRepository;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service für Angebotsverwaltung
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OfferService {

    private final OfferRepository offerRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    // CRUD Operationen
    public Offer createOffer(Offer offer, Long createdById) {
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + createdById));
        
        offer.setCreatedBy(createdBy);
        offer.calculateTotals();
        return offerRepository.save(offer);
    }

    public Optional<Offer> findById(Long id) {
        return offerRepository.findById(id);
    }

    public Offer updateOffer(Offer offer) {
        if (offer.getId() == null) {
            throw new RuntimeException("Angebots-ID ist erforderlich für Updates");
        }
        offer.calculateTotals();
        return offerRepository.save(offer);
    }

    public void deleteOffer(Long id) {
        offerRepository.deleteById(id);
    }

    // Suchmethoden
    public List<Offer> findAllOffers() {
        return offerRepository.findAll();
    }

    public Page<Offer> findAllOffers(Pageable pageable) {
        return offerRepository.findAll(pageable);
    }

    public List<Offer> findOffersByStatus(OfferStatus status) {
        return offerRepository.findByStatus(status);
    }

    public List<Offer> findOffersByCustomer(Long customerId) {
        return offerRepository.findByCustomerId(customerId);
    }

    public List<Offer> findOffersByCreatedBy(Long createdById) {
        return offerRepository.findByCreatedById(createdById);
    }

    public Optional<Offer> findByOfferNumber(String offerNumber) {
        return offerRepository.findByOfferNumber(offerNumber);
    }

    public Page<Offer> searchOffers(Long customerId, OfferStatus status, Long createdById, Pageable pageable) {
        return offerRepository.findBySearchCriteria(customerId, status, createdById, pageable);
    }

    // Status-Management
    public Offer markAsSent(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Angebot nicht gefunden: " + offerId));
        
        offer.setStatus(OfferStatus.SENT);
        offer.setSentAt(LocalDateTime.now());
        
        // Kundenstatus aktualisieren
        Customer customer = offer.getCustomer();
        if (customer != null) {
            customer.setStatus(CustomerStatus.OFFER_CREATED);
            customerRepository.save(customer);
        }
        
        return offerRepository.save(offer);
    }

    public Offer markAsPaid(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Angebot nicht gefunden: " + offerId));
        
        offer.setStatus(OfferStatus.PAID);
        offer.setPaidAt(LocalDateTime.now());

        // Kundenstatus aktualisieren
        Customer customer = offer.getCustomer();
        if (customer != null) {
            customer.setStatus(CustomerStatus.WON);
            customerRepository.save(customer);
        }

        return offerRepository.save(offer);
    }

    public Offer markAsOverdue(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Angebot nicht gefunden: " + offerId));
        
        offer.setStatus(OfferStatus.OVERDUE);
        return offerRepository.save(offer);
    }

    // Überfällige Angebote
    public List<Offer> findOverdueOffers() {
        return offerRepository.findOverdueOffers(OfferStatus.SENT, LocalDateTime.now());
    }

    // Statistiken
    public long countAllOffers() {
        return offerRepository.count();
    }

    public long countOffersByStatus(OfferStatus status) {
        return offerRepository.countByStatus(status);
    }

    public Map<OfferStatus, Long> countOffersByStatusGrouped() {
        return List.of(OfferStatus.values()).stream()
                .collect(Collectors.toMap(
                        status -> status,
                        status -> offerRepository.countByStatus(status)
                ));
    }

    public boolean offerExists(Long id) {
        return offerRepository.existsById(id);
    }

    public boolean offerNumberExists(String offerNumber) {
        return offerRepository.findByOfferNumber(offerNumber).isPresent();
    }
} 