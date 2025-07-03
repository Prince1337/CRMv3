package eu.pierix.crmv3.application;

import eu.pierix.crmv3.infrastructure.JwtService;
import eu.pierix.crmv3.infrastructure.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;

/**
 * Service für das Logout-Handling
 */
@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final JwtService jwtService;

    /**
     * Behandelt das Logout eines Benutzers
     */
    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            final String jwt = authHeader.substring(7);
            
            try {
                // Token in der Datenbank widerrufen
                tokenService.revokeToken(jwt);
                
                // Optional: Alle Tokens des Benutzers widerrufen
                String username = jwtService.extractUsername(jwt);
                userRepository.findByUsername(username).ifPresent(user -> {
                    tokenService.revokeAllUserTokens(user);
                });
            } catch (Exception e) {
                // Bei Fehlern trotzdem den Token widerrufen
                tokenService.revokeToken(jwt);
            }
        }
        
        // Security Context löschen
        SecurityContextHolder.clearContext();
    }
} 