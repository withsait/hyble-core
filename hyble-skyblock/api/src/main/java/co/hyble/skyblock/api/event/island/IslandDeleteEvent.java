package co.hyble.skyblock.api.event.island;

import co.hyble.skyblock.api.island.Island;
import co.hyble.skyblock.api.player.SkyblockPlayer;
import org.bukkit.event.Cancellable;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

/**
 * Called when an island is being deleted.
 * <p>
 * This event is cancellable. If cancelled, the island will not be deleted.
 * </p>
 */
public class IslandDeleteEvent extends IslandEvent implements Cancellable {

    private static final HandlerList HANDLERS = new HandlerList();

    private final SkyblockPlayer deleter;
    private final DeleteReason reason;
    private boolean cancelled;

    /**
     * Creates a new island delete event.
     *
     * @param island  the island being deleted
     * @param deleter the player deleting the island, or null if deleted by console/system
     * @param reason  the reason for deletion
     */
    public IslandDeleteEvent(@NotNull Island island, @Nullable SkyblockPlayer deleter, @NotNull DeleteReason reason) {
        super(island);
        this.deleter = deleter;
        this.reason = reason;
    }

    /**
     * Gets the player deleting the island.
     *
     * @return the deleter, or null if deleted by console/system
     */
    @Nullable
    public SkyblockPlayer getDeleter() {
        return deleter;
    }

    /**
     * Gets the reason for deletion.
     *
     * @return the delete reason
     */
    @NotNull
    public DeleteReason getReason() {
        return reason;
    }

    @Override
    public boolean isCancelled() {
        return cancelled;
    }

    @Override
    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
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
     * Reasons for island deletion.
     */
    public enum DeleteReason {
        /**
         * The island owner chose to delete the island.
         */
        OWNER_REQUEST,

        /**
         * An admin deleted the island.
         */
        ADMIN,

        /**
         * The island was deleted due to inactivity.
         */
        INACTIVITY,

        /**
         * The island was deleted by the system (e.g., cleanup).
         */
        SYSTEM
    }
}
