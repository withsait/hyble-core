package co.hyble.skyblock.api.event.island;

import co.hyble.skyblock.api.island.Island;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;

/**
 * Called when an island is loaded into memory.
 * <p>
 * This event is not cancellable.
 * </p>
 */
public class IslandLoadEvent extends IslandEvent {

    private static final HandlerList HANDLERS = new HandlerList();

    private final LoadReason reason;

    /**
     * Creates a new island load event.
     *
     * @param island the island being loaded
     * @param reason the reason for loading
     */
    public IslandLoadEvent(@NotNull Island island, @NotNull LoadReason reason) {
        super(island, true); // Async since loading happens off main thread
        this.reason = reason;
    }

    /**
     * Gets the reason the island was loaded.
     *
     * @return the load reason
     */
    @NotNull
    public LoadReason getReason() {
        return reason;
    }

    @NotNull
    @Override
    public HandlerList getHandlers() {
        return HANDLERS;
    }

    @NotNull
    public static HandlerList getHandlerList() {
        return HANDLERS;
    }

    /**
     * Reasons for island loading.
     */
    public enum LoadReason {
        /**
         * A member of the island logged in.
         */
        MEMBER_LOGIN,

        /**
         * A player teleported to the island.
         */
        TELEPORT,

        /**
         * The island was loaded by an admin.
         */
        ADMIN,

        /**
         * The island was loaded during server startup.
         */
        STARTUP,

        /**
         * The island was loaded due to world activity.
         */
        WORLD_ACTIVITY,

        /**
         * The island was loaded for another reason.
         */
        OTHER
    }
}
