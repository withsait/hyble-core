"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Shield,
  User,
  Eye,
  LogIn,
} from "lucide-react";

interface InviteDetails {
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
  };
  expiresAt: string;
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye,
};

const roleLabels = {
  OWNER: "Sahip",
  ADMIN: "Yönetici",
  MEMBER: "Üye",
  VIEWER: "İzleyici",
};

const roleColors = {
  OWNER: "text-yellow-400 bg-yellow-400/10",
  ADMIN: "text-purple-400 bg-purple-400/10",
  MEMBER: "text-blue-400 bg-blue-400/10",
  VIEWER: "text-slate-400 bg-slate-400/10",
};

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Davet bulunamadı");
        setErrorStatus(data.status || null);
        return;
      }

      setInvite(data.invite);
    } catch (err) {
      setError("Davet bilgileri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError("");

    try {
      const response = await fetch(`/api/invites/${token}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in - redirect to login with callback
          router.push(`/login?callbackUrl=/invites/${token}`);
          return;
        }
        throw new Error(data.error || "Davet kabul edilemedi");
      }

      setSuccess(true);

      // Redirect to organization after 2 seconds
      setTimeout(() => {
        router.push(`/organizations/${data.organization.slug}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    setError("");

    try {
      const response = await fetch(`/api/invites/${token}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?callbackUrl=/invites/${token}`);
          return;
        }
        throw new Error(data.error || "Davet reddedilemedi");
      }

      setDeclined(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Davet Kabul Edildi!
          </h1>
          <p className="text-slate-400 mb-4">
            <span className="text-white font-medium">
              {invite?.organization.name}
            </span>{" "}
            organizasyonuna katıldınız.
          </p>
          <p className="text-slate-500 text-sm">
            Yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    );
  }

  // Declined state
  if (declined) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Davet Reddedildi
          </h1>
          <p className="text-slate-400 mb-6">
            Daveti reddettiniz. Bu sayfayı kapatabilirsiniz.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Dashboard&apos;a Git
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invite) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            {errorStatus === "EXPIRED" ? (
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {errorStatus === "EXPIRED"
              ? "Davet Süresi Doldu"
              : errorStatus === "ACCEPTED"
              ? "Davet Zaten Kullanıldı"
              : "Davet Bulunamadı"}
          </h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
          >
            Dashboard&apos;a Git
          </Link>
        </div>
      </div>
    );
  }

  // Main invite view
  const RoleIcon = invite ? roleIcons[invite.role] : User;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563EB10_1px,transparent_1px),linear-gradient(to_bottom,#2563EB10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>

      <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full">
        {/* Organization Logo/Initial */}
        <div className="flex justify-center mb-6">
          {invite?.organization.logo ? (
            <img
              src={invite.organization.logo}
              alt={invite.organization.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {invite?.organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Invite Details */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Organizasyona Davet
          </h1>
          <p className="text-slate-400">
            <span className="text-white font-medium">
              {invite?.organization.name}
            </span>{" "}
            organizasyonuna davet edildiniz.
          </p>
        </div>

        {/* Role Badge */}
        {invite && (
          <div className="flex justify-center mb-6">
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                roleColors[invite.role]
              }`}
            >
              <RoleIcon className="w-4 h-4" />
              {roleLabels[invite.role]} olarak katılacaksınız
            </span>
          </div>
        )}

        {/* Organization Description */}
        {invite?.organization.description && (
          <p className="text-slate-400 text-sm text-center mb-6 px-4">
            {invite.organization.description}
          </p>
        )}

        {/* Invited Email */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <p className="text-slate-500 text-sm mb-1">Davet edilen e-posta:</p>
          <p className="text-white font-medium">{invite?.email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Expiry Warning */}
        {invite && new Date(invite.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Bu davet{" "}
              {new Date(invite.expiresAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
              &apos;da sona erecek.
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={declining || accepting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-slate-300 rounded-xl font-medium transition-colors"
          >
            {declining ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Reddet
              </>
            )}
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
          >
            {accepting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Kabul Et
              </>
            )}
          </button>
        </div>

        {/* Login Hint */}
        <p className="text-slate-500 text-xs text-center mt-4">
          Devam etmek için giriş yapmanız gerekebilir.
        </p>
      </div>
    </div>
  );
}
