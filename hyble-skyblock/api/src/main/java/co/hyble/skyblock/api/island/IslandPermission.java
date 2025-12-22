package co.hyble.skyblock.api.island;

/**
 * Represents permissions that can be granted to island members or visitors.
 */
public enum IslandPermission {

    /**
     * Permission to break blocks on the island.
     */
    BREAK("Break blocks"),

    /**
     * Permission to place blocks on the island.
     */
    PLACE("Place blocks"),

    /**
     * Permission to interact with blocks (doors, buttons, levers, etc.).
     */
    INTERACT("Interact with blocks"),

    /**
     * Permission to open containers (chests, barrels, etc.).
     */
    CONTAINER("Open containers"),

    /**
     * Permission to spawn animals on the island.
     */
    SPAWN_ANIMALS("Spawn animals"),

    /**
     * Permission to kill animals on the island.
     */
    KILL_ANIMALS("Kill animals"),

    /**
     * Permission to spawn monsters on the island.
     */
    SPAWN_MONSTERS("Spawn monsters"),

    /**
     * Permission to kill monsters on the island.
     */
    KILL_MONSTERS("Kill monsters"),

    /**
     * Permission to use redstone components.
     */
    REDSTONE("Use redstone"),

    /**
     * Permission to use vehicles (boats, minecarts).
     */
    VEHICLE("Use vehicles"),

    /**
     * Permission to invite new members.
     */
    INVITE("Invite members"),

    /**
     * Permission to kick members.
     */
    KICK("Kick members"),

    /**
     * Permission to set island home locations.
     */
    SET_HOME("Set home"),

    /**
     * Permission to change island settings.
     */
    SETTINGS("Change settings"),

    /**
     * Permission to manage member roles.
     */
    PROMOTE("Manage roles"),

    /**
     * Permission to access the island bank.
     */
    BANK("Access bank"),

    /**
     * Permission to use island warps.
     */
    WARP("Use warps"),

    /**
     * Permission to create and manage warps.
     */
    MANAGE_WARPS("Manage warps");

    private final String displayName;

    IslandPermission(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Gets the display name of this permission.
     *
     * @return the display name
     */
    public String getDisplayName() {
        return displayName;
    }
}
