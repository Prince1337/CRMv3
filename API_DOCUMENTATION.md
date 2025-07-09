# CRM v3 API Dokumentation

## Übersicht

Die CRM v3 API verwendet JWT (JSON Web Tokens) für die Authentifizierung. Alle geschützten Endpunkte erfordern einen gültigen JWT-Token im Authorization-Header.

## Authentifizierung

### 1. Registrierung

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "max.mustermann",
  "email": "max@example.com",
  "password": "sicheresPasswort123",
  "firstName": "Max",
  "lastName": "Mustermann"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Benutzer erfolgreich registriert",
  "userId": 1
}
```

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "usernameOrEmail": "max.mustermann",
  "password": "sicheresPasswort123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

### 3. Token-Verwendung

Nach dem Login muss der `accessToken` in allen nachfolgenden Requests im Authorization-Header mitgesendet werden:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Token-Erneuerung

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <refreshToken>
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```
"Erfolgreich ausgeloggt"
```

## Rollen und Berechtigungen

### Benutzerrollen:
- **ROLE_USER**: Standard-Benutzer
- **ROLE_ADMIN**: Administrator

### Berechtigungen:

| Endpunkt | USER | ADMIN | Beschreibung |
|----------|------|-------|--------------|
| `GET /api/customers` | ✅ | ✅ | Kundenliste abrufen |
| `POST /api/customers` | ✅ | ✅ | Neuen Kunden erstellen |
| `GET /api/customers/{id}` | ✅ | ✅ | Einzelnen Kunden abrufen |
| `PUT /api/customers/{id}` | ✅ | ✅ | Kunden bearbeiten |
| `DELETE /api/customers/{id}` | ❌ | ✅ | Kunden löschen |
| `PATCH /api/customers/{id}/assign` | ❌ | ✅ | Kunden zuweisen |
| `GET /api/customers/statistics` | ❌ | ✅ | Statistiken abrufen |

## Customer-Endpunkte

### 1. Kunden erstellen

**Endpoint:** `POST /api/customers`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "phone": "+49 123 456789",
  "mobile": "+49 987 654321",
  "companyName": "Muster GmbH",
  "position": "Geschäftsführer",
  "department": "Management",
  "street": "Musterstraße",
  "houseNumber": "123",
  "postalCode": "10115",
  "city": "Berlin",
  "country": "Deutschland",
  "website": "https://www.muster.de",
  "status": "ACTIVE",
  "source": "Website",
  "tags": "VIP,Interessent",
  "notes": "Interessiert an Premium-Paket",
  "internalNotes": "Follow-up in 2 Wochen",
  "assignedToId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "fullName": "Max Mustermann",
  "phone": "+49 123 456789",
  "mobile": "+49 987 654321",
  "companyName": "Muster GmbH",
  "position": "Geschäftsführer",
  "department": "Management",
  "street": "Musterstraße",
  "houseNumber": "123",
  "postalCode": "10115",
  "city": "Berlin",
  "country": "Deutschland",
  "website": "https://www.muster.de",
  "fullAddress": "Musterstraße 123, 10115 Berlin, Deutschland",
  "status": "ACTIVE",
  "statusDisplayName": "Aktiv",
  "source": "Website",
  "tags": "VIP,Interessent",
  "notes": "Interessiert an Premium-Paket",
  "internalNotes": "Follow-up in 2 Wochen",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "lastContact": null,
  "createdById": 1,
  "createdByFullName": "Admin User",
  "assignedToId": 1,
  "assignedToFullName": "Admin User"
}
```

### 2. Kunden abrufen

**Endpoint:** `GET /api/customers/{id}`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "firstName": "Max",
  "lastName": "Mustermann",
  "email": "max@example.com",
  "fullName": "Max Mustermann",
  "status": "ACTIVE",
  "statusDisplayName": "Aktiv",
  // ... weitere Felder wie oben
}
```

### 3. Kunden bearbeiten

**Endpoint:** `PUT /api/customers/{id}`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:** (gleiches Format wie beim Erstellen)

**Response (200 OK):** (gleiches Format wie beim Abrufen)

### 4. Kunden löschen (nur ADMIN)

**Endpoint:** `DELETE /api/customers/{id}`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (204 No Content):** Kein Body

### 5. Kundenliste mit Paginierung

**Endpoint:** `GET /api/customers?page=0&size=20&sortBy=createdAt&sortDirection=desc`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "firstName": "Max",
      "lastName": "Mustermann",
      "fullName": "Max Mustermann",
      "email": "max@example.com",
      "status": "ACTIVE",
      // ... weitere Felder
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "direction": "DESC"
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

### 6. Erweiterte Kunden-Suche

**Endpoint:** `POST /api/customers/search`

**Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Max",
  "email": "max@example.com",
  "company": "Muster",
  "city": "Berlin",
  "status": "ACTIVE",
  "tag": "VIP",
  "source": "Website",
  "assignedToId": 1,
  "createdById": 1,
  "page": 0,
  "size": 20,
  "sortBy": "createdAt",
  "sortDirection": "desc"
}
```

