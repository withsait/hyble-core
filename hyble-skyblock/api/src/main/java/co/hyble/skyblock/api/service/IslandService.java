package co.hyble.skyblock.api.service;

import co.hyble.skyblock.api.island.Island;
import co.hyble.skyblock.api.player.SkyblockPlayer;
import org.bukkit.Location;
import org.jetbrains.annotations.NotNull;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing islands.
 */
public interface IslandService {

    /**
     * Creates a new island for a player.
     *
     * @param player the player to create the island for
     * @return a future containing the created island
     */
    @NotNull
    CompletableFuture<Island> createIsland(@NotNull SkyblockPlayer player);

    /**
     * Deletes an island.
     *
     * @param island the island to delete
     * @return a future that completes when the island is deleted
     */
    @NotNull
    CompletableFuture<Void> deleteIsland(@NotNull Island island);

    /**
     * Gets an island by its UUID.
     *
     * @param id the island UUID
     * @return the island, or empty if not found
     */
    @NotNull
    Optional<Island> getIsland(@NotNull UUID id);

    /**
     * Gets an island by its UUID, loading it if necessary.
     *
     * @param id the island UUID
     * @return a future containing the island, or empty if not found
     */
    @NotNull
    CompletableFuture<Optional<Island>> getIslandAsync(@NotNull UUID id);

    /**
     * Gets the island at a specific location.
     *
     * @param location the location to check
     * @return the island at the location, or empty if none
     */
    @NotNull
    Optional<Island> getIslandAt(@NotNull Location location);

    /**
     * Gets the island owned by a player.
     *
     * @param owner the owner's UUID
     * @return the island, or empty if the player doesn't own an island
     */
    @NotNull
    Optional<Island> getIslandByOwner(@NotNull UUID owner);

    /**
     * Gets all currently loaded islands.
     *
     * @return a collection of loaded islands
     */
    @NotNull
    Collection<Island> getLoadedIslands();

    /**
     * Gets the total number of islands.
     *
     * @return a future containing the total island count
     */
    @NotNull
    CompletableFuture<Integer> getIslandCount();

    /**
     * Loads an island into memory.
     *
     * @param id the island UUID
     * @return a future containing the loaded island, or empty if not found
     */
    @NotNull
    CompletableFuture<Optional<Island>> loadIsland(@NotNull UUID id);

    /**
     * Unloads an island from memory.
     *
     * @param island the island to unload
     */
    void unloadIsland(@NotNull Island island);

    /**
     * Saves all loaded islands to the database.
     *
     * @return a future that completes when all islands are saved
     */
    @NotNull
    CompletableFuture<Void> saveAllIslands();
}
