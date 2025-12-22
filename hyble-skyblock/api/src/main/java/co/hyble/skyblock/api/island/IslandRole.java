package co.hyble.skyblock.api.island;

import org.jetbrains.annotations.NotNull;

import java.util.EnumSet;
import java.util.Set;

/**
 * Represents roles within an island with their default permissions.
 */
public enum IslandRole {

    /**
     * Visitors have no permissions by default.
     */
    VISITOR(0, EnumSet.noneOf(IslandPermission.class)),

    /**
     * Coop members have limited access to the island.
     */
    COOP(1, EnumSet.of(
            IslandPermission.INTERACT,
            IslandPermission.CONTAINER
    )),

    /**
     * Regular members have basic building permissions.
     */
    MEMBER(2, EnumSet.of(
            IslandPermission.BREAK,
            IslandPermission.PLACE,
            IslandPermission.INTERACT,
            IslandPermission.CONTAINER,
            IslandPermission.SPAWN_ANIMALS,
            IslandPermission.KILL_ANIMALS,
            IslandPermission.KILL_MONSTERS,
            IslandPermission.REDSTONE,
            IslandPermission.VEHICLE,
            IslandPermission.WARP
    )),

    /**
     * Moderators can manage members and settings.
     */
    MODERATOR(3, EnumSet.of(
            IslandPermission.BREAK,
            IslandPermission.PLACE,
            IslandPermission.INTERACT,
            IslandPermission.CONTAINER,
            IslandPermission.SPAWN_ANIMALS,
            IslandPermission.KILL_ANIMALS,
            IslandPermission.SPAWN_MONSTERS,
            IslandPermission.KILL_MONSTERS,
            IslandPermission.REDSTONE,
            IslandPermission.VEHICLE,
            IslandPermission.INVITE,
            IslandPermission.KICK,
            IslandPermission.SET_HOME,
            IslandPermission.WARP,
            IslandPermission.MANAGE_WARPS
    )),

    /**
     * Admins have access to almost everything except ownership transfer.
     */
    ADMIN(4, EnumSet.of(
            IslandPermission.BREAK,
            IslandPermission.PLACE,
            IslandPermission.INTERACT,
            IslandPermission.CONTAINER,
            IslandPermission.SPAWN_ANIMALS,
            IslandPermission.KILL_ANIMALS,
            IslandPermission.SPAWN_MONSTERS,
            IslandPermission.KILL_MONSTERS,
            IslandPermission.REDSTONE,
            IslandPermission.VEHICLE,
            IslandPermission.INVITE,
            IslandPermission.KICK,
            IslandPermission.SET_HOME,
            IslandPermission.SETTINGS,
            IslandPermission.PROMOTE,
            IslandPermission.BANK,
            IslandPermission.WARP,
            IslandPermission.MANAGE_WARPS
    )),

    /**
     * The island owner has all permissions.
     */
    OWNER(5, EnumSet.allOf(IslandPermission.class));

    private final int weight;
    private final Set<IslandPermission> defaultPermissions;

    IslandRole(int weight, @NotNull Set<IslandPermission> defaultPermissions) {
        this.weight = weight;
        this.defaultPermissions = EnumSet.copyOf(defaultPermissions.isEmpty() ?
                EnumSet.noneOf(IslandPermission.class) : defaultPermissions);
    }

    /**
     * Gets the weight of this role. Higher weight means more authority.
     *
     * @return the role weight
     */
    public int getWeight() {
        return weight;
    }

    /**
     * Gets the default permissions for this role.
     *
     * @return an immutable set of default permissions
     */
    @NotNull
    public Set<IslandPermission> getDefaultPermissions() {
        return EnumSet.copyOf(defaultPermissions);
    }

    /**
     * Checks if this role has a permission by default.
     *
     * @param permission the permission to check
     * @return true if this role has the permission by default
     */
    public boolean hasPermission(@NotNull IslandPermission permission) {
        return defaultPermissions.contains(permission);
    }

    /**
     * Checks if this role is higher or equal to another role.
     *
     * @param other the other role to compare
     * @return true if this role is higher or equal
     */
    public boolean isAtLeast(@NotNull IslandRole other) {
        return this.weight >= other.weight;
    }

    /**
     * Checks if this role is higher than another role.
     *
     * @param other the other role to compare
     * @return true if this role is higher
     */
    public boolean isHigherThan(@NotNull IslandRole other) {
        return this.weight > other.weight;
    }
}
