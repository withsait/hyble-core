package co.hyble.skyblock.api.service;

import co.hyble.skyblock.api.player.SkyblockPlayer;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Service for managing Skyblock players.
 */
public interface PlayerService {

    /**
     * Gets a SkyblockPlayer by UUID.
     *
     * @param uuid the player UUID
     * @return the SkyblockPlayer, or empty if not found
     */
    @NotNull
    Optional<SkyblockPlayer> getPlayer(@NotNull UUID uuid);

    /**
     * Gets a SkyblockPlayer from a Bukkit player.
     *
     * @param player the Bukkit player
     * @return the SkyblockPlayer
     */
    @NotNull
    SkyblockPlayer getPlayer(@NotNull Player player);

    /**
     * Gets a SkyblockPlayer by UUID, loading from database if necessary.
     *
     * @param uuid the player UUID
     * @return a future containing the SkyblockPlayer, or empty if never played
     */
    @NotNull
    CompletableFuture<Optional<SkyblockPlayer>> getPlayerAsync(@NotNull UUID uuid);

    /**
     * Gets a SkyblockPlayer by name.
     *
     * @param name the player name
     * @return the SkyblockPlayer, or empty if not found
     */
    @NotNull
    Optional<SkyblockPlayer> getPlayerByName(@NotNull String name);

    /**
     * Gets all online SkyblockPlayers.
     *
     * @return a collection of online players
     */
    @NotNull
    Collection<SkyblockPlayer> getOnlinePlayers();

    /**
     * Gets all loaded SkyblockPlayers (including offline cached players).
     *
     * @return a collection of loaded players
     */
    @NotNull
    Collection<SkyblockPlayer> getLoadedPlayers();

    /**
     * Loads a player's data from the database.
     *
     * @param uuid the player UUID
     * @return a future containing the SkyblockPlayer, or empty if never played
     */
    @NotNull
    CompletableFuture<Optional<SkyblockPlayer>> loadPlayer(@NotNull UUID uuid);

    /**
     * Unloads a player from memory.
     *
     * @param uuid the player UUID
     */
    void unloadPlayer(@NotNull UUID uuid);

    /**
     * Saves a player's data to the database.
     *
     * @param player the player to save
     * @return a future that completes when saved
     */
    @NotNull
    CompletableFuture<Void> savePlayer(@NotNull SkyblockPlayer player);

    /**
     * Saves all loaded players to the database.
     *
     * @return a future that completes when all players are saved
     */
    @NotNull
    CompletableFuture<Void> saveAllPlayers();
}
