"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, X, Clock, Mail } from "lucide-react";

interface InviteFormProps {
  orgId: string;
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Yönetici" },
  { value: "MANAGER", label: "Müdür" },
  { value: "MEMBER", label: "Üye" },
  { value: "BILLING", label: "Fatura" },
  { value: "VIEWER", label: "İzleyici" },
];

export function InviteForm({ orgId }: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: pendingInvites, refetch: refetchInvites } =
    trpc.organization.getPendingInvites.useQuery({ orgId });

  const inviteMutation = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      setEmail("");
      setRole("MEMBER");
      setSuccess("Davet gönderildi!");
      setError("");
      refetchInvites();
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setSuccess("");
    },
  });

  const cancelInviteMutation = trpc.organization.cancelInvite.useMutation({
    onSuccess: () => refetchInvites(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.includes("@")) {
      setError("Geçerli bir email adresi girin");
      return;
    }

    inviteMutation.mutate({
      orgId,
      email,
      role: role as any,
    });
  };

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
          Yeni Üye Davet Et
        </h3>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="sm:w-40">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:self-end">
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {inviteMutation.isPending ? "Gönderiliyor..." : "Davet Et"}
            </button>
          </div>
        </form>
      </div>

      {/* Pending Invites */}
      {pendingInvites && pendingInvites.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Bekleyen Davetler ({pendingInvites.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                    <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {invite.email}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {ROLE_OPTIONS.find((r) => r.value === invite.role)?.label || invite.role}
                      {" • "}
                      {new Date(invite.expiresAt).toLocaleDateString("tr-TR")} tarihine kadar geçerli
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => cancelInviteMutation.mutate({ orgId, inviteId: invite.id })}
                  disabled={cancelInviteMutation.isPending}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Daveti İptal Et"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
