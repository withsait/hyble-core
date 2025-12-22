"use client";

import { useState } from "react";
import { MoreHorizontal, Shield, Ban, Trash2, X, Eye, UserCog, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus?: string;
}

export function UserActions({ userId, currentRole, currentStatus = "active" }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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

      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
      setShowConfirm(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
            <Link
              href={`/users/${userId}`}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              Detayları Gör
            </Link>
            <button
              onClick={() => handleAction(currentRole === "admin" ? "demote" : "promote")}
              disabled={isLoading}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-300 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              {currentRole === "admin" ? "Admin Kaldır" : "Admin Yap"}
            </button>
            {currentStatus === "suspended" ? (
              <button
                onClick={() => handleAction("unsuspend")}
                disabled={isLoading}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-green-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Askıyı Kaldır
              </button>
            ) : (
              <button
                onClick={() => setShowConfirm("suspend")}
                disabled={isLoading}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-yellow-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                Askıya Al
              </button>
            )}
            <button
              onClick={() => setShowConfirm("delete")}
              disabled={isLoading}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Hesabı Sil
            </button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {showConfirm === "delete" ? "Kullanıcıyı Sil" : "Kullanıcıyı Askıya Al"}
              </h3>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 mb-6">
              {showConfirm === "delete"
                ? "Bu işlem geri alınamaz. Kullanıcı hesabı ve tüm ilişkili veriler kalıcı olarak silinecektir."
                : "Kullanıcı askıya alınacak ve hesabına erişemeyecektir."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => showConfirm === "delete" ? handleDelete() : handleAction("suspend")}
                disabled={isLoading}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                  showConfirm === "delete"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-yellow-600 hover:bg-yellow-500 text-white"
                }`}
              >
                {isLoading ? "İşleniyor..." : showConfirm === "delete" ? "Sil" : "Askıya Al"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
