package eu.pierix.crmv3.infrastructure;

import eu.pierix.crmv3.domain.Customer;
import eu.pierix.crmv3.domain.CustomerStatus;
import eu.pierix.crmv3.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository für Customer-Entity mit Spring Data JPA
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Grundlegende Suchmethoden
    /**
     * Findet Kunden anhand von Vor- oder Nachname (Case-insensitive)
     */
    @Query(value = "SELECT * FROM customers c WHERE c.first_name ILIKE CONCAT('%', :name, '%') OR c.last_name ILIKE CONCAT('%', :name, '%')", nativeQuery = true)
    List<Customer> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Findet Kunden anhand der Email (Case-insensitive)
     */
    List<Customer> findByEmailContainingIgnoreCase(String email);

    /**
     * Findet Kunden anhand des Firmennamens (Case-insensitive)
     */
    List<Customer> findByCompanyNameContainingIgnoreCase(String companyName);

    /**
     * Findet Kunden anhand der Stadt (Case-insensitive)
     */
    List<Customer> findByCityContainingIgnoreCase(String city);

    // Status-basierte Methoden
    /**
     * Findet alle Kunden mit einem bestimmten Status
     */
    List<Customer> findByStatus(CustomerStatus status);

    /**
     * Zählt Kunden nach Status
     */
    long countByStatus(CustomerStatus status);

    // Erweiterte Suchmethoden
    /**
     * Findet Kunden die nach einem bestimmten Datum erstellt wurden
     */
    List<Customer> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Findet Kunden die nach einem bestimmten Datum zuletzt kontaktiert wurden
     */
    List<Customer> findByLastContactAfter(LocalDateTime date);

    /**
     * Findet Kunden die seit einem bestimmten Datum nicht mehr kontaktiert wurden
     */
    @Query("SELECT c FROM Customer c WHERE c.lastContact IS NULL OR c.lastContact < :date")
    List<Customer> findNotContactedSince(@Param("date") LocalDateTime date);

    // Zugewiesene Kunden
    /**
     * Findet alle Kunden die einem bestimmten Benutzer zugewiesen sind
     */
    List<Customer> findByAssignedTo(User assignedTo);

    /**
     * Findet alle Kunden die von einem bestimmten Benutzer erstellt wurden
     */
    List<Customer> findByCreatedBy(User createdBy);

    // Komplexe Suchmethoden
    /**
     * Findet Kunden anhand mehrerer Kriterien
     */
    @Query(value = "SELECT * FROM customers c WHERE " +
           "(:name IS NULL OR (c.first_name ILIKE CONCAT('%', :name, '%') OR c.last_name ILIKE CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR c.email ILIKE CONCAT('%', :email, '%')) AND " +
           "(:company IS NULL OR c.company_name ILIKE CONCAT('%', :company, '%')) AND " +
           "(:city IS NULL OR c.city ILIKE CONCAT('%', :city, '%')) AND " +
           "(:status IS NULL OR c.status = :status)", 
           countQuery = "SELECT COUNT(*) FROM customers c WHERE " +
           "(:name IS NULL OR (c.first_name ILIKE CONCAT('%', :name, '%') OR c.last_name ILIKE CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR c.email ILIKE CONCAT('%', :email, '%')) AND " +
           "(:company IS NULL OR c.company_name ILIKE CONCAT('%', :company, '%')) AND " +
           "(:city IS NULL OR c.city ILIKE CONCAT('%', :city, '%')) AND " +
           "(:status IS NULL OR c.status = :status)",
           nativeQuery = true)
    Page<Customer> findBySearchCriteria(
            @Param("name") String name,
            @Param("email") String email,
            @Param("company") String company,
            @Param("city") String city,
            @Param("status") String status,
            Pageable pageable
    );



    /**
     * Findet Kunden anhand von Tags
     */
    @Query(value = "SELECT * FROM customers c WHERE c.tags ILIKE CONCAT('%', :tag, '%')", nativeQuery = true)
    List<Customer> findByTag(@Param("tag") String tag);

    /**
     * Findet Kunden anhand der Quelle
     */
    List<Customer> findBySource(String source);

    // Statistik-Methoden
    /**
     * Zählt Kunden nach Status gruppiert
     */
    @Query("SELECT c.status, COUNT(c) FROM Customer c GROUP BY c.status")
    List<Object[]> countByStatusGrouped();

    /**
     * Zählt Kunden nach Stadt gruppiert
     */
    @Query("SELECT c.city, COUNT(c) FROM Customer c WHERE c.city IS NOT NULL GROUP BY c.city ORDER BY COUNT(c) DESC")
    List<Object[]> countByCityGrouped();

    /**
     * Zählt Kunden nach Quelle gruppiert
     */
    @Query("SELECT c.source, COUNT(c) FROM Customer c WHERE c.source IS NOT NULL GROUP BY c.source ORDER BY COUNT(c) DESC")
    List<Object[]> countBySourceGrouped();

    // Statistik-Methoden für StatisticsService
    /**
     * Zählt Kunden mit einem der angegebenen Status
     */
    long countByStatusIn(List<CustomerStatus> statuses);

    /**
     * Zählt Kunden nach LeadSource
     */
    long countByLeadSource(eu.pierix.crmv3.domain.LeadSource leadSource);

    /**
     * Zählt gewonnene Kunden nach LeadSource
     */
    long countByLeadSourceAndStatus(eu.pierix.crmv3.domain.LeadSource leadSource, CustomerStatus status);

    /**
     * Zählt Kunden nach Status und Erstellungsdatum
     */
    long countByStatusAndCreatedAtBetween(CustomerStatus status, LocalDateTime startDate, LocalDateTime endDate);
} 