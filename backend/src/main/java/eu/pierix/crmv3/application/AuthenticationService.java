package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.TokenType;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.JwtService;
import eu.pierix.crmv3.web.dto.AuthenticationRequest;
import eu.pierix.crmv3.web.dto.AuthenticationResponse;
import eu.pierix.crmv3.web.dto.RegisterRequest;
import eu.pierix.crmv3.web.dto.RegisterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service für Authentifizierungslogik
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserService userService;
    private final JwtService jwtService;
    private final TokenService tokenService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshExpiration;

    /**
     * Registriert einen neuen Benutzer
     */
    public RegisterResponse register(RegisterRequest request) {
        try {
            // Benutzer registrieren
            User user = userService.registerUser(request);

            // JWT-Tokens generieren (automatisches Login nach Registrierung)
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Tokens in Datenbank speichern
            LocalDateTime accessExpiresAt = LocalDateTime.now().plusSeconds(jwtExpiration / 1000);
            LocalDateTime refreshExpiresAt = LocalDateTime.now().plusSeconds(refreshExpiration / 1000);

            tokenService.saveToken(accessToken, user, TokenType.BEARER, accessExpiresAt);
            tokenService.saveToken(refreshToken, user, TokenType.BEARER, refreshExpiresAt);

            return RegisterResponse.builder()
                    .message("Benutzer erfolgreich registriert und automatisch eingeloggt")
                    .success(true)
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration)
                    .build();

        } catch (Exception e) {
            return RegisterResponse.builder()
                    .message("Registrierung fehlgeschlagen: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    /**
     * Authentifiziert einen Benutzer und gibt JWT-Tokens zurück
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // Authentifizierung über UserService
        User user = userService.authenticateUser(request.getUsernameOrEmail(), request.getPassword());

        // JWT-Tokens generieren
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Tokens in Datenbank speichern
        LocalDateTime accessExpiresAt = LocalDateTime.now().plusSeconds(jwtExpiration / 1000);
        LocalDateTime refreshExpiresAt = LocalDateTime.now().plusSeconds(refreshExpiration / 1000);

        tokenService.saveToken(accessToken, user, TokenType.BEARER, accessExpiresAt);
        tokenService.saveToken(refreshToken, user, TokenType.BEARER, refreshExpiresAt);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .build();
    }

    /**
     * Erneuert einen JWT-Token mit einem Refresh-Token
     */
    public AuthenticationResponse refreshToken(String refreshToken) {
        try {
            // Username aus Refresh-Token extrahieren
            String username = jwtService.extractUsername(refreshToken);
            
            // Benutzer finden
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

            // Refresh-Token validieren
            if (!jwtService.isTokenValid(refreshToken, user) || !tokenService.isTokenValid(refreshToken)) {
                throw new RuntimeException("Ungültiger Refresh-Token");
            }

            // Alten Access-Token widerrufen
            tokenService.revokeAllUserAccessTokens(user);

            // Neue Tokens generieren
            String newAccessToken = jwtService.generateToken(user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            // Neue Tokens in Datenbank speichern
            LocalDateTime accessExpiresAt = LocalDateTime.now().plusSeconds(jwtExpiration / 1000);
            LocalDateTime refreshExpiresAt = LocalDateTime.now().plusSeconds(refreshExpiration / 1000);

            tokenService.saveToken(newAccessToken, user, TokenType.BEARER, accessExpiresAt);
            tokenService.saveToken(newRefreshToken, user, TokenType.BEARER, refreshExpiresAt);

            // Alten Refresh-Token widerrufen
            tokenService.revokeToken(refreshToken);

            return AuthenticationResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn(jwtExpiration)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Token-Erneuerung fehlgeschlagen: " + e.getMessage());
        }
    }

    /**
     * Validiert einen JWT-Token
     */
    public boolean validateToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
            
            return jwtService.isTokenValid(token, user) && tokenService.isTokenValid(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrahiert den Username aus einem JWT-Token
     */
    public String getUsernameFromToken(String token) {
        return jwtService.extractUsername(token);
    }

    /**
     * Logout: Widerruft alle Tokens eines Benutzers
     */
    public void logout(String token) {
        try {
            String username = jwtService.extractUsername(token);
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
            
            tokenService.revokeAllUserTokens(user);
        } catch (Exception e) {
            // Bei Fehlern einfach den spezifischen Token widerrufen
            tokenService.revokeToken(token);
        }
    }
} 