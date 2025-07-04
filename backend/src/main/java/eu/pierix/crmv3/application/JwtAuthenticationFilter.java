package eu.pierix.crmv3.application;

import eu.pierix.crmv3.infrastructure.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter für JWT-Token-Validierung
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenService tokenService;

    /**
     * Filtert HTTP-Requests und validiert JWT-Tokens
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Prüfe ob Authorization-Header vorhanden und gültig ist
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extrahiere JWT-Token aus Authorization-Header
        jwt = authHeader.substring(7);

        try {
            // Extrahiere Username aus JWT-Token
            username = jwtService.extractUsername(jwt);

            // Wenn Username extrahiert wurde und kein Benutzer im Security Context ist
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Lade UserDetails
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Validiere JWT-Token (sowohl JWT als auch Datenbank-Validierung)
                if (jwtService.isTokenValid(jwt, userDetails) && tokenService.isTokenValid(jwt)) {
                    // Erstelle Authentication Token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // Setze Details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Setze Authentication im Security Context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Bei Fehlern (z.B. ungültiger Token) einfach weiterleiten
            // Der Request wird dann als unauthentifiziert behandelt
            logger.error("Fehler bei JWT-Token-Validierung: " + e.getMessage());
        }

        // Führe Filter-Chain fort
        filterChain.doFilter(request, response);
    }
} 