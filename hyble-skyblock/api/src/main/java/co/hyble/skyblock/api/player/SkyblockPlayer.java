package co.hyble.skyblock.api.player;

import co.hyble.skyblock.api.island.Island;
import co.hyble.skyblock.api.island.IslandRole;
import net.kyori.adventure.text.Component;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Represents a player in the Skyblock system.
 */
public interface SkyblockPlayer {

    /**
     * Gets the UUID of this player.
     *
     * @return the player UUID
     */
    @NotNull
    UUID getUniqueId();

    /**
     * Gets the name of this player.
     *
     * @return the player name
     */
    @NotNull
    String getName();

    /**
     * Gets the Bukkit player, if online.
     *
     * @return the Bukkit player, or empty if offline
     */
    @NotNull
    Optional<Player> getPlayer();

    /**
     * Checks if this player is online.
     *
     * @return true if online
     */
    boolean isOnline();

    /**
     * Gets the island this player belongs to.
     *
     * @return the player's island, or empty if none
     */
    @NotNull
    Optional<Island> getIsland();

    /**
     * Gets the UUID of the island this player belongs to.
     *
     * @return the island UUID, or empty if none
     */
    @NotNull
    Optional<UUID> getIslandId();

    /**
     * Checks if this player has an island.
     *
     * @return true if the player has an island
     */
    boolean hasIsland();

    /**
     * Gets the role of this player on their island.
     *
     * @return the island role, or VISITOR if no island
     */
    @NotNull
    IslandRole getRole();

    /**
     * Sets the player's island.
     *
     * @param island the island to set, or null to clear
     * @param role   the role on the island
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setIsland(@Nullable Island island, @NotNull IslandRole role);

    /**
     * Sets the player's role on their current island.
     *
     * @param role the new role
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setRole(@NotNull IslandRole role);

    /**
     * Gets the time when this player joined their current island.
     *
     * @return the join instant, or empty if no island
     */
    @NotNull
    Optional<Instant> getJoinedIslandAt();

    /**
     * Gets the last time this player was seen online.
     *
     * @return the last seen instant
     */
    @NotNull
    Instant getLastSeen();

    /**
     * Updates the last seen time to now.
     */
    void updateLastSeen();

    /**
     * Sends a message to this player.
     *
     * @param message the message component
     */
    void sendMessage(@NotNull Component message);

    /**
     * Teleports this player to their island home.
     *
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> teleportToIsland();

    /**
     * Checks if this player is currently on their island.
     *
     * @return true if on their island
     */
    boolean isOnIsland();

    /**
     * Gets the island the player is currently standing on.
     *
     * @return the island, or empty if not on any island
     */
    @NotNull
    Optional<Island> getCurrentIsland();
}
