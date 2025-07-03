package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Token;
import eu.pierix.crmv3.domain.TokenType;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service für Token-Geschäftslogik
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TokenService {

    private final TokenRepository tokenRepository;

    /**
     * Speichert einen neuen Token in der Datenbank
     */
    public Token saveToken(String tokenString, User user, TokenType tokenType, LocalDateTime expiresAt) {
        Token token = Token.builder()
                .token(tokenString)
                .user(user)
                .tokenType(tokenType)
                .expired(false)
                .revoked(false)
                .expiresAt(expiresAt)
                .build();

        return tokenRepository.save(token);
    }

    /**
     * Findet einen Token anhand des Token-Strings
     */
    public Optional<Token> findByToken(String tokenString) {
        return tokenRepository.findByToken(tokenString);
    }

    /**
     * Validiert einen Token (prüft ob er gültig ist)
     */
    public boolean isTokenValid(String tokenString) {
        Optional<Token> tokenOpt = tokenRepository.findByToken(tokenString);
        if (tokenOpt.isEmpty()) {
            return false;
        }

        Token token = tokenOpt.get();
        return token.isValid();
    }

    /**
     * Markiert einen Token als widerrufen
     */
    public void revokeToken(String tokenString) {
        tokenRepository.revokeToken(tokenString);
    }

    /**
     * Markiert alle Tokens eines Benutzers als widerrufen
     */
    public void revokeAllUserTokens(User user) {
        tokenRepository.revokeAllUserTokens(user);
    }

    /**
     * Markiert alle Access-Tokens eines Benutzers als widerrufen
     */
    public void revokeAllUserAccessTokens(User user) {
        tokenRepository.revokeAllUserAccessTokens(user);
    }

    /**
     * Markiert alle Refresh-Tokens eines Benutzers als widerrufen
     */
    public void revokeAllUserRefreshTokens(User user) {
        tokenRepository.revokeAllUserRefreshTokens(user);
    }

    /**
     * Findet alle gültigen Tokens eines Benutzers
     */
    public List<Token> findAllValidTokensByUser(User user) {
        return tokenRepository.findAllValidTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Findet alle gültigen Access-Tokens eines Benutzers
     */
    public List<Token> findAllValidAccessTokensByUser(User user) {
        return tokenRepository.findAllValidAccessTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Findet alle gültigen Refresh-Tokens eines Benutzers
     */
    public List<Token> findAllValidRefreshTokensByUser(User user) {
        return tokenRepository.findAllValidRefreshTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Zählt die Anzahl der gültigen Tokens eines Benutzers
     */
    public long countValidTokensByUser(User user) {
        return tokenRepository.countValidTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Zählt die Anzahl der gültigen Access-Tokens eines Benutzers
     */
    public long countValidAccessTokensByUser(User user) {
        return tokenRepository.countValidAccessTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Zählt die Anzahl der gültigen Refresh-Tokens eines Benutzers
     */
    public long countValidRefreshTokensByUser(User user) {
        return tokenRepository.countValidRefreshTokensByUser(user, LocalDateTime.now());
    }

    /**
     * Löscht alle abgelaufenen Tokens (Scheduled Task)
     */
    @Scheduled(cron = "0 0 2 * * ?") // Täglich um 2:00 Uhr
    @Transactional
    public void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<Token> expiredTokens = tokenRepository.findAllExpiredTokens(now);
        
        if (!expiredTokens.isEmpty()) {
            tokenRepository.deleteExpiredTokens(now);
            // Hier könnte man Logging hinzufügen
        }
    }

    /**
     * Löscht alle Tokens eines Benutzers (z.B. bei Account-Löschung)
     */
    public void deleteAllUserTokens(User user) {
        tokenRepository.deleteAllUserTokens(user);
    }

    /**
     * Prüft ob ein Benutzer zu viele aktive Tokens hat
     */
    public boolean hasTooManyActiveTokens(User user, int maxTokens) {
        return countValidTokensByUser(user) >= maxTokens;
    }

    /**
     * Entfernt alte Tokens eines Benutzers, wenn er zu viele hat
     */
    public void removeOldTokensIfNecessary(User user, int maxTokens) {
        long currentTokens = countValidTokensByUser(user);
        if (currentTokens >= maxTokens) {
            List<Token> validTokens = findAllValidTokensByUser(user);
            // Entferne die ältesten Tokens
            validTokens.stream()
                    .sorted((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()))
                    .limit(currentTokens - maxTokens + 1)
                    .forEach(token -> tokenRepository.revokeToken(token.getToken()));
        }
    }
} 