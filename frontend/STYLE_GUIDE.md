# Apple Design System - Style Guide

## Übersicht

Dieses Style Guide dokumentiert das Apple Design System, das für die CRM-Anwendung verwendet wird. Es basiert auf den Design-Prinzipien von Apple und bietet eine konsistente, moderne Benutzeroberfläche.

## Farben

### Primärfarben (Apple)
- `--apple-blue: #007AFF` - Hauptfarbe für Buttons und Links
- `--apple-blue-dark: #0056CC` - Hover-Zustand für blaue Elemente
- `--apple-green: #34C759` - Erfolg, Bestätigung
- `--apple-orange: #FF9500` - Warnung
- `--apple-red: #FF3B30` - Fehler, Löschen
- `--apple-purple: #AF52DE` - Akzente
- `--apple-pink: #FF2D92` - Spezielle Akzente
- `--apple-yellow: #FFCC02` - Hinweise

### Grautöne
- `--apple-gray-1: #F2F2F7` - Hintergrund
- `--apple-gray-2: #E5E5EA` - Rahmen, Trennlinien
- `--apple-gray-3: #D1D1D6` - Eingabefelder
- `--apple-gray-4: #C7C7CC` - Deaktiviert
- `--apple-gray-5: #AEAEB2` - Sekundärer Text
- `--apple-gray-6: #8E8E93` - Tertiärer Text
- `--apple-gray-7: #636366` - Beschriftungen
- `--apple-gray-8: #48484A` - Überschriften
- `--apple-gray-9: #3A3A3C` - Haupttext
- `--apple-gray-10: #2C2C2E` - Dunkler Text
- `--apple-gray-11: #1C1C1E` - Sehr dunkler Text

## Typografie

### Schriftart
```scss
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Schriftgrößen
- `--font-size-xs: 0.75rem` (12px)
- `--font-size-sm: 0.875rem` (14px)
- `--font-size-base: 1rem` (16px)
- `--font-size-lg: 1.125rem` (18px)
- `--font-size-xl: 1.25rem` (20px)
- `--font-size-2xl: 1.5rem` (24px)
- `--font-size-3xl: 1.875rem` (30px)
- `--font-size-4xl: 2.25rem` (36px)

## Abstände

### Spacing Scale
- `--spacing-xs: 0.25rem` (4px)
- `--spacing-sm: 0.5rem` (8px)
- `--spacing-md: 1rem` (16px)
- `--spacing-lg: 1.5rem` (24px)
- `--spacing-xl: 2rem` (32px)
- `--spacing-2xl: 3rem` (48px)

## Border Radius

- `--radius-sm: 6px` - Kleine Elemente
- `--radius-md: 8px` - Buttons, Eingabefelder
- `--radius-lg: 12px` - Karten, Container
- `--radius-xl: 16px` - Große Container

## Schatten

- `--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)` - Subtile Schatten
- `--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)` - Standard Schatten
- `--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)` - Hover-Effekte
- `--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)` - Modale, Overlays

## Komponenten

### Buttons

#### Grundlegende Button-Klassen
```scss
.btn-primary    // Blaue Hauptbuttons
.btn-secondary  // Graue Sekundärbuttons
.btn-success    // Grüne Erfolgsbuttons
.btn-danger     // Rote Gefahrenbuttons
```

#### Button-Größen
```scss
.btn-sm         // Kleine Buttons
.btn            // Standard Buttons
.btn-lg         // Große Buttons
```

#### Verwendung
```html
<button class="btn btn-primary">Speichern</button>
<button class="btn btn-secondary btn-sm">Abbrechen</button>
```

### Formulare

#### Formular-Gruppen
```scss
.form-group     // Container für Label + Input
.form-control   // Eingabefelder (input, select, textarea)
.form-row       // Grid-Layout für Formularzeilen
.form-actions   // Container für Formular-Aktionen
```

#### Verwendung
```html
<div class="form-group">
  <label>Name</label>
  <input class="form-control" type="text">
</div>

<div class="form-row">
  <div class="form-group">
    <label>Vorname</label>
    <input class="form-control" type="text">
  </div>
  <div class="form-group">
    <label>Nachname</label>
    <input class="form-control" type="text">
  </div>
</div>
```

### Karten

#### Karten-Klassen
```scss
.card           // Standard Karte mit Schatten
.card-header    // Karten-Header mit Flexbox
```

#### Verwendung
```html
<div class="card">
  <div class="card-header">
    <h2>Kundenliste</h2>
    <button class="btn btn-primary">Neuer Kunde</button>
  </div>
  <div class="card-content">
    <!-- Inhalt -->
  </div>
