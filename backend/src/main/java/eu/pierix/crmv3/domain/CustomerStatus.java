package eu.pierix.crmv3.domain;

/**
 * Enum für die verschiedenen Kundenstatus
 */
public enum CustomerStatus {
    ACTIVE("Aktiv"),
    INACTIVE("Inaktiv"),
    POTENTIAL("Potenziell");

    private final String displayName;

    CustomerStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 