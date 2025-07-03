package eu.pierix.crmv3.infrastructure;

import eu.pierix.crmv3.domain.Token;
import eu.pierix.crmv3.domain.TokenType;
import eu.pierix.crmv3.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository für Token-Entity
 */
@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    /**
     * Findet einen Token anhand des Token-Strings
     */
    Optional<Token> findByToken(String token);

    /**
     * Findet alle gültigen Tokens eines Benutzers
     */
    @Query("SELECT t FROM Token t WHERE t.user = :user AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    List<Token> findAllValidTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Findet alle gültigen Access-Tokens eines Benutzers
     */
    @Query("SELECT t FROM Token t WHERE t.user = :user AND t.tokenType = 'ACCESS' AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    List<Token> findAllValidAccessTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Findet alle gültigen Refresh-Tokens eines Benutzers
     */
    @Query("SELECT t FROM Token t WHERE t.user = :user AND t.tokenType = 'REFRESH' AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    List<Token> findAllValidRefreshTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Findet alle abgelaufenen Tokens
     */
    @Query("SELECT t FROM Token t WHERE t.expiresAt < :now")
    List<Token> findAllExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Findet alle widerrufenen Tokens
     */
    List<Token> findByRevokedTrue();

    /**
     * Findet alle Tokens eines bestimmten Typs
     */
    List<Token> findByTokenType(TokenType tokenType);

    /**
     * Findet alle Tokens eines Benutzers
     */
    List<Token> findByUser(User user);

    /**
     * Findet alle Tokens eines Benutzers mit einem bestimmten Typ
     */
    List<Token> findByUserAndTokenType(User user, TokenType tokenType);

    /**
     * Zählt die Anzahl der gültigen Tokens eines Benutzers
     */
    @Query("SELECT COUNT(t) FROM Token t WHERE t.user = :user AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    long countValidTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Zählt die Anzahl der gültigen Access-Tokens eines Benutzers
     */
    @Query("SELECT COUNT(t) FROM Token t WHERE t.user = :user AND t.tokenType = 'ACCESS' AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    long countValidAccessTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Zählt die Anzahl der gültigen Refresh-Tokens eines Benutzers
     */
    @Query("SELECT COUNT(t) FROM Token t WHERE t.user = :user AND t.tokenType = 'REFRESH' AND t.expired = false AND t.revoked = false AND t.expiresAt > :now")
    long countValidRefreshTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Markiert alle Tokens eines Benutzers als abgelaufen
     */
    @Modifying
    @Query("UPDATE Token t SET t.expired = true WHERE t.user = :user")
    void revokeAllUserTokens(@Param("user") User user);

    /**
     * Markiert alle Access-Tokens eines Benutzers als abgelaufen
     */
    @Modifying
    @Query("UPDATE Token t SET t.expired = true WHERE t.user = :user AND t.tokenType = 'ACCESS'")
    void revokeAllUserAccessTokens(@Param("user") User user);

    /**
     * Markiert alle Refresh-Tokens eines Benutzers als abgelaufen
     */
    @Modifying
    @Query("UPDATE Token t SET t.expired = true WHERE t.user = :user AND t.tokenType = 'REFRESH'")
    void revokeAllUserRefreshTokens(@Param("user") User user);

    /**
     * Markiert einen spezifischen Token als widerrufen
     */
    @Modifying
    @Query("UPDATE Token t SET t.revoked = true WHERE t.token = :token")
    void revokeToken(@Param("token") String token);

    /**
     * Löscht alle abgelaufenen Tokens
     */
    @Modifying
    @Query("DELETE FROM Token t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);

    /**
     * Löscht alle Tokens eines Benutzers
     */
    @Modifying
    @Query("DELETE FROM Token t WHERE t.user = :user")
    void deleteAllUserTokens(@Param("user") User user);
} 