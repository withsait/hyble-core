package co.hyble.skyblock.api.event.island;

import co.hyble.skyblock.api.island.Island;
import co.hyble.skyblock.api.player.SkyblockPlayer;
import org.bukkit.event.Cancellable;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;

/**
 * Called when a new island is being created.
 * <p>
 * This event is cancellable. If cancelled, the island will not be created.
 * </p>
 */
public class IslandCreateEvent extends IslandEvent implements Cancellable {

    private static final HandlerList HANDLERS = new HandlerList();

    private final SkyblockPlayer creator;
    private boolean cancelled;

    /**
     * Creates a new island create event.
     *
     * @param island  the island being created
     * @param creator the player creating the island
     */
    public IslandCreateEvent(@NotNull Island island, @NotNull SkyblockPlayer creator) {
        super(island);
        this.creator = creator;
    }

    /**
     * Gets the player creating the island.
     *
     * @return the creator
     */
    @NotNull
    public SkyblockPlayer getCreator() {
        return creator;
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
}
