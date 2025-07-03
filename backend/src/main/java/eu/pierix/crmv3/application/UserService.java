package eu.pierix.crmv3.application;

import eu.pierix.crmv3.domain.Role;
import eu.pierix.crmv3.domain.User;
import eu.pierix.crmv3.infrastructure.UserRepository;
import eu.pierix.crmv3.web.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service für Benutzerverwaltung und Authentifizierung
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Lädt einen Benutzer für Spring Security
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));
    }

    /**
     * Registriert einen neuen Benutzer
     */
    public User registerUser(RegisterRequest request) {
        // Prüfe ob Username oder Email bereits existiert
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username bereits vergeben: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email bereits vergeben: " + request.getEmail());
        }

        // Erstelle neuen Benutzer
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.USER)
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        return userRepository.save(user);
    }

    /**
     * Authentifiziert einen Benutzer
     */
    public User authenticateUser(String username, String password) {
        // Authentifizierung über Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        // Benutzer finden und lastLogin aktualisieren
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Findet einen Benutzer anhand der ID
     */
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Findet einen Benutzer anhand des Usernames
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Findet einen Benutzer anhand der Email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Findet alle Benutzer
     */
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Findet alle Benutzer mit einer bestimmten Rolle
     */
    public List<User> findUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    /**
     * Aktualisiert einen Benutzer
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Ändert das Passwort eines Benutzers
     */
    public void changePassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Aktiviert oder deaktiviert einen Benutzer
     */
    public void setUserEnabled(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        
        user.setEnabled(enabled);
        userRepository.save(user);
    }

    /**
     * Ändert die Rolle eines Benutzers
     */
    public void changeUserRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden: " + userId));
        
        user.setRole(role);
        userRepository.save(user);
    }

    /**
     * Löscht einen Benutzer
     */
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    /**
     * Zählt die Anzahl der Benutzer
     */
    public long countUsers() {
        return userRepository.count();
    }

    /**
     * Zählt die Anzahl der aktiven Benutzer
     */
    public long countActiveUsers() {
        return userRepository.countByEnabledTrue();
    }

    /**
     * Zählt die Anzahl der Benutzer pro Rolle
     */
    public long countUsersByRole(Role role) {
        return userRepository.countByRole(role);
    }
} 