"use client";

import { useState } from "react";
import { Trash2, X, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrganizationActionsProps {
  organizationId: string;
  slug: string;
}

export function OrganizationActions({ organizationId, slug }: OrganizationActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.push("/organizations");
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={`/organizations/${slug}/edit`}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-xl font-medium transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Düzenle
        </Link>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Sil
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Organizasyonu Sil</h3>
              <button
                onClick={() => setShowConfirm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400 mb-6">
              Bu işlem geri alınamaz. Organizasyon ve tüm ilişkili veriler (üyelikler, davetler) kalıcı olarak silinecektir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