**Response (200 OK):** (gleiches Format wie bei der Kundenliste)

### 7. Kunden nach Status filtern

**Endpoint:** `GET /api/customers/status/{status}`

**Mögliche Status:** `ACTIVE`, `INACTIVE`, `POTENTIAL`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "firstName": "Max",
    "lastName": "Mustermann",
    "status": "ACTIVE",
    // ... weitere Felder
  }
]
```

### 8. Kundenstatus ändern

**Endpoint:** `PATCH /api/customers/{id}/status?status=ACTIVE`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):** (Customer-Objekt mit aktualisiertem Status)

### 9. Kunden als kontaktiert markieren

**Endpoint:** `PATCH /api/customers/{id}/contact`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):** (Customer-Objekt mit aktualisiertem lastContact)

### 10. Kunden zuweisen (nur ADMIN)

**Endpoint:** `PATCH /api/customers/{id}/assign?userId=2`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):** (Customer-Objekt mit aktualisiertem assignedTo)

### 11. Statistiken abrufen (nur ADMIN)

**Endpoint:** `GET /api/customers/statistics`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "totalCustomers": 150,
  "customersByStatus": {
    "Aktiv": 100,
    "Inaktiv": 30,
    "Potenziell": 20
  },
  "customersByCity": {
    "Berlin": 50,
    "Hamburg": 30,
    "München": 25
  },
  "customersBySource": {
    "Website": 80,
    "Empfehlung": 40,
    "Messe": 30
  },
  "activeCustomers": 100,
  "inactiveCustomers": 30,
  "potentialCustomers": 20
}
```

## Fehlerbehandlung

### HTTP-Status-Codes:

- **200 OK**: Erfolgreiche Operation
- **201 Created**: Ressource erfolgreich erstellt
- **204 No Content**: Erfolgreiche Operation ohne Rückgabedaten
- **400 Bad Request**: Ungültige Anfrage
- **401 Unauthorized**: Nicht authentifiziert
- **403 Forbidden**: Keine Berechtigung
- **404 Not Found**: Ressource nicht gefunden
- **500 Internal Server Error**: Server-Fehler

### Fehler-Response-Format:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Zugriff verweigert",
  "message": "Sie haben keine Berechtigung für diese Aktion",
  "path": "/api/customers/1"
}
```

## Frontend-Integration

### JavaScript/TypeScript Beispiel:

```typescript
class CustomerAPI {
  private baseUrl = 'http://localhost:8080/api';
  private token: string | null = null;

  // Login
  async login(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usernameOrEmail: username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data;
    } else {
      throw new Error('Login fehlgeschlagen');
    }
  }

  // Authentifizierten Request senden
  private async authenticatedRequest(url: string, options: RequestInit = {}) {
    if (!this.token) {
      this.token = localStorage.getItem('accessToken');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Token erneuern
      await this.refreshToken();
      // Request wiederholen
      return this.authenticatedRequest(url, options);
    }

    return response;
  }

  // Token erneuern
  private async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Kein Refresh-Token verfügbar');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      this.token = data.accessToken;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } else {
      // Refresh fehlgeschlagen, zur Login-Seite weiterleiten
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  // Kunden abrufen
  async getCustomers(page = 0, size = 20) {
    const response = await this.authenticatedRequest(
      `${this.baseUrl}/customers?page=${page}&size=${size}`
    );
    return response.json();
  }

  // Kunden erstellen
  async createCustomer(customerData: any) {
    const response = await this.authenticatedRequest(
      `${this.baseUrl}/customers`,
      {
        method: 'POST',
        body: JSON.stringify(customerData),
      }
    );
    return response.json();
  }

  // Kunden bearbeiten
  async updateCustomer(id: number, customerData: any) {
    const response = await this.authenticatedRequest(
      `${this.baseUrl}/customers/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(customerData),
      }
    );
    return response.json();
  }

  // Kunden löschen
  async deleteCustomer(id: number) {
    const response = await this.authenticatedRequest(
      `${this.baseUrl}/customers/${id}`,
      {
        method: 'DELETE',
      }
    );
    return response.status === 204;
  }

  // Logout
  async logout() {
    if (this.token) {
      await this.authenticatedRequest(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
      });
    }
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Verwendung
const api = new CustomerAPI();

// Login
await api.login('username', 'password');

// Kunden abrufen
const customers = await api.getCustomers();

// Neuen Kunden erstellen
const newCustomer = await api.createCustomer({
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com',
  status: 'ACTIVE'
});
```

## Sicherheitshinweise

1. **Token-Speicherung**: Tokens sollten sicher gespeichert werden (HttpOnly Cookies für Produktionsumgebungen)
2. **Token-Ablauf**: Access-Tokens haben eine begrenzte Gültigkeit (24 Stunden)
3. **HTTPS**: In Produktionsumgebungen sollte HTTPS verwendet werden
4. **CORS**: Die API ist für CORS konfiguriert, aber sollte in Produktion eingeschränkt werden
5. **Rate Limiting**: Implementieren Sie Rate Limiting für Login-Endpunkte
6. **Validierung**: Alle Eingaben werden serverseitig validiert 