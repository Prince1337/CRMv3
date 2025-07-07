package eu.pierix.crmv3.web;

import eu.pierix.crmv3.application.AuthenticationService;
import eu.pierix.crmv3.application.UserService;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.web.dto.AuthenticationRequest;
import eu.pierix.crmv3.web.dto.AuthenticationResponse;
import eu.pierix.crmv3.web.dto.RegisterRequest;
import eu.pierix.crmv3.web.dto.RegisterResponse;
import eu.pierix.crmv3.web.dto.UserProfileResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller für Authentifizierungs-Endpunkte
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    /**
     * Registriert einen neuen Benutzer
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authenticationService.register(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Authentifiziert einen Benutzer
     */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthenticationResponse.builder()
                            .accessToken(null)
                            .refreshToken(null)
                            .build());
        }
    }

    /**
     * Erneuert einen JWT-Token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().build();
            }

            String refreshToken = authHeader.substring(7);
            AuthenticationResponse response = authenticationService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Validiert einen JWT-Token
     */
    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(false);
            }

            String token = authHeader.substring(7);
            boolean isValid = authenticationService.validateToken(token);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    /**
     * Logout-Endpunkt
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Kein gültiger Authorization-Header");
            }

            String token = authHeader.substring(7);
            authenticationService.logout(token);
            
            return ResponseEntity.ok("Erfolgreich ausgeloggt");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler beim Logout: " + e.getMessage());
        }
    }

    /**
     * Health-Check für den Auth-Service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication Service ist verfügbar");
    }

    /**
     * Gibt das Benutzerprofil des authentifizierten Benutzers zurück
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("Kein gültiger Authorization-Header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String token = authHeader.substring(7);
            String username = authenticationService.getUsernameFromToken(token);
            log.info("Authentifizierter Benutzer: {}", username);
            
            // Benutzer aus der Datenbank laden
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

            log.info("Benutzerprofil: {}", user);
            
            // Vollständiges Profil erstellen
            UserProfileResponse profile = UserProfileResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role("ROLE_" + user.getRole().name()) // Role im korrekten Format für Frontend
                    .enabled(user.isEnabled())
                    .createdAt(user.getCreatedAt())
                    .lastLogin(user.getLastLogin())
                    .build();

            log.info("Benutzerprofil: {}", profile);
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
} 