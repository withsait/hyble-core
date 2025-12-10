"use client";

import { trpc } from "./client";

/**
 * Custom hooks for common tRPC queries
 * These provide a cleaner API for components
 */

// ==================== AUTH HOOKS ====================

export function useSession() {
  return trpc.auth.getSession.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== USER HOOKS ====================

export function useProfile() {
  return trpc.user.getProfile.useQuery();
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
    },
  });
}

export function useAddresses() {
  return trpc.user.getAddresses.useQuery();
}

export function useNotificationPreferences() {
  return trpc.user.getNotificationPreferences.useQuery();
}

export function useUpdateNotificationPreferences() {
  const utils = trpc.useUtils();
  return trpc.user.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      utils.user.getNotificationPreferences.invalidate();
    },
  });
}

// ==================== SECURITY HOOKS ====================

export function useSecurityOverview() {
  return trpc.security.getSecurityOverview.useQuery();
}

export function useActivityLog(limit = 20) {
  return trpc.security.getActivityLog.useQuery({ limit });
}

export function useSessions() {
  return trpc.security.getSessions.useQuery();
}

export function useRevokeSession() {
  const utils = trpc.useUtils();
  return trpc.security.revokeSession.useMutation({
    onSuccess: () => {
      utils.security.getSessions.invalidate();
    },
  });
}

export function use2FAStatus() {
  return trpc.security.get2FAStatus.useQuery();
}

export function useTrustedDevices() {
  return trpc.security.getTrustedDevices.useQuery();
}

export function useLoginHistory(limit = 10) {
  return trpc.security.getLoginHistory.useQuery({ limit });
}

// ==================== ORGANIZATION HOOKS ====================

export function useOrganizations() {
  return trpc.organization.list.useQuery();
}

export function useOrganization(orgId: string) {
  return trpc.organization.get.useQuery({ orgId }, {
    enabled: !!orgId,
  });
}

export function useOrganizationMembers(orgId: string) {
  return trpc.organization.getMembers.useQuery({ orgId }, {
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const utils = trpc.useUtils();
  return trpc.organization.create.useMutation({
    onSuccess: () => {
      utils.organization.list.invalidate();
    },
  });
}

export function useInviteMember() {
  const utils = trpc.useUtils();
  return trpc.organization.inviteMember.useMutation({
    onSuccess: (_data, variables) => {
      utils.organization.getMembers.invalidate({ orgId: variables.orgId });
    },
  });
}

export function usePendingInvites(orgId: string) {
  return trpc.organization.getPendingInvites.useQuery({ orgId }, {
    enabled: !!orgId,
  });
}

// ==================== API KEY HOOKS ====================

export function useApiKeys() {
  return trpc.apiKey.list.useQuery({});
}

export function useApiKey(keyId: string) {
  return trpc.apiKey.get.useQuery({ keyId }, {
    enabled: !!keyId,
  });
}

export function useCreateApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKey.create.useMutation({
    onSuccess: () => {
      utils.apiKey.list.invalidate();
    },
  });
}

export function useRevokeApiKey() {
  const utils = trpc.useUtils();
  return trpc.apiKey.revoke.useMutation({
    onSuccess: () => {
      utils.apiKey.list.invalidate();
    },
  });
}

export function useApiKeyUsageStats(keyId: string) {
  return trpc.apiKey.getUsageStats.useQuery(
    { keyId },
    { enabled: !!keyId }
  );
}

export function useAvailableScopes() {
  return trpc.apiKey.getAvailableScopes.useQuery();
}
