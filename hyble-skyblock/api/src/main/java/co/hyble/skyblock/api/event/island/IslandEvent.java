package co.hyble.skyblock.api.event.island;

import co.hyble.skyblock.api.island.Island;
import org.bukkit.event.Event;
import org.jetbrains.annotations.NotNull;

/**
 * Base class for all island-related events.
 */
public abstract class IslandEvent extends Event {

    protected final Island island;

    /**
     * Creates a new island event.
     *
     * @param island the island involved in this event
     */
    protected IslandEvent(@NotNull Island island) {
        super(false);
        this.island = island;
    }

    /**
     * Creates a new island event.
     *
     * @param island the island involved in this event
     * @param async  whether this event is async
     */
    protected IslandEvent(@NotNull Island island, boolean async) {
        super(async);
        this.island = island;
    }

    /**
     * Gets the island involved in this event.
     *
     * @return the island
     */
    @NotNull
    public Island getIsland() {
        return island;
    }
}
