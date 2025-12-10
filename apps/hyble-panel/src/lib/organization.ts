import { prisma, OrganizationRole } from "@hyble/db";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function generateUniqueSlug(name: string): Promise<string> {
  let slug = generateSlug(name);
  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug: uniqueSlug },
    });

    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
}

const roleHierarchy: Record<OrganizationRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export async function checkPermission(
  userId: string,
  organizationId: string,
  requiredRoles: OrganizationRole[]
): Promise<boolean> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!member) {
    return false;
  }

  return requiredRoles.includes(member.role);
}

export async function getUserRole(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  return member?.role || null;
}

export async function hasMinimumRole(
  userId: string,
  organizationId: string,
  minimumRole: OrganizationRole
): Promise<boolean> {
  const userRole = await getUserRole(userId, organizationId);

  if (!userRole) {
    return false;
  }

  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return checkPermission(userId, organizationId, ["OWNER"]);
}

export async function isOrganizationAdmin(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return checkPermission(userId, organizationId, ["OWNER", "ADMIN"]);
}

export async function countOwners(organizationId: string): Promise<number> {
  return prisma.organizationMember.count({
    where: {
      organizationId,
      role: "OWNER",
    },
  });
}

export function getRoleLabel(role: OrganizationRole): string {
  const labels: Record<OrganizationRole, string> = {
    OWNER: "Sahip",
    ADMIN: "Yönetici",
    MEMBER: "Üye",
    VIEWER: "İzleyici",
  };
  return labels[role];
}
