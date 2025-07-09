package eu.pierix.crmv3.infrastructure;

import eu.pierix.crmv3.domain.Offer;
import eu.pierix.crmv3.domain.OfferStatus;
import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    // Finde Angebote nach Status
    List<Offer> findByStatus(OfferStatus status);
    
    // Finde Angebote nach Kunde
    List<Offer> findByCustomer(Customer customer);
    
    // Finde Angebote nach Kunden-ID
    List<Offer> findByCustomerId(Long customerId);
    
    // Finde Angebote nach ersteller User
    List<Offer> findByCreatedBy(User createdBy);
    
    // Finde Angebote nach ersteller User-ID
    List<Offer> findByCreatedById(Long createdById);
    
    // Finde Angebote nach Angebotsnummer
    Optional<Offer> findByOfferNumber(String offerNumber);
    
    // Finde überfällige Angebote
    @Query("SELECT o FROM Offer o WHERE o.status = :status AND o.validUntil < :now")
    List<Offer> findOverdueOffers(@Param("status") OfferStatus status, @Param("now") LocalDateTime now);
    
    // Finde Angebote mit Paginierung und Suchkriterien
    @Query("SELECT o FROM Offer o WHERE " +
           "(:customerId IS NULL OR o.customer.id = :customerId) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:createdById IS NULL OR o.createdBy.id = :createdById)")
    Page<Offer> findBySearchCriteria(
            @Param("customerId") Long customerId,
            @Param("status") OfferStatus status,
            @Param("createdById") Long createdById,
            Pageable pageable);
    
    // Zähle Angebote nach Status
    long countByStatus(OfferStatus status);
    
    // Zähle Angebote nach Kunde
    long countByCustomer(Customer customer);

    // Statistik-Methoden für StatisticsService
    /**
     * Findet bezahlte Angebote nach einem bestimmten Datum
     */
    List<Offer> findByStatusAndCreatedAtAfter(OfferStatus status, LocalDateTime date);

    /**
     * Findet bezahlte Angebote zwischen zwei Daten
     */
    List<Offer> findByStatusAndCreatedAtBetween(OfferStatus status, LocalDateTime startDate, LocalDateTime endDate);
} 