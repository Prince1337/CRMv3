# JWT-Authentifizierung im Frontend

## Übersicht

Die JWT-Authentifizierung wurde vollständig im Angular-Frontend implementiert. Das System bietet:

- **Login/Register**: Benutzerfreundliche Anmelde- und Registrierungsformulare
- **Token-Management**: Automatische Token-Speicherung und -Erneuerung
- **Route-Guards**: Geschützte Routen mit rollenbasierter Zugriffskontrolle
- **HTTP-Interceptor**: Automatische Token-Anfügung an API-Requests
- **Responsive Design**: Moderne, mobile-freundliche Benutzeroberfläche

## Implementierte Komponenten

### 1. Core Services

#### AuthService (`core/services/auth.service.ts`)
- **Login/Register**: Authentifizierung und Registrierung
- **Token-Management**: Speicherung und Verwaltung von Access- und Refresh-Tokens
- **State-Management**: Zentrale Verwaltung des Authentifizierungsstatus
- **Error-Handling**: Benutzerfreundliche Fehlerbehandlung
- **Hilfsmethoden**: Rollenprüfung, Token-Validierung

#### AuthInterceptor (`core/interceptors/auth.interceptor.ts`)
- **Automatische Token-Anfügung**: JWT-Token wird automatisch zu allen HTTP-Requests hinzugefügt
- **Token-Erneuerung**: Automatische Erneuerung abgelaufener Tokens
- **Error-Handling**: Behandlung von 401-Fehlern mit automatischer Weiterleitung

### 2. Guards

#### AuthGuard (`core/guards/auth.guard.ts`)
- **Route-Schutz**: Verhindert Zugriff auf geschützte Routen für nicht-authentifizierte Benutzer
- **Automatische Weiterleitung**: Leitet zur Login-Seite weiter

#### RoleGuard (`core/guards/role.guard.ts`)
- **Rollenbasierte Zugriffskontrolle**: Prüft Benutzerrollen vor dem Zugriff
- **Admin-Bereiche**: Schützt Administrator-spezifische Funktionen

### 3. UI-Komponenten

#### LoginComponent (`features/auth/login/`)
- **Responsive Design**: Moderne, mobile-freundliche Benutzeroberfläche
- **Form-Validierung**: Client-seitige Validierung mit detaillierten Fehlermeldungen
- **Loading-States**: Benutzerfreundliche Lade-Indikatoren
- **Error-Handling**: Anzeige von Server-Fehlern

#### RegisterComponent (`features/auth/register/`)
- **Vollständiges Registrierungsformular**: Alle erforderlichen Felder
- **Passwort-Bestätigung**: Validierung der Passwort-Eingabe
- **Success-Feedback**: Bestätigung nach erfolgreicher Registrierung

#### DashboardComponent (`features/dashboard/`)
- **Willkommensseite**: Übersicht nach erfolgreichem Login
- **Benutzerinformationen**: Anzeige von Name und Rolle
- **Logout-Funktion**: Sichere Abmeldung
- **Navigation**: Schnellzugriff auf Hauptfunktionen

#### UnauthorizedComponent (`features/auth/unauthorized/`)
- **Zugriffsverweigerung**: Benutzerfreundliche Fehlerseite
- **Navigation**: Optionen zur Rückkehr oder Weiterleitung

### 4. Models

#### Auth Models (`core/models/auth.models.ts`)
- **TypeScript-Interfaces**: Typsichere Datenstrukturen
- **API-Kompatibilität**: Vollständige Kompatibilität mit Backend-API
- **State-Management**: Interfaces für Auth-State

## Routing-Konfiguration

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'customers', 
    loadChildren: () => import('./features/customers/customer.routes'),
    canActivate: [AuthGuard]
  },
  { 
    path: 'statistics', 
    component: StatisticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  }
];
```

## Sicherheitsfeatures

### 1. Token-Speicherung
- **LocalStorage**: Sichere Speicherung von Access- und Refresh-Tokens
- **Automatische Bereinigung**: Tokens werden beim Logout entfernt
- **Token-Dekodierung**: Extraktion von Benutzerinformationen aus JWT

### 2. Automatische Token-Erneuerung
- **Interceptor**: Überwacht 401-Fehler und erneuert automatisch Tokens
- **Transparent**: Benutzer bemerkt keine Unterbrechung
- **Fallback**: Weiterleitung zur Login-Seite bei fehlgeschlagener Erneuerung

### 3. Rollenbasierte Zugriffskontrolle
- **Route-Guards**: Schutz von Routen basierend auf Benutzerrollen
- **UI-Anpassung**: Verschiedene Funktionen je nach Rolle
- **Admin-Bereiche**: Exklusive Zugriffe für Administratoren

## Verwendung

### 1. Login
```typescript
// In einer Komponente
constructor(private authService: AuthService) {}

login(credentials: LoginRequest) {
  this.authService.login(credentials).subscribe({
    next: () => {
      // Erfolgreicher Login
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      // Fehlerbehandlung
      console.error('Login failed:', error);
    }
  });
}
```

### 2. Rollenprüfung
```typescript
// Prüfung auf Admin-Rolle
if (this.authService.isAdmin()) {
  // Admin-spezifische Logik
}

// Prüfung auf spezifische Rolle
if (this.authService.hasRole('ROLE_ADMIN')) {
  // Rollen-spezifische Logik
}
```

### 3. Authentifizierungsstatus
```typescript
// Observable für Auth-State
this.authService.authState$.subscribe(state => {
  if (state.isAuthenticated) {
    // Benutzer ist angemeldet
  }
});

// Synchroner Check
if (this.authService.isAuthenticated()) {
  // Benutzer ist angemeldet
}
```

## Styling

### Design-System
- **Moderne UI**: Clean Code Prinzipien mit einfachem, klarem Design
- **Responsive**: Mobile-first Ansatz mit Breakpoints
- **Konsistente Farben**: Einheitliches Farbschema (Blau-Violett Gradient)
- **Accessibility**: Barrierefreie Gestaltung mit korrekten Labels und Focus-States

### CSS-Features
- **Flexbox/Grid**: Moderne Layout-Techniken
- **CSS-Variablen**: Konsistente Farben und Abstände
- **Transitions**: Smooth Hover-Effekte und Animationen
- **Mobile-Optimierung**: Touch-friendly Buttons und Formulare

## Nächste Schritte

1. **Customer-Service**: Implementierung der Customer-API-Integration
2. **Error-Boundaries**: Globale Fehlerbehandlung
3. **Loading-States**: Verbesserte Lade-Indikatoren
4. **Offline-Support**: Service Worker für Offline-Funktionalität
5. **Testing**: Unit- und Integration-Tests
6. **Performance**: Lazy Loading und Code-Splitting optimieren

## Technische Details

### Abhängigkeiten
- Angular 17+ (Standalone Components)
- Angular Forms (Reactive Forms)
- Angular Router
- Angular HTTP Client

### Browser-Support
- Moderne Browser (Chrome, Firefox, Safari, Edge)
- ES2020+ Features
- LocalStorage API

### Performance
- Lazy Loading für Feature-Module
- Standalone Components für bessere Tree-Shaking
- Optimierte Bundle-Größe 