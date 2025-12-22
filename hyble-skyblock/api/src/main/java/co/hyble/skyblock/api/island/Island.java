package co.hyble.skyblock.api.island;

import co.hyble.skyblock.api.player.SkyblockPlayer;
import co.hyble.skyblock.api.team.IslandTeam;
import org.bukkit.Location;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Represents a Skyblock island.
 */
public interface Island {

    /**
     * Gets the unique identifier of this island.
     *
     * @return the island UUID
     */
    @NotNull
    UUID getId();

    /**
     * Gets the UUID of the island owner.
     *
     * @return the owner's UUID
     */
    @NotNull
    UUID getOwner();

    /**
     * Sets the owner of this island.
     *
     * @param owner the new owner's UUID
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setOwner(@NotNull UUID owner);

    /**
     * Gets the name of this island.
     *
     * @return the island name, or empty if not set
     */
    @NotNull
    Optional<String> getName();

    /**
     * Sets the name of this island.
     *
     * @param name the new name, or null to clear
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setName(@Nullable String name);

    /**
     * Gets the center X coordinate of this island in the grid.
     *
     * @return the center X coordinate
     */
    int getCenterX();

    /**
     * Gets the center Z coordinate of this island in the grid.
     *
     * @return the center Z coordinate
     */
    int getCenterZ();

    /**
     * Gets the size (radius) of this island.
     *
     * @return the island size
     */
    int getSize();

    /**
     * Sets the size (radius) of this island.
     *
     * @param size the new size
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setSize(int size);

    /**
     * Gets the center location of this island.
     *
     * @return the center location
     */
    @NotNull
    Location getCenter();

    /**
     * Gets the minimum corner of this island's protected area.
     *
     * @return the minimum corner location
     */
    @NotNull
    Location getMinimum();

    /**
     * Gets the maximum corner of this island's protected area.
     *
     * @return the maximum corner location
     */
    @NotNull
    Location getMaximum();

    /**
     * Checks if a location is within this island's boundaries.
     *
     * @param location the location to check
     * @return true if the location is within the island
     */
    boolean contains(@NotNull Location location);

    /**
     * Gets the team for this island.
     *
     * @return the island team
     */
    @NotNull
    IslandTeam getTeam();

    /**
     * Gets the home location with the given name.
     *
     * @param name the home name (use "default" for the main home)
     * @return the home location, or empty if not set
     */
    @NotNull
    Optional<Location> getHome(@NotNull String name);

    /**
     * Gets the default home location.
     *
     * @return the default home location, or the island center if not set
     */
    @NotNull
    Location getHome();

    /**
     * Sets a home location.
     *
     * @param name     the home name
     * @param location the location
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setHome(@NotNull String name, @NotNull Location location);

    /**
     * Deletes a home location.
     *
     * @param name the home name
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> deleteHome(@NotNull String name);

    /**
     * Gets all home locations.
     *
     * @return an unmodifiable map of home names to locations
     */
    @NotNull
    Map<String, Location> getHomes();

    /**
     * Gets a setting value.
     *
     * @param setting the setting to get
     * @return the setting value
     */
    boolean getSetting(@NotNull IslandSettings setting);

    /**
     * Sets a setting value.
     *
     * @param setting the setting to set
     * @param value   the new value
     * @return a future that completes when the operation is done
     */
    @NotNull
    CompletableFuture<Void> setSetting(@NotNull IslandSettings setting, boolean value);

    /**
     * Gets the creation time of this island.
     *
     * @return the creation instant
     */
    @NotNull
    Instant getCreatedAt();

    /**
     * Gets the last activity time of this island.
     *
     * @return the last activity instant
     */
    @NotNull
    Instant getLastActivity();

    /**
     * Updates the last activity time to now.
     */
    void updateLastActivity();

    /**
     * Checks if this island is currently loaded in memory.
     *
     * @return true if loaded
     */
    boolean isLoaded();

    /**
     * Gets all players currently on this island.
     *
     * @return a set of players on the island
     */
    @NotNull
    Set<SkyblockPlayer> getPlayersOnIsland();

    /**
     * Checks if a player has a specific permission on this island.
     *
     * @param player     the player to check
     * @param permission the permission to check
     * @return true if the player has the permission
     */
    boolean hasPermission(@NotNull UUID player, @NotNull IslandPermission permission);

    /**
     * Teleports a player to this island's home.
     *
     * @param player the player to teleport
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> teleport(@NotNull SkyblockPlayer player);

    /**
     * Teleports a player to a specific home on this island.
     *
     * @param player   the player to teleport
     * @param homeName the name of the home
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> teleport(@NotNull SkyblockPlayer player, @NotNull String homeName);

    /**
     * Saves this island to the database.
     *
     * @return a future that completes when saved
     */
    @NotNull
    CompletableFuture<Void> save();
}
