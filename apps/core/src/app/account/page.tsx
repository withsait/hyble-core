"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Shield,
  Link2,
  Monitor,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle,
  Camera,
  Globe,
  Smartphone,
  Key,
  Copy,
  Check,
  X,
  Trash2,
  LogOut,
  Snowflake,
  Clock,
  Tablet,
  Sun,
  Moon,
} from "lucide-react";

// Types
interface Profile {
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  language: string;
  currency: string;
  timezone: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  phoneNumber: string | null;
  createdAt: Date;
  status: string;
  profile: Profile | null;
  twoFactorAuth: { enabled: boolean; backupCodesRemaining: number } | null;
  connectedAccounts: { provider: string; providerAccountId: string }[];
}

interface Session {
  id: string;
  deviceType: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  isCurrent: boolean;
}

// Section Component
function Section({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  danger = false,
  openSection,
  setOpenSection,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  danger?: boolean;
  openSection: string | null;
  setOpenSection: (id: string | null) => void;
}) {
  const isOpen = openSection === id;

  const toggle = () => {
    setOpenSection(isOpen ? null : id);
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 border rounded-2xl overflow-hidden transition-all ${
        danger
          ? "border-red-200 dark:border-red-900/50"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          danger
            ? "hover:bg-red-50 dark:hover:bg-red-900/10"
            : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              danger
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-blue-100 dark:bg-blue-900/30"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                danger
                  ? "text-red-600 dark:text-red-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            />
          </div>
          <span
            className={`font-medium ${
              danger
                ? "text-red-600 dark:text-red-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// Theme Toggle
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (savedTheme === "dark" || (!savedTheme && systemDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 text-slate-600 dark:hidden" />
      <Moon className="w-5 h-5 text-slate-300 hidden dark:block" />
    </button>
  );
}

// Device Icon Helper
function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case "DESKTOP":
      return Monitor;
    case "MOBILE":
      return Smartphone;
    case "TABLET":
      return Tablet;
    default:
      return Globe;
  }
}

// Relative Time Helper
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Az once";
  if (diffMinutes < 60) return `${diffMinutes} dakika once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;
  return date.toLocaleDateString("tr-TR");
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");

  // State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(
    sectionParam || "profile"
  );

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [language, setLanguage] = useState("tr");
  const [currency, setCurrency] = useState("EUR");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 2FA State
  const [twoFAStatus, setTwoFAStatus] = useState<{
    enabled: boolean;
    backupCodesRemaining: number;
  } | null>(null);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [processing2FA, setProcessing2FA] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Session State
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // Messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clipboard State
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Console URL
  const consoleUrl =
    process.env.NODE_ENV === "production"
      ? "https://console.hyble.co"
      : "http://localhost:3004";

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userRes, sessionsRes, twoFARes] = await Promise.all([
        fetch("/api/users/profile"),
        fetch("/api/sessions"),
        fetch("/api/users/2fa/status"),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        setFirstName(userData.profile?.firstName || "");
        setLastName(userData.profile?.lastName || "");
        setLanguage(userData.profile?.language || "tr");
        setCurrency(userData.profile?.currency || "EUR");
      } else {
        router.push("/login");
        return;
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData.sessions || []);
      }

      if (twoFARes.ok) {
        const twoFAData = await twoFARes.json();
        setTwoFAStatus(twoFAData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Veriler yuklenirken hata olustu");
    } finally {
      setLoading(false);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, language, currency }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Profil guncellenemedi");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Sifreler eslesmiyor");
      return;
    }
    if (newPassword.length < 8) {
      setError("Sifre en az 8 karakter olmali");
      return;
    }

    setChangingPassword(true);
    setError(null);

    try {
      const res = await fetch("/api/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sifre degistirilemedi");
      }

      setPasswordChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
    } finally {
      setChangingPassword(false);
    }
  };

  // 2FA Setup
  const startSetup2FA = async () => {
    setProcessing2FA(true);
    setError(null);
    try {
      const res = await fetch("/api/users/2fa/setup");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSetupData(data);
      setShowSetup2FA(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "2FA kurulumu baslatilamadi");
    } finally {
      setProcessing2FA(false);
    }
  };

  const verify2FASetup = async () => {
    if (verificationCode.length !== 6) {
      setError("6 haneli kod girin");
      return;
    }
    setProcessing2FA(true);
    setError(null);
    try {
      const res = await fetch("/api/users/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBackupCodes(data.backupCodes);
      setShowSetup2FA(false);
      setShowBackupCodes(true);
      setSuccess("2FA basariyla etkinlestirildi!");
      await fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dogrulama basarisiz");
    } finally {
      setProcessing2FA(false);
      setVerificationCode("");
    }
  };

  const disable2FA = async (password: string) => {
    setProcessing2FA(true);
    setError(null);
    try {
      const res = await fetch("/api/users/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("2FA devre disi birakildi");
      await fetchUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "2FA devre disi birakilamadi");
    } finally {
      setProcessing2FA(false);
    }
  };

  // Revoke Session
  const revokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Oturum sonlandirilamadi");
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setSuccess("Oturum sonlandirildi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
    } finally {
      setRevokingSession(null);
    }
  };

  const revokeAllSessions = async () => {
    if (!confirm("Tum diger oturumlar sonlandirilacak. Emin misiniz?")) return;
    setRevokingSession("all");
    try {
      const res = await fetch("/api/sessions", { method: "DELETE" });
      if (!res.ok) throw new Error("Oturumlar sonlandirilamadi");
      setSessions(sessions.filter((s) => s.isCurrent));
      setSuccess("Tum oturumlar sonlandirildi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata olustu");
    } finally {
      setRevokingSession(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: "secret" | "codes") => {
    await navigator.clipboard.writeText(text);
    if (type === "secret") {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.profile?.firstName && user.profile?.lastName
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user.name || user.email;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3B82F610_1px,transparent_1px),linear-gradient(to_bottom,#3B82F610_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-slate-900/50 dark:to-slate-900" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`${consoleUrl}/dashboard`}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Console'a Don
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/logout"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cikis Yap
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* User Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold mb-4">
            {user.profile?.avatar || user.image ? (
              <img
                src={user.profile?.avatar || user.image || ""}
                alt={displayName}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {displayName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                <CheckCircle className="w-3 h-3" />
                Dogrulandi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Dogrulanmadi
              </span>
            )}
            {twoFAStatus?.enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                <Shield className="w-3 h-3" />
                2FA Aktif
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {/* Profile Section */}
          <Section
            id="profile"
            title="Profil Bilgileri"
            icon={User}
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adiniz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Soyadiniz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Dil
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tr">Turkce</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Para Birimi
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="TRY">TRY</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Kaydedildi
                    </>
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </div>
            </form>
          </Section>

          {/* Security Section */}
          <Section
            id="security"
            title="Guvenlik"
            icon={Shield}
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    E-posta
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                {user.emailVerified ? (
                  <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Dogrulandi
                  </span>
                ) : (
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Dogrula
                  </button>
                )}
              </div>

              {/* Password Change */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Sifre Degistir
                </h4>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mevcut sifre"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yeni sifre"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni sifre (tekrar)"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={changingPassword || !currentPassword || !newPassword}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                  >
                    {changingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : passwordChanged ? (
                      "Sifre Degistirildi!"
                    ) : (
                      "Sifreyi Degistir"
                    )}
                  </button>
                </form>
              </div>

              {/* 2FA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Iki Faktorlu Dogrulama (2FA)
                    </h4>
                    <p className="text-sm text-slate-500">
                      Authenticator uygulamasi ile ekstra guvenlik
                    </p>
                  </div>
                  {twoFAStatus?.enabled ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-full">
                      Pasif
                    </span>
                  )}
                </div>

                {twoFAStatus?.enabled ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const pass = prompt("Sifreizi girin:");
                        if (pass) disable2FA(pass);
                      }}
                      className="flex-1 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium transition-colors"
                    >
                      2FA'yi Devre Disi Birak
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startSetup2FA}
                    disabled={processing2FA}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {processing2FA ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        2FA'yi Etkinlestir
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </Section>

          {/* Connected Accounts Section */}
          <Section
            id="connections"
            title="Bagli Hesaplar"
            icon={Link2}
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="space-y-3">
              {["google", "github", "discord"].map((provider) => {
                const connected = user.connectedAccounts.find(
                  (a) => a.provider === provider
                );
                return (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        {provider === "google" && (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                        )}
                        {provider === "github" && (
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        )}
                        {provider === "discord" && (
                          <svg
                            className="w-5 h-5 text-[#5865F2]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white capitalize">
                          {provider}
                        </p>
                        <p className="text-sm text-slate-500">
                          {connected ? "Bagli" : "Bagli degil"}
                        </p>
                      </div>
                    </div>
                    {connected ? (
                      <button className="text-red-600 hover:text-red-700 text-sm">
                        Kaldir
                      </button>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        Bagla
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Sessions Section */}
          <Section
            id="sessions"
            title="Aktif Oturumlar"
            icon={Monitor}
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="space-y-4">
              {sessions.length > 1 && (
                <div className="flex justify-end">
                  <button
                    onClick={revokeAllSessions}
                    disabled={revokingSession === "all"}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    {revokingSession === "all" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Tum Diger Oturumlari Sonlandir
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {sessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.deviceType);
                  return (
                    <div
                      key={session.id}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        session.isCurrent
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "bg-slate-50 dark:bg-slate-900"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.isCurrent
                            ? "bg-blue-100 dark:bg-blue-900/50"
                            : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      >
                        <DeviceIcon
                          className={`w-5 h-5 ${
                            session.isCurrent
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {session.browser || "Bilinmeyen"} -{" "}
                            {session.os || "Bilinmeyen"}
                          </p>
                          {session.isCurrent && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              Bu cihaz
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {session.ipAddress} •{" "}
                          {getRelativeTime(session.lastActiveAt)}
                        </p>
                      </div>
                      {!session.isCurrent && (
                        <button
                          onClick={() => revokeSession(session.id)}
                          disabled={revokingSession === session.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          {revokingSession === session.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <p className="text-center text-slate-500 py-4">
                    Aktif oturum bulunamadi
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* Danger Zone */}
          <Section
            id="danger"
            title="Tehlikeli Bolge"
            icon={AlertTriangle}
            danger
            openSection={openSection}
            setOpenSection={setOpenSection}
          >
            <div className="space-y-4">
              {/* Freeze Account */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Hesabi Dondur
                  </p>
                  <p className="text-sm text-slate-500">
                    Gecici olarak hesabinizi dondurun
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors">
                  <Snowflake className="w-4 h-4 inline mr-1" />
                  Dondur
                </button>
              </div>

              {/* Delete Account */}
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Hesabi Sil
                  </p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">
                    Bu islem 14 gun icinde geri alinabilir
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Sil
                </button>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>
            Hesap ID:{" "}
            <span className="font-mono text-slate-600 dark:text-slate-400">
              {user.id.slice(0, 8)}...
            </span>
          </p>
          <p className="mt-1">
            Uyelik: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
          </p>
        </div>
      </main>

      {/* 2FA Setup Modal */}
      {showSetup2FA && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                2FA Kurulumu
              </h3>
              <button
                onClick={() => setShowSetup2FA(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  1. Authenticator uygulamanizda asagidaki QR kodu tarayin:
                </p>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  <img
                    src={setupData.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div>
                <p className="text-slate-500 text-sm mb-2">
                  Veya bu kodu manuel olarak girin:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-blue-600 dark:text-blue-400 font-mono text-sm break-all">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.secret, "secret")}
                    className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {copiedSecret ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                  2. Uygulamada gorunen 6 haneli kodu girin:
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl tracking-widest font-mono text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={verify2FASetup}
                disabled={processing2FA || verificationCode.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {processing2FA ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Dogrula ve Etkinlestir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Kurtarma Kodlari
              </h3>
              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setBackupCodes([]);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  Bu kodlari guvenli bir yere kaydedin. Her kod sadece bir kez
                  kullanilabilir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl">
                {backupCodes.map((code, index) => (
                  <code
                    key={index}
                    className="text-center py-2 px-3 bg-white dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400 font-mono text-sm"
                  >
                    {code}
                  </code>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(backupCodes.join("\n"), "codes")}
                className="w-full py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedCodes ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    Kopyalandi!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Kodlari Kopyala
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setBackupCodes([]);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Kaydettim, Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
