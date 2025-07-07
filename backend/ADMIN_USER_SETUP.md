# Admin-User Setup

## Übersicht

Das CRM-System erstellt automatisch einen Admin-User beim ersten Start. Dieser User hat volle Administratorrechte und kann alle Funktionen des Systems nutzen.

## Standard-Konfiguration

Der Admin-User wird mit folgenden Standardwerten erstellt:

- **Username:** `admin`
- **Email:** `admin@crmv3.de`
- **Name:** `Max Mustermann`
- **Passwort:** `admin123`
- **Rolle:** `ADMIN`

## Konfiguration über Umgebungsvariablen

Sie können die Admin-User-Konfiguration über Umgebungsvariablen anpassen:

```bash
# Admin-User aktivieren/deaktivieren
ADMIN_USER_ENABLED=true

# Admin-User Credentials
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@crmv3.de
ADMIN_FIRST_NAME=Max
ADMIN_LAST_NAME=Mustermann
ADMIN_PASSWORD=admin123
```

## Sicherheitshinweise

### ⚠️ WICHTIG: Passwort ändern!

Nach dem ersten Login sollten Sie das Standard-Passwort unbedingt ändern:

1. Loggen Sie sich mit den Standard-Credentials ein
2. Gehen Sie zu den Benutzereinstellungen
3. Ändern Sie das Passwort auf ein sicheres Passwort

### Produktionsumgebung

Für Produktionsumgebungen sollten Sie:

1. **Sichere Passwörter verwenden:**
   ```bash
   ADMIN_PASSWORD=IhrSicheresPasswort123!
   ```

2. **Admin-User nach Setup deaktivieren:**
   ```bash
   ADMIN_USER_ENABLED=false
   ```

3. **Eigene Admin-User über die Benutzeroberfläche erstellen**

## Verhalten

- Der Admin-User wird nur beim **ersten Start** erstellt
- Wenn bereits ein User mit dem konfigurierten Username existiert, wird kein neuer Admin-User erstellt
- Wenn bereits ein User mit der konfigurierten Email existiert, wird kein neuer Admin-User erstellt
- Die Initialisierung kann über `ADMIN_USER_ENABLED=false` deaktiviert werden

## Logs

Die Admin-User-Initialisierung wird in den Logs dokumentiert:

```
✅ Admin-User erfolgreich erstellt:
   Username: admin
   Email: admin@crmv3.de
   Name: Max Mustermann
   Rolle: ADMIN
   ⚠️  Bitte ändern Sie das Passwort nach dem ersten Login!
```

## Troubleshooting

### Admin-User wird nicht erstellt

1. Prüfen Sie die Logs auf Fehlermeldungen
2. Stellen Sie sicher, dass `ADMIN_USER_ENABLED=true` ist
3. Prüfen Sie, ob bereits ein User mit dem Username/Email existiert

### Passwort vergessen

Falls Sie das Admin-Passwort vergessen haben:

1. Stoppen Sie die Anwendung
2. Setzen Sie das Passwort in der Datenbank zurück:
   ```sql
   UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
   WHERE username = 'admin';
   ```
3. Starten Sie die Anwendung neu
4. Loggen Sie sich mit `admin123` ein
5. Ändern Sie das Passwort sofort

## Beispiel: Docker Compose

```yaml
version: '3.8'
services:
  crm-backend:
    image: crm-backend:latest
    environment:
      - ADMIN_USER_ENABLED=true
      - ADMIN_USERNAME=admin
      - ADMIN_EMAIL=admin@crmv3.de
      - ADMIN_FIRST_NAME=Max
      - ADMIN_LAST_NAME=Mustermann
      - ADMIN_PASSWORD=IhrSicheresPasswort123!
    ports:
      - "8080:8080"
``` 