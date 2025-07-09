package eu.pierix.crmv3.domain;

/**
 * Enum für Lead-Quellen in der Pipeline
 */
public enum LeadSource {
    WEBSITE("Website"),
    REFERRAL("Empfehlung"),
    TRADE_FAIR("Messe"),
    SOCIAL_MEDIA("Social Media"),
    EMAIL_CAMPAIGN("E-Mail Kampagne"),
    COLD_CALL("Kaltakquise"),
    PHONE_CALL("Telefonanruf"),
    LINKEDIN("LinkedIn"),
    PARTNER("Partner"),
    OTHER("Sonstiges");

    private final String displayName;

    LeadSource(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
} 