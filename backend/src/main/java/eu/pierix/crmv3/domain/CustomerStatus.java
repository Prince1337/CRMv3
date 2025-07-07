package eu.pierix.crmv3.domain;

/**
 * Enum für die verschiedenen Kundenstatus
 * Erweitert um Vertriebs-Pipeline Status für Lead-Tracking
 */
public enum CustomerStatus {
    // Bestehende Status
    ACTIVE("Aktiv"),
    INACTIVE("Inaktiv"),
    POTENTIAL("Potenziell"),
    
    // Vertriebs-Pipeline Status
    NEW("Neu"),
    CONTACTED("Kontaktiert"),
    OFFER_CREATED("Angebot erstellt"),
    WON("Gewonnen"),
    LOST("Verloren");

    private final String displayName;

    CustomerStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Prüft ob der Status zur Pipeline gehört
     */
    public boolean isPipelineStatus() {
        return this == NEW || this == CONTACTED || this == OFFER_CREATED || this == WON || this == LOST;
    }
    
    /**
     * Gibt die nächsten möglichen Status in der Pipeline zurück
     */
    public CustomerStatus[] getNextPossibleStatuses() {
        switch (this) {
            case NEW:
                return new CustomerStatus[]{CONTACTED, LOST};
            case CONTACTED:
                return new CustomerStatus[]{OFFER_CREATED, LOST};
            case OFFER_CREATED:
                return new CustomerStatus[]{WON, LOST};
            case WON:
                return new CustomerStatus[]{ACTIVE};
            case LOST:
                return new CustomerStatus[]{POTENTIAL};
            default:
                return new CustomerStatus[]{};
        }
    }
} 