"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MoreVertical, UserMinus, Shield, Crown } from "lucide-react";

interface MemberListProps {
  orgId: string;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MANAGER: "Müdür",
  MEMBER: "Üye",
  BILLING: "Fatura",
  VIEWER: "İzleyici",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MANAGER: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  MEMBER: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  BILLING: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  VIEWER: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
};

export function MemberList({ orgId }: MemberListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: members, isLoading, refetch } = trpc.organization.getMembers.useQuery({ orgId });

  const updateRoleMutation = trpc.organization.updateMemberRole.useMutation({
    onSuccess: () => {
      refetch();
      setOpenMenuId(null);
    },
  });

  const removeMemberMutation = trpc.organization.removeMember.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-t-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Üye
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Katılım
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
          {members?.map((member) => (
            <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      member.name?.charAt(0) || member.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {member.name || "İsimsiz"}
                      </span>
                      {member.isOwner && (
                        <Crown className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {member.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[member.role]}`}>
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(member.joinedAt).toLocaleDateString("tr-TR")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {!member.isOwner && (
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20">
                          <div className="py-1">
                            <p className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                              Rol Değiştir
                            </p>
                            {["ADMIN", "MANAGER", "MEMBER", "BILLING", "VIEWER"].map((role) => (
                              <button
                                key={role}
                                onClick={() =>
                                  updateRoleMutation.mutate({
                                    orgId,
                                    memberId: member.id,
                                    role: role as any,
                                  })
                                }
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
                                  member.role === role
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                              >
                                <Shield className="w-3.5 h-3.5" />
                                {ROLE_LABELS[role]}
                              </button>
                            ))}
                            <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                            <button
                              onClick={() => {
                                if (confirm("Bu üyeyi organizasyondan çıkarmak istediğinize emin misiniz?")) {
                                  removeMemberMutation.mutate({ orgId, memberId: member.id });
                                }
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Üyeyi Çıkar
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(!members || members.length === 0) && (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          Henüz üye bulunmuyor
        </div>
      )}
    </div>
  );
}
