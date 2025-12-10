"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Phone,
  Briefcase,
  Globe,
  Calendar,
  Loader2,
} from "lucide-react";

interface Profile {
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  position: string | null;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  phoneNumber: string | null;
  profile: Profile | null;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    position: "",
    language: "tr",
    timezone: "Europe/Istanbul",
    dateFormat: "DD/MM/YYYY",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/profile");
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUserData(data);

      setFormData({
        firstName: data.profile?.firstName || "",
        lastName: data.profile?.lastName || "",
        phoneNumber: data.phoneNumber || "",
        position: data.profile?.position || "",
        language: data.profile?.language || "tr",
        timezone: data.profile?.timezone || "Europe/Istanbul",
        dateFormat: data.profile?.dateFormat || "DD/MM/YYYY",
      });

      setAvatarPreview(data.profile?.avatar || data.image || null);
    } catch {
      setError("Profil bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profil başarıyla güncellendi");
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Sadece JPG, PNG ve WebP formatları kabul edilir");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Dosya boyutu 2MB'dan küçük olmalıdır");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Avatar yüklenemedi");
      }

      setAvatarPreview(data.avatar);
      setSuccess("Avatar güncellendi");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar yüklenemedi");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Profile Dön
        </Link>

        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Profili Düzenle</h1>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Profil Fotoğrafı</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {formData.firstName?.charAt(0) || userData?.email?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  JPG, PNG veya WebP formatında
                </p>
                <p className="text-slate-600 dark:text-slate-500 text-sm">
                  Maksimum 2MB boyutunda
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Kişisel Bilgiler</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Ad
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Adınız"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Soyadınız"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+90 555 123 4567"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Pozisyon
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Yazılım Geliştirici"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-800 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tercihler</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Dil
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Saat Dilimi
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                    <option value="Europe/London">Londra (GMT+0)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Tarih Formatı
                </label>
                <select
                  value={formData.dateFormat}
                  onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="DD/MM/YYYY">31/12/2024</option>
                  <option value="MM/DD/YYYY">12/31/2024</option>
                  <option value="YYYY-MM-DD">2024-12-31</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Kaydet
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
