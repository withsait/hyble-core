package co.hyble.skyblock.api;

import co.hyble.skyblock.api.service.IslandService;
import co.hyble.skyblock.api.service.PlayerService;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

/**
 * Main API entry point for HybleSkyblock.
 * <p>
 * Access the API instance via {@link #getInstance()}.
 * </p>
 */
public final class HybleSkyblockAPI {

    private static HybleSkyblockAPI instance;

    private final IslandService islandService;
    private final PlayerService playerService;

    /**
     * Creates a new API instance.
     *
     * @param islandService the island service implementation
     * @param playerService the player service implementation
     */
    public HybleSkyblockAPI(@NotNull IslandService islandService, @NotNull PlayerService playerService) {
        this.islandService = islandService;
        this.playerService = playerService;
    }

    /**
     * Gets the API instance.
     *
     * @return the API instance, or null if not initialized
     */
    @Nullable
    public static HybleSkyblockAPI getInstance() {
        return instance;
    }

    /**
     * Registers the API instance.
     * This should only be called by the plugin itself.
     *
     * @param api the API instance to register
     */
    public static void register(@NotNull HybleSkyblockAPI api) {
        if (instance != null) {
            throw new IllegalStateException("API is already registered!");
        }
        instance = api;
    }

    /**
     * Unregisters the API instance.
     * This should only be called by the plugin itself.
     */
    public static void unregister() {
        instance = null;
    }

    /**
     * Gets the island service.
     *
     * @return the island service
     */
    @NotNull
    public IslandService getIslandService() {
        return islandService;
    }

    /**
     * Gets the player service.
     *
     * @return the player service
     */
    @NotNull
    public PlayerService getPlayerService() {
        return playerService;
    }
}
