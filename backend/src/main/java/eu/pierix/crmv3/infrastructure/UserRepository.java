package eu.pierix.crmv3.infrastructure;

import eu.pierix.crmv3.domain.Role;
import eu.pierix.crmv3.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository für User-Entity mit Spring Data JPA
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Findet einen Benutzer anhand des Usernames
     */
    Optional<User> findByUsername(String username);

    /**
     * Findet einen Benutzer anhand der Email
     */
    Optional<User> findByEmail(String email);

    /**
     * Prüft ob ein Username bereits existiert
     */
    boolean existsByUsername(String username);

    /**
     * Prüft ob eine Email bereits existiert
     */
    boolean existsByEmail(String email);

    /**
     * Findet alle Benutzer mit einer bestimmten Rolle
     */
    List<User> findByRole(Role role);

    /**
     * Findet alle aktiven Benutzer (enabled = true)
     */
    List<User> findByEnabledTrue();

    /**
     * Findet alle inaktiven Benutzer (enabled = false)
     */
    List<User> findByEnabledFalse();

    /**
     * Findet Benutzer die nach einem bestimmten Datum erstellt wurden
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);

    /**
     * Findet Benutzer die sich nach einem bestimmten Datum zuletzt angemeldet haben
     */
    List<User> findByLastLoginAfter(LocalDateTime date);

    /**
     * Findet Benutzer anhand von Vor- oder Nachname (Case-insensitive)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Zählt die Anzahl der Benutzer mit einer bestimmten Rolle
     */
    long countByRole(Role role);

    /**
     * Zählt die Anzahl der aktiven Benutzer
     */
    long countByEnabledTrue();

    /**
     * Findet Benutzer die sich seit einem bestimmten Datum nicht mehr angemeldet haben
     */
    @Query("SELECT u FROM User u WHERE u.lastLogin IS NULL OR u.lastLogin < :date")
    List<User> findInactiveUsersSince(@Param("date") LocalDateTime date);

    /**
     * Findet Benutzer mit abgelaufenen Credentials
     */
    List<User> findByCredentialsNonExpiredFalse();

    /**
     * Findet gesperrte Benutzer
     */
    List<User> findByAccountNonLockedFalse();
} 