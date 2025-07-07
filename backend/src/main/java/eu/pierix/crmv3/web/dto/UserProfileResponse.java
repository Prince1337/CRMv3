package eu.pierix.crmv3.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO für Benutzerprofile (nur nach Authentifizierung verfügbar)
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {

    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role; // Role als String für Frontend-Kompatibilität
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
} 