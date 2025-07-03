package eu.pierix.crmv3.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO für Login-Requests
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {

    @NotBlank(message = "Username ist erforderlich")
    private String username;

    @NotBlank(message = "Passwort ist erforderlich")
    private String password;
} 