package eu.pierix.crmv3.domain;

/**
 * Status für Angebote
 */
public enum OfferStatus {
    DRAFT("Entwurf"),
    SENT("Versendet"),
    PAID("Bezahlt"),
    OVERDUE("Überfällig");

    private final String displayName;

    OfferStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 