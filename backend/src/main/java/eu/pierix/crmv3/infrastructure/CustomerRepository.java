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
    @Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
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
    @Query("SELECT c FROM Customer c WHERE " +
           "(:name IS NULL OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:company IS NULL OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
           "(:city IS NULL OR LOWER(c.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Customer> findBySearchCriteria(
            @Param("name") String name,
            @Param("email") String email,
            @Param("company") String company,
            @Param("city") String city,
            @Param("status") CustomerStatus status,
            Pageable pageable
    );

    /**
     * Findet Kunden anhand von Tags
     */
    @Query("SELECT c FROM Customer c WHERE c.tags LIKE %:tag%")
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
} 