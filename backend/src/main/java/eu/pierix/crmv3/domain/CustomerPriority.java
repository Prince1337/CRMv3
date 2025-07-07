package eu.pierix.crmv3.domain;

/**
 * Enum für Kunden-Prioritäten in der Pipeline
 */
public enum CustomerPriority {
    LOW("Niedrig"),
    MEDIUM("Mittel"),
    HIGH("Hoch"),
    VIP("VIP");

    private final String displayName;

    CustomerPriority(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 