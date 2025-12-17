// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  CreditCard,
  Building2,
  Calendar,
  Globe,
  Monitor,
  Clock,
  Ban,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Edit,
  Key,
  Wallet,
  Activity,
  MapPin,
  Phone,
  Crown,
  Lock,
  Unlock,
  Send,
  Eye,
  Plus,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Tab = "overview" | "wallet" | "sessions" | "security" | "organizations" | "actions";
type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "FROZEN" | "DELETED";
type TrustLevel = "GUEST" | "VERIFIED" | "SECURE" | "CORPORATE";

const statusConfig: Record<UserStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-700", icon: CheckCircle },
  SUSPENDED: { label: "Askıda", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  BANNED: { label: "Yasaklı", color: "bg-red-100 text-red-700", icon: Ban },
  FROZEN: { label: "Dondurulmuş", color: "bg-blue-100 text-blue-700", icon: Lock },
  DELETED: { label: "Silinmiş", color: "bg-slate-100 text-slate-500", icon: Trash2 },
};

const trustLevelConfig: Record<TrustLevel, { label: string; color: string; icon: typeof Shield }> = {
  GUEST: { label: "Misafir", color: "bg-slate-100 text-slate-600", icon: User },
  VERIFIED: { label: "Doğrulanmış", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  SECURE: { label: "Güvenli", color: "bg-green-100 text-green-700", icon: Shield },
  CORPORATE: { label: "Kurumsal", color: "bg-purple-100 text-purple-700", icon: Building2 },
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAction, setWalletAction] = useState<"add" | "subtract">("add");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletDescription, setWalletDescription] = useState("");

  // tRPC queries
  const { data: user, isLoading, refetch } = trpc.admin.getUser.useQuery({ userId });
  const { data: walletData, refetch: refetchWallet } = trpc.wallet.adminGetUserWallet.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Mutations
  const updateStatus = trpc.admin.updateUserStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const updateTrustLevel = trpc.admin.updateUserTrustLevel.useMutation({
    onSuccess: () => refetch(),
  });

  const banUser = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      setShowBanModal(false);
      setBanReason("");
      refetch();
    },
  });

  const unbanUser = trpc.admin.unbanUser.useMutation({
    onSuccess: () => refetch(),
  });

  const revokeSessions = trpc.admin.revokeUserSessions.useMutation({
    onSuccess: () => refetch(),
  });

  const adjustBalance = trpc.wallet.adminAdjustBalance.useMutation({
    onSuccess: () => {
      setShowWalletModal(false);
      setWalletAmount("");
      setWalletDescription("");
      refetchWallet();
    },
  });

  const tabs = [
    { id: "overview" as Tab, label: "Genel Bakış", icon: <User className="h-4 w-4" /> },
    { id: "wallet" as Tab, label: "Cüzdan", icon: <Wallet className="h-4 w-4" /> },
    { id: "sessions" as Tab, label: "Oturumlar", icon: <Monitor className="h-4 w-4" /> },
    { id: "security" as Tab, label: "Güvenlik", icon: <Shield className="h-4 w-4" /> },
    { id: "organizations" as Tab, label: "Organizasyonlar", icon: <Building2 className="h-4 w-4" /> },
    { id: "actions" as Tab, label: "İşlemler", icon: <Activity className="h-4 w-4" /> },
  ];

  const handleBan = () => {
    if (!banReason.trim()) {
      alert("Lütfen yasaklama sebebi girin.");
      return;
    }
    banUser.mutate({ userId, reason: banReason });
  };

  const handleUnban = () => {
    if (confirm("Kullanıcının yasağını kaldırmak istediğinizden emin misiniz?")) {
      unbanUser.mutate({ oderId: userId });
    }
  };

  const handleRevokeSessions = () => {
    if (confirm("Tüm oturumları sonlandırmak istediğinizden emin misiniz?")) {
      revokeSessions.mutate({ userId });
    }
  };

  const handleWalletAdjust = () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Geçerli bir tutar girin.");
      return;
    }
    adjustBalance.mutate({
      userId,
      amount: walletAction === "subtract" ? -amount : amount,
      description: walletDescription || (walletAction === "add" ? "Admin tarafından eklendi" : "Admin tarafından düşüldü"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Kullanıcı bulunamadı</h2>
        <Link href="/admin/users" className="text-primary hover:underline mt-2 inline-block">
          ← Kullanıcılara dön
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[user.status as UserStatus];
  const trustInfo = trustLevelConfig[user.trustLevel as TrustLevel];
  const StatusIcon = statusInfo?.icon || User;
  const TrustIcon = trustInfo?.icon || User;
  const activeBan = user.bans?.find((b: any) => b.active);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/admin/users"
          className="p-2 rounded-lg hover:bg-muted transition-colors mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img src={user.image} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.name || "İsimsiz Kullanıcı"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${statusInfo?.color || ""}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo?.label || user.status}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${trustInfo?.color || ""}`}>
                  <TrustIcon className="h-3 w-3" />
                  {trustInfo?.label || user.trustLevel}
                </span>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                    <Crown className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.status === "ACTIVE" && !activeBan && (
            <Button variant="outline" onClick={() => setShowBanModal(true)} className="text-red-600">
              <Ban className="h-4 w-4 mr-2" />
              Yasakla
            </Button>
          )}
          {activeBan && (
            <Button variant="outline" onClick={handleUnban} className="text-green-600">
              <Unlock className="h-4 w-4 mr-2" />
              Yasağı Kaldır
            </Button>
          )}
          <Button variant="outline" onClick={handleRevokeSessions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Oturumları Sonlandır
          </Button>
        </div>
      </div>

      {/* Active Ban Alert */}
      {activeBan && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Ban className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Bu kullanıcı yasaklı</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Sebep: {activeBan.reason}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Yasaklanma: {format(new Date(activeBan.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}
                {activeBan.expiresAt && (
                  <> • Bitiş: {format(new Date(activeBan.expiresAt), "d MMMM yyyy HH:mm", { locale: tr })}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Kullanıcı Bilgileri</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">ID</dt>
                  <dd className="font-mono text-sm">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">E-posta</dt>
                  <dd className="flex items-center gap-2">
                    {user.email}
                    {user.emailVerified && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Telefon</dt>
                  <dd>{user.profile?.phone || "-"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Dil</dt>
                  <dd>{user.preferredLanguage || "tr"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Kayıt Tarihi</dt>
                  <dd>{format(new Date(user.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Son Aktiflik</dt>
                  <dd>{user.lastActiveAt ? format(new Date(user.lastActiveAt), "d MMMM yyyy HH:mm", { locale: tr }) : "-"}</dd>
                </div>
              </dl>
            </Card>

            {user.profile && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Profil Bilgileri</h3>
                <dl className="grid grid-cols-2 gap-4">
                  {user.profile.firstName && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Ad</dt>
                      <dd>{user.profile.firstName}</dd>
                    </div>
                  )}
                  {user.profile.lastName && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Soyad</dt>
                      <dd>{user.profile.lastName}</dd>
                    </div>
                  )}
                  {user.profile.company && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Şirket</dt>
                      <dd>{user.profile.company}</dd>
                    </div>
                  )}
                  {user.profile.taxId && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Vergi No</dt>
                      <dd className="font-mono">{user.profile.taxId}</dd>
                    </div>
                  )}
                </dl>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Durum Yönetimi</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Hesap Durumu</label>
                  <select
                    value={user.status}
                    onChange={(e) => updateStatus.mutate({ userId, status: e.target.value as UserStatus })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                    disabled={updateStatus.isPending}
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="SUSPENDED">Askıda</option>
                    <option value="FROZEN">Dondurulmuş</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Güven Seviyesi</label>
                  <select
                    value={user.trustLevel}
                    onChange={(e) => updateTrustLevel.mutate({ userId, trustLevel: e.target.value as TrustLevel })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
                    disabled={updateTrustLevel.isPending}
                  >
                    <option value="GUEST">Misafir</option>
                    <option value="VERIFIED">Doğrulanmış</option>
                    <option value="SECURE">Güvenli</option>
                    <option value="CORPORATE">Kurumsal</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">2FA Durumu</h3>
              <div className="flex items-center gap-3">
                {user.twoFactorAuth?.enabled ? (
                  <>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600">Aktif</p>
                      <p className="text-sm text-muted-foreground">
                        {user.twoFactorAuth.verified ? "Doğrulanmış" : "Doğrulanmamış"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-600">Pasif</p>
                      <p className="text-sm text-muted-foreground">2FA etkin değil</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-blue-200">
              <p className="text-sm text-muted-foreground">Ana Bakiye</p>
              <p className="text-3xl font-bold text-blue-600">
                €{parseFloat(walletData?.mainBalance || "0").toFixed(2)}
              </p>
            </Card>
            <Card className="p-6 border-green-200">
              <p className="text-sm text-muted-foreground">Bonus Bakiye</p>
              <p className="text-3xl font-bold text-green-600">
                €{parseFloat(walletData?.bonusBalance || "0").toFixed(2)}
              </p>
            </Card>
            <Card className="p-6 border-purple-200">
              <p className="text-sm text-muted-foreground">Promo Bakiye</p>
              <p className="text-3xl font-bold text-purple-600">
                €{parseFloat(walletData?.promoBalance || "0").toFixed(2)}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Bakiye İşlemleri</h3>
              <Button onClick={() => setShowWalletModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Bakiye Düzenle
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Kullanıcı bakiyesini manuel olarak ekleyebilir veya düşürebilirsiniz.
            </p>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Aktif Oturumlar</h3>
            <Button variant="outline" onClick={handleRevokeSessions} disabled={revokeSessions.isPending}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tümünü Sonlandır
            </Button>
          </div>
          {user.userSessions?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aktif oturum yok</p>
          ) : (
            <div className="space-y-3">
              {user.userSessions?.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.userAgent || "Bilinmeyen Cihaz"}</p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ipAddress || "Bilinmiyor"} • Son aktiflik: {format(new Date(session.lastActiveAt), "d MMM HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Güvenlik Logları</h3>
          {user.securityLogs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Güvenlik logu yok</p>
          ) : (
            <div className="space-y-3">
              {user.securityLogs?.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                      {log.ipAddress && <> • IP: {log.ipAddress}</>}
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {typeof log.details === "string" ? log.details : JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Organizations Tab */}
      {activeTab === "organizations" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Organizasyon Üyelikleri</h3>
          {user.memberships?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Organizasyon üyeliği yok</p>
          ) : (
            <div className="space-y-3">
              {user.memberships?.map((membership: any) => (
                <div key={membership.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{membership.organization.name}</p>
                      <p className="text-sm text-muted-foreground">@{membership.organization.slug}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-muted rounded">{membership.role}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Actions Tab */}
      {activeTab === "actions" && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm">E-posta Gönder</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Key className="h-5 w-5" />
              <span className="text-sm">Şifre Sıfırla</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Send className="h-5 w-5" />
              <span className="text-sm">Bildirim Gönder</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Hesabı Sil</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="font-semibold text-lg mb-4">Kullanıcıyı Yasakla</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Yasaklama Sebebi</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Yasaklama sebebini açıklayın..."
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background min-h-[100px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowBanModal(false)}>
                İptal
              </Button>
              <Button onClick={handleBan} disabled={banUser.isPending} className="bg-red-600 hover:bg-red-700">
                {banUser.isPending ? "İşleniyor..." : "Yasakla"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="font-semibold text-lg mb-4">Bakiye Düzenle</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={walletAction === "add" ? "default" : "outline"}
                  onClick={() => setWalletAction("add")}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
                <Button
                  variant={walletAction === "subtract" ? "default" : "outline"}
                  onClick={() => setWalletAction("subtract")}
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Düş
                </Button>
              </div>
              <div>
                <label className="text-sm font-medium">Tutar (EUR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Açıklama</label>
                <Input
                  value={walletDescription}
                  onChange={(e) => setWalletDescription(e.target.value)}
                  placeholder="İşlem açıklaması..."
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowWalletModal(false)}>
                İptal
              </Button>
              <Button onClick={handleWalletAdjust} disabled={adjustBalance.isPending}>
                {adjustBalance.isPending ? "İşleniyor..." : "Uygula"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
