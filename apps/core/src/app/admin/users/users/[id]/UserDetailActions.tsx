"use client";

import { useState } from "react";
import { Shield, Ban, Trash2, X, ShieldOff, CheckCircle, UserCheck, LogOut, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserDetailActionsProps {
  userId: string;
  currentRole: string;
  currentStatus: string;
  has2FA: boolean;
}

export function UserDetailActions({ userId, currentRole, currentStatus, has2FA }: UserDetailActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Action failed");
      }

      router.refresh();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.push("/users");
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

  const handleReset2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/2fa`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("2FA reset failed");
      }

      router.refresh();
    } catch (error) {
      console.error("2FA reset failed:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

  const handleImpersonate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/impersonate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Impersonation failed");
      }

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Impersonation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/sessions`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Session termination failed");
      }

      router.refresh();
    } catch (error) {
      console.error("Session termination failed:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(null);
    }
  };

  const confirmMessages: Record<string, { title: string; message: string; action: () => void }> = {
    delete: {
      title: "Kullanıcıyı Sil",
      message: "Bu işlem geri alınamaz. Kullanıcı hesabı ve tüm ilişkili veriler kalıcı olarak silinecektir.",
      action: handleDelete,
    },
    suspend: {
      title: "Kullanıcıyı Askıya Al",
      message: "Kullanıcı askıya alınacak ve hesabına erişemeyecektir.",
      action: () => handleAction("suspend"),
    },
    unsuspend: {
      title: "Askıyı Kaldır",
      message: "Kullanıcının hesabı yeniden aktif edilecektir.",
      action: () => handleAction("unsuspend"),
    },
    reset2fa: {
      title: "2FA Sıfırla",
      message: "Kullanıcının iki faktörlü kimlik doğrulaması devre dışı bırakılacaktır.",
      action: handleReset2FA,
    },
    terminateSessions: {
      title: "Tüm Oturumları Sonlandır",
      message: "Kullanıcının tüm aktif oturumları sonlandırılacaktır. Yeniden giriş yapması gerekecektir.",
      action: handleTerminateAllSessions,
    },
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/users/${userId}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Düzenle
        </Link>
        <button
          onClick={handleImpersonate}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <UserCheck className="w-4 h-4" />
          Kullanıcı Olarak Giriş
        </button>
        <button
          onClick={() => handleAction(currentRole === "admin" ? "demote" : "promote")}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Shield className="w-4 h-4" />
          {currentRole === "admin" ? "Admin Kaldır" : "Admin Yap"}
        </button>
        {has2FA && (
          <button
            onClick={() => setShowConfirm("reset2fa")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <ShieldOff className="w-4 h-4" />
            2FA Sıfırla
          </button>
        )}
        <button
          onClick={() => setShowConfirm("terminateSessions")}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600/20 text-slate-400 hover:bg-slate-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Oturumları Kapat
        </button>
        {currentStatus === "SUSPENDED" ? (
          <button
            onClick={() => setShowConfirm("unsuspend")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Askıyı Kaldır
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm("suspend")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            Askıya Al
          </button>
        )}
        <button
          onClick={() => setShowConfirm("delete")}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Sil
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && confirmMessages[showConfirm] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {confirmMessages[showConfirm].title}
              </h3>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 mb-6">
              {confirmMessages[showConfirm].message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmMessages[showConfirm].action}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                  showConfirm === "delete"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : showConfirm === "unsuspend"
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {isLoading ? "İşleniyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
