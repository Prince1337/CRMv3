package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Role;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Komponente zur sicheren Initialisierung des Admin-Users beim Anwendungsstart
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.user.enabled:true}")
    private boolean adminUserEnabled;

    @Value("${admin.user.username:admin}")
    private String adminUsername;

    @Value("${admin.user.email:admin@crmv3.de}")
    private String adminEmail;

    @Value("${admin.user.firstName:Max}")
    private String adminFirstName;

    @Value("${admin.user.lastName:Mustermann}")
    private String adminLastName;

    @Value("${admin.user.password:admin123}")
    private String adminPassword;

    /**
     * Initialisiert den Admin-User beim Anwendungsstart
     * Wird nur ausgeführt, wenn noch kein Admin-User existiert
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeAdminUser() {
        if (!adminUserEnabled) {
            log.info("Admin-User-Initialisierung ist deaktiviert");
            return;
        }

        try {
            // Prüfe ob bereits ein Admin-User existiert
            if (userRepository.existsByUsername(adminUsername)) {
                log.info("Admin-User '{}' existiert bereits, überspringe Initialisierung", adminUsername);
                return;
            }

            // Prüfe ob bereits ein User mit der Admin-Email existiert
            if (userRepository.existsByEmail(adminEmail)) {
                log.warn("Ein User mit der Email '{}' existiert bereits, überspringe Admin-User-Initialisierung", adminEmail);
                return;
            }

            // Erstelle den Admin-User
            User adminUser = createAdminUser();
            User savedAdminUser = userRepository.save(adminUser);

            log.info("✅ Admin-User erfolgreich erstellt:");
            log.info("   Username: {}", savedAdminUser.getUsername());
            log.info("   Email: {}", savedAdminUser.getEmail());
            log.info("   Name: {} {}", savedAdminUser.getFirstName(), savedAdminUser.getLastName());
            log.info("   Rolle: {}", savedAdminUser.getRole());
            log.info("   ⚠️  Bitte ändern Sie das Passwort nach dem ersten Login!");

        } catch (Exception e) {
            log.error("❌ Fehler beim Erstellen des Admin-Users: {}", e.getMessage(), e);
        }
    }

    /**
     * Erstellt einen sicheren Admin-User
     */
    private User createAdminUser() {
        return User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .firstName(adminFirstName)
                .lastName(adminLastName)
                .role(Role.ADMIN)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
} 