</div>
```

### Tabellen

#### Tabellen-Klassen
```scss
.table-container  // Container mit Schatten und Border-Radius
.table           // Standard Tabelle
```

#### Verwendung
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Max Mustermann</td>
        <td>max@example.com</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

#### Badge-Klassen
```scss
.badge-success   // Grüne Badges
.badge-warning   // Orange Badges
.badge-danger    // Rote Badges
.badge-info      // Blaue Badges
```

#### Verwendung
```html
<span class="badge badge-success">Aktiv</span>
<span class="badge badge-warning">Wartend</span>
```

### Alerts

#### Alert-Klassen
```scss
.alert-success   // Erfolgsmeldungen
.alert-warning   // Warnmeldungen
.alert-error     // Fehlermeldungen
.alert-info      // Informationsmeldungen
```

#### Verwendung
```html
<div class="alert alert-success">
  Kunde erfolgreich gespeichert!
</div>
```

### Loading

#### Loading-Komponente
```scss
.loading        // Container für Loading-Zustände
.spinner        // Rotierender Spinner
```

#### Verwendung
```html
<div class="loading">
  <div class="spinner"></div>
  <p>Lade Daten...</p>
</div>
```

## Layout-Klassen

### Container
```scss
.page-container  // Hauptcontainer mit Padding und Max-Width
.app-container   // Vollhöhe App-Container
```

### Flexbox Utilities
```scss
.d-flex         // display: flex
.justify-between // justify-content: space-between
.justify-center  // justify-content: center
.justify-end     // justify-content: flex-end
.align-center    // align-items: center
.align-start     // align-items: flex-start
.align-end       // align-items: flex-end
```

### Grid Utilities
```scss
.d-grid         // display: grid
```

### Spacing Utilities
```scss
.mb-0, .mb-sm, .mb-md, .mb-lg, .mb-xl  // margin-bottom
.mt-0, .mt-sm, .mt-md, .mt-lg, .mt-xl  // margin-top
.gap-sm, .gap-md, .gap-lg               // gap
```

### Text Utilities
```scss
.text-center    // text-align: center
.text-left      // text-align: left
.text-right     // text-align: right
```

### Width/Height
```scss
.w-full         // width: 100%
.h-full         // height: 100%
```

## Responsive Design

### Breakpoints
- Mobile: `< 480px`
- Tablet: `< 768px`
- Desktop: `≥ 768px`

### Responsive Verhalten
- Formulare werden auf mobilen Geräten einspaltig
- Navigation wird auf mobilen Geräten vertikal angeordnet
- Tabellen bekommen horizontales Scrollen auf kleinen Bildschirmen

## Best Practices

### 1. Konsistente Verwendung
Verwende immer die vordefinierten Klassen anstatt inline-Styles:
```html
<!-- ✅ Richtig -->
<button class="btn btn-primary">Speichern</button>

<!-- ❌ Falsch -->
<button style="background: blue; padding: 10px;">Speichern</button>
```

### 2. Semantische Struktur
Verwende die richtigen HTML-Elemente mit den entsprechenden Klassen:
```html
<!-- ✅ Richtig -->
<div class="form-group">
  <label>Email</label>
  <input class="form-control" type="email">
</div>

<!-- ❌ Falsch -->
<div>
  <span>Email</span>
  <input style="width: 100%;">
</div>
```

### 3. Accessibility
Stelle sicher, dass alle interaktiven Elemente fokussierbar sind und entsprechende Hover/Focus-States haben.

### 4. Performance
Die CSS-Variablen werden nur einmal definiert und wiederverwendet, was die Performance verbessert.

## Komponenten-Entwicklung

### Neue Komponenten erstellen
1. Verwende die bestehenden globalen Klassen als Basis
2. Erstelle spezifische Klassen nur wenn nötig
3. Verwende CSS-Variablen für Farben, Abstände und Schriftgrößen
4. Teste auf verschiedenen Bildschirmgrößen

### Beispiel für eine neue Komponente
```scss
// Neue Komponente
.user-card {
  @extend .card;
  
  .user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .user-info {
    h3 {
      color: var(--apple-gray-11);
      font-size: var(--font-size-lg);
      margin-bottom: var(--spacing-sm);
    }
    
    p {
      color: var(--apple-gray-6);
      font-size: var(--font-size-sm);
    }
  }
}
```

## Migration von bestehenden Styles

### Vor der Migration
```scss
.old-button {
  background: #3b82f6;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
}
```

### Nach der Migration
```scss
.new-button {
  @extend .btn;
  @extend .btn-primary;
}
```

Diese Migration stellt sicher, dass alle Komponenten das einheitliche Apple Design System verwenden und konsistent aussehen. 