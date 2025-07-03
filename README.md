# CRM v3 - Portfolio Projekt

Ein modernes Customer Relationship Management (CRM) System, entwickelt als Portfolio-Projekt mit Spring Boot Backend und Angular Frontend.

## 🎯 Projektziel

Dieses CRM-System ist als **Minimum Viable Product (MVP)** konzipiert und richtet sich an kleine Unternehmen und Freelancer. Es bietet alle wesentlichen Funktionen für eine effiziente Kundenverwaltung und Vertriebssteuerung.

## 🚀 Hauptfunktionen

### 1. Kundenverwaltung
- **Kunden anlegen, bearbeiten und löschen**
- **Erweiterte Kundenlisten** mit Filter- und Suchfunktionen
- **Status-basierte Gruppierung** (aktiv, inaktiv, potenziell)
- **Vollständige Kontaktdaten** und Firmeninformationen
- **Notizen und Dokumentation** pro Kunde

### 2. Kontaktmanagement
- **Kontakte zuweisen** und verwalten
- **Kommunikationsverlauf** dokumentieren (Telefonate, E-Mails, Meetings)
- **Notizen und Follow-ups** zu Kontakten speichern

### 3. Vertriebs-Pipeline & Lead-Tracking
- **Leads erfassen** mit Quelle und Status
- **Pipeline-Management** mit Status-Tracking:
  - Neu → Kontaktiert → Angebot erstellt → Gewonnen/Verloren
- **Kanban-Ansicht** mit Drag & Drop Funktionalität

### 4. Aufgaben- und Terminmanagement
- **Aufgaben zuweisen** an Kunden oder Leads
- **Prioritäten und Fälligkeitsdaten** setzen
- **Erinnerungssystem** per E-Mail oder In-App

### 5. Angebots- und Rechnungsverwaltung
- **Angebote und Rechnungen** erstellen
- **PDF-Generierung** für Dokumente
- **Status-Tracking**: Entwurf → Versendet → Bezahlt → Überfällig
- **MwSt-Verwaltung** und Positionsverwaltung

### 6. Benutzerverwaltung
- **JWT-basierte Authentifizierung**
- **Rollenbasierte Zugriffssteuerung**:
  - Admin: Vollzugriff
  - Sales: Vertriebsmodule
  - Support: Support-Module

### 7. Dashboards & Analytics
- **Übersichtsdashboard** mit KPIs
- **Umsatzstatistiken** nach Monaten
- **Lead-Konversionsraten**
- **Offene Aufgaben und Leads**

## 🛠️ Technologie-Stack

### Backend
- **Spring Boot 3.x** - Java Framework
- **Spring Security** - Authentifizierung & Autorisierung
- **Spring Data JPA** - Datenbankzugriff
- **JWT** - Token-basierte Authentifizierung
- **Gradle** - Build-Tool

### Frontend
- **Angular 17** - TypeScript Framework
- **Angular Material** - UI-Komponenten
- **RxJS** - Reaktive Programmierung
- **Angular Router** - Navigation

### Datenbank
- **H2** (Development) / **PostgreSQL** (Production)

### DevOps
- **Docker** - Containerisierung
- **Docker Compose** - Multi-Container Setup

## 📁 Projektstruktur

```
CRM v3/
├── backend/                 # Spring Boot Backend
│   ├── src/main/java/
│   │   └── eu/pierix/crmv3/
│   │       ├── application/  # Anwendungsschicht
│   │       ├── domain/       # Domänenmodelle
│   │       ├── infrastructure/ # Infrastrukturschicht
│   │       └── web/          # Web-Controller
│   └── src/main/resources/  # Konfiguration
├── frontend/                # Angular Frontend
│   ├── src/app/
│   │   ├── core/            # Core-Module
│   │   ├── features/        # Feature-Module
│   │   └── shared/          # Shared-Komponenten
│   └── src/assets/          # Statische Assets
└── docker-compose.yml       # Container-Orchestrierung
```

## 🚀 Installation & Setup

### Voraussetzungen
- Java 17+
- Node.js 18+
- Docker & Docker Compose

### Backend starten
```bash
cd backend
./gradlew bootRun
```

### Frontend starten
```bash
cd frontend
npm install
ng serve
```

### Mit Docker
```bash
docker-compose up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
./gradlew test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## 📊 Architektur-Prinzipien

Dieses Projekt folgt bewährten Software-Entwicklungsprinzipien:

- **YAGNI (You Ain't Gonna Need It)** - Nur implementieren, was aktuell benötigt wird
- **KISS (Keep It Simple, Stupid)** - Klarer, einfacher Code
- **Dependency Inversion Principle** - Abhängigkeiten von Abstraktionen
- **Component Orientation** - Unabhängige, wiederverwendbare Komponenten
- **Test-First Development** - Tests vor Implementierung

## 🔄 Entwicklungsmethodik

- **Incremental Development** - Kleine, funktionale Inkremente
- **Iterative Development** - Regelmäßige Feedback-Zyklen
- **Continuous Integration** - Automatisierte Tests und Builds
- **Issue Tracking** - Dokumentierte Feature-Entwicklung

## 📈 Roadmap

### Phase 1 (MVP) ✅
- [x] Benutzerauthentifizierung
- [x] Grundlegende Kundenverwaltung
- [ ] Kontaktmanagement
- [ ] Lead-Tracking

### Phase 2
- [ ] Aufgabenmanagement
- [ ] Angebotsverwaltung
- [ ] Dashboard & Analytics

### Phase 3
- [ ] Rechnungsverwaltung
- [ ] Erweiterte Berichte
- [ ] API-Dokumentation

## 🤝 Beitragen

Dies ist ein Portfolio-Projekt zur Demonstration von Full-Stack-Entwicklungskompetenzen. Feedback und Verbesserungsvorschläge sind willkommen!

## 📄 Lizenz

Dieses Projekt dient ausschließlich Portfolio-Zwecken.

---

**Entwickelt mit ❤️ für moderne CRM-Lösungen** 