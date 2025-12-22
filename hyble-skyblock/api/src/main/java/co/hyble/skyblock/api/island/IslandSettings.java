package co.hyble.skyblock.api.island;

/**
 * Represents configurable island settings.
 */
public enum IslandSettings {

    /**
     * Whether PvP is enabled on the island.
     */
    PVP("PvP", false),

    /**
     * Whether mob spawning is enabled.
     */
    MOB_SPAWNING("Mob Spawning", true),

    /**
     * Whether animal spawning is enabled.
     */
    ANIMAL_SPAWNING("Animal Spawning", true),

    /**
     * Whether monster spawning is enabled.
     */
    MONSTER_SPAWNING("Monster Spawning", true),

    /**
     * Whether the island is locked (no visitors allowed).
     */
    LOCKED("Island Lock", false),

    /**
     * Whether fire spread is enabled.
     */
    FIRE_SPREAD("Fire Spread", false),

    /**
     * Whether TNT damage is enabled.
     */
    TNT_DAMAGE("TNT Damage", false),

    /**
     * Whether creeper damage is enabled.
     */
    CREEPER_DAMAGE("Creeper Damage", false),

    /**
     * Whether enderman griefing is enabled.
     */
    ENDERMAN_GRIEFING("Enderman Griefing", false),

    /**
     * Whether visitors can use portals.
     */
    VISITOR_PORTAL("Visitor Portal Access", true),

    /**
     * Whether visitors can drop items.
     */
    VISITOR_DROP("Visitor Item Drop", true),

    /**
     * Whether visitors can pick up items.
     */
    VISITOR_PICKUP("Visitor Item Pickup", false);

    private final String displayName;
    private final boolean defaultValue;

    IslandSettings(String displayName, boolean defaultValue) {
        this.displayName = displayName;
        this.defaultValue = defaultValue;
    }

    /**
     * Gets the display name of this setting.
     *
     * @return the display name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Gets the default value of this setting.
     *
     * @return the default value
     */
    public boolean getDefaultValue() {
        return defaultValue;
    }
}
