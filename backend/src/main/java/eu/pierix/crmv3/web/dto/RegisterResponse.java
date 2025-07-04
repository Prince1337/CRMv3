package eu.pierix.crmv3.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für Registrierungs-Responses mit Token-Informationen
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {

    private String message;
    private boolean success;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
} 