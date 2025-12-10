"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Globe,
  FileText,
  Link as LinkIcon,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
  });

  useEffect(() => {
    fetchOrganization();
  }, [slug]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${slug}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Organization not found");
      }
      const data = await response.json();

      if (data.organization.currentUserRole !== "OWNER" && data.organization.currentUserRole !== "ADMIN") {
        router.push(`/organizations/${slug}`);
        return;
      }

      setOrganization(data.organization);
      setFormData({
        name: data.organization.name,
        description: data.organization.description || "",
        website: data.organization.website || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/organizations/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Güncelleme başarısız");
      }

      setSuccess("Organizasyon başarıyla güncellendi");

      // If slug changed, redirect to new URL
      if (data.organization.slug !== slug) {
        router.push(`/organizations/${data.organization.slug}/settings`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== organization?.name) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/organizations/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Silme başarısız");
      }

      router.push("/organizations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Organizasyon bulunamadı
          </h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/organizations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Organizasyonlara Dön
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = organization?.currentUserRole === "OWNER";

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={`/organizations/${slug}`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Organizasyona Dön
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Ayarlar</h1>
            <p className="text-slate-400">{organization?.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Genel Bilgiler</h2>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Organizasyon Adı
                </div>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                required
                maxLength={100}
              />
            </div>

            {/* Slug (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  URL Slug
                </div>
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-slate-800 border border-white/10 border-r-0 rounded-l-xl text-slate-500 text-sm">
                  hyble.co/org/
                </span>
                <input
                  type="text"
                  value={organization?.slug || ""}
                  className="flex-1 px-4 py-3 bg-slate-800/30 border border-white/10 rounded-r-xl text-slate-500 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                URL slug değiştirilemez
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Açıklama
                  <span className="text-slate-500 font-normal">(İsteğe bağlı)</span>
                </div>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors resize-none"
                placeholder="Organizasyonunuz hakkında kısa bir açıklama"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                  <span className="text-slate-500 font-normal">(İsteğe bağlı)</span>
                </div>
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                placeholder="https://example.com"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Danger Zone */}
        {isOwner && (
          <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-400">
                Tehlikeli Bölge
              </h2>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Bu organizasyonu sildiğinizde, tüm üyeler ve veriler kalıcı olarak
              silinecektir. Bu işlem geri alınamaz.
            </p>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Organizasyonu Sil
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-slate-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Organizasyonu Sil
              </h3>
            </div>

            <p className="text-slate-400 mb-4">
              Bu işlem geri alınamaz. Onaylamak için organizasyon adını yazın:
            </p>

            <p className="text-white font-mono text-sm bg-slate-800 px-3 py-2 rounded-lg mb-4">
              {organization?.name}
            </p>

            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 mb-4"
              placeholder="Organizasyon adını yazın"
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmName("");
                }}
                className="flex-1 px-4 py-3 text-slate-400 hover:text-white transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || deleteConfirmName !== organization?.name}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
              >
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
