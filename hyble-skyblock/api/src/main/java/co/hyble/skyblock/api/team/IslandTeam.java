package co.hyble.skyblock.api.team;

import co.hyble.skyblock.api.island.Island;
import co.hyble.skyblock.api.island.IslandRole;
import co.hyble.skyblock.api.player.SkyblockPlayer;
import org.jetbrains.annotations.NotNull;

import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Represents the team of members on an island.
 */
public interface IslandTeam {

    /**
     * Gets the island this team belongs to.
     *
     * @return the island
     */
    @NotNull
    Island getIsland();

    /**
     * Gets the owner of the island.
     *
     * @return the owner's UUID
     */
    @NotNull
    UUID getOwner();

    /**
     * Gets all members of this team.
     *
     * @return an unmodifiable set of member UUIDs
     */
    @NotNull
    Set<UUID> getMembers();

    /**
     * Gets all members with their roles.
     *
     * @return an unmodifiable map of UUIDs to roles
     */
    @NotNull
    Map<UUID, IslandRole> getMembersWithRoles();

    /**
     * Gets members with a specific role.
     *
     * @param role the role to filter by
     * @return a set of member UUIDs with the given role
     */
    @NotNull
    Set<UUID> getMembersByRole(@NotNull IslandRole role);

    /**
     * Gets the total number of members in this team.
     *
     * @return the member count
     */
    int getSize();

    /**
     * Gets the maximum allowed members for this island.
     *
     * @return the max member count
     */
    int getMaxSize();

    /**
     * Checks if the team is full.
     *
     * @return true if the team is at max capacity
     */
    boolean isFull();

    /**
     * Checks if a player is a member of this team.
     *
     * @param player the player UUID to check
     * @return true if the player is a member
     */
    boolean isMember(@NotNull UUID player);

    /**
     * Gets the role of a player in this team.
     *
     * @param player the player UUID
     * @return the role, or empty if not a member
     */
    @NotNull
    Optional<IslandRole> getRole(@NotNull UUID player);

    /**
     * Gets a member as a SkyblockPlayer.
     *
     * @param uuid the member's UUID
     * @return the SkyblockPlayer, or empty if not a member
     */
    @NotNull
    Optional<SkyblockPlayer> getMember(@NotNull UUID uuid);

    /**
     * Adds a new member to the team.
     *
     * @param player the player to add
     * @param role   the role to assign
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> addMember(@NotNull SkyblockPlayer player, @NotNull IslandRole role);

    /**
     * Removes a member from the team.
     *
     * @param player the player UUID to remove
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> removeMember(@NotNull UUID player);

    /**
     * Sets the role of a member.
     *
     * @param player the player UUID
     * @param role   the new role
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> setRole(@NotNull UUID player, @NotNull IslandRole role);

    /**
     * Transfers ownership to another member.
     *
     * @param newOwner the new owner's UUID
     * @return a future that completes with true if successful
     */
    @NotNull
    CompletableFuture<Boolean> transferOwnership(@NotNull UUID newOwner);

    /**
     * Gets all online members.
     *
     * @return a set of online members
     */
    @NotNull
    Set<SkyblockPlayer> getOnlineMembers();
}
