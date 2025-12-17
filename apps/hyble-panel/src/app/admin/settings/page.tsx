"use client";

import { useState } from "react";
import { Card, Button, Input } from "@hyble/ui";

const Label = ({ children, className = "", htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>{children}</label>
);
import {
  Settings,
  Shield,
  Database,
  CreditCard,
  Mail,
  Cloud,
  Bot,
  Activity,
  Bell,
  Ticket,
  Package,
  Wallet,
  Globe,
  Server,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";

type SettingsSection =
  | "general"
  | "auth"
  | "billing"
  | "email"
  | "cloud"
  | "hyla"
  | "watch"
  | "notify"
  | "support"
  | "pim"
  | "wallet";

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: "text" | "number" | "boolean" | "select" | "textarea";
  value: string | number | boolean;
  options?: { value: string; label: string }[];
}

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sections = [
    { id: "general" as SettingsSection, label: "Genel", icon: <Settings className="h-4 w-4" /> },
    { id: "auth" as SettingsSection, label: "Kimlik Doğrulama", icon: <Shield className="h-4 w-4" /> },
    { id: "billing" as SettingsSection, label: "Faturalama", icon: <CreditCard className="h-4 w-4" /> },
    { id: "email" as SettingsSection, label: "Email", icon: <Mail className="h-4 w-4" /> },
    { id: "cloud" as SettingsSection, label: "Cloud Hosting", icon: <Cloud className="h-4 w-4" /> },
    { id: "hyla" as SettingsSection, label: "Hyla AI", icon: <Bot className="h-4 w-4" /> },
    { id: "watch" as SettingsSection, label: "Monitoring", icon: <Activity className="h-4 w-4" /> },
    { id: "notify" as SettingsSection, label: "Bildirimler", icon: <Bell className="h-4 w-4" /> },
    { id: "support" as SettingsSection, label: "Destek", icon: <Ticket className="h-4 w-4" /> },
    { id: "pim" as SettingsSection, label: "Ürün Yönetimi", icon: <Package className="h-4 w-4" /> },
    { id: "wallet" as SettingsSection, label: "Cüzdan", icon: <Wallet className="h-4 w-4" /> },
  ];

  // Settings data for each section
  const settingsData: Record<SettingsSection, SettingItem[]> = {
    general: [
      { key: "site_name", label: "Site Adı", description: "Platform adı", type: "text", value: "Hyble" },
      { key: "site_url", label: "Site URL", description: "Ana site adresi", type: "text", value: "https://hyble.co" },
      { key: "maintenance_mode", label: "Bakım Modu", description: "Siteyi bakım moduna al", type: "boolean", value: false },
      { key: "default_language", label: "Varsayılan Dil", description: "Varsayılan arayüz dili", type: "select", value: "tr", options: [{ value: "tr", label: "Türkçe" }, { value: "en", label: "English" }] },
      { key: "default_currency", label: "Varsayılan Para Birimi", description: "Varsayılan para birimi", type: "select", value: "EUR", options: [{ value: "EUR", label: "Euro (€)" }, { value: "USD", label: "US Dollar ($)" }, { value: "GBP", label: "British Pound (£)" }, { value: "TRY", label: "Türk Lirası (₺)" }] },
    ],
    auth: [
      { key: "require_email_verification", label: "Email Doğrulama Zorunlu", description: "Kayıt sonrası email doğrulaması iste", type: "boolean", value: true },
      { key: "require_2fa_admin", label: "Admin 2FA Zorunlu", description: "Admin kullanıcılar için 2FA zorunlu", type: "boolean", value: true },
      { key: "session_duration_hours", label: "Oturum Süresi (saat)", description: "Oturumların geçerlilik süresi", type: "number", value: 168 },
      { key: "max_login_attempts", label: "Max Giriş Denemesi", description: "Hesap kilitlenmeden önce max deneme", type: "number", value: 5 },
      { key: "lockout_duration_minutes", label: "Kilit Süresi (dakika)", description: "Hesap kilit süresi", type: "number", value: 30 },
      { key: "password_min_length", label: "Min Şifre Uzunluğu", description: "Minimum şifre karakter sayısı", type: "number", value: 8 },
      { key: "allow_oauth_google", label: "Google OAuth", description: "Google ile giriş izin ver", type: "boolean", value: true },
      { key: "allow_oauth_github", label: "GitHub OAuth", description: "GitHub ile giriş izin ver", type: "boolean", value: true },
    ],
    billing: [
      { key: "stripe_mode", label: "Stripe Modu", description: "Canlı veya test modu", type: "select", value: "test", options: [{ value: "test", label: "Test" }, { value: "live", label: "Canlı" }] },
      { key: "stripe_public_key", label: "Stripe Public Key", description: "Stripe Publishable Key", type: "text", value: "pk_test_..." },
      { key: "invoice_prefix", label: "Fatura Öneki", description: "Fatura numarası öneki", type: "text", value: "HYB" },
      { key: "invoice_due_days", label: "Fatura Vadesi (gün)", description: "Fatura ödeme süresi", type: "number", value: 14 },
      { key: "tax_rate", label: "KDV Oranı (%)", description: "Varsayılan vergi oranı", type: "number", value: 20 },
      { key: "grace_period_days", label: "Ek Süre (gün)", description: "Fatura sonrası ek süre", type: "number", value: 3 },
      { key: "auto_suspend_overdue", label: "Otomatik Askıya Al", description: "Geciken hesapları otomatik askıya al", type: "boolean", value: true },
      { key: "min_deposit_amount", label: "Min Yükleme (€)", description: "Minimum bakiye yükleme", type: "number", value: 5 },
    ],
    email: [
      { key: "email_provider", label: "Email Sağlayıcı", description: "Email gönderim servisi", type: "select", value: "resend", options: [{ value: "resend", label: "Resend" }, { value: "sendgrid", label: "SendGrid" }, { value: "ses", label: "Amazon SES" }] },
      { key: "from_email", label: "Gönderen Email", description: "Varsayılan gönderen adresi", type: "text", value: "noreply@hyble.co" },
      { key: "from_name", label: "Gönderen Adı", description: "Varsayılan gönderen adı", type: "text", value: "Hyble" },
      { key: "reply_to_email", label: "Yanıt Adresi", description: "Yanıtların gideceği adres", type: "text", value: "support@hyble.co" },
      { key: "email_footer", label: "Email Alt Bilgi", description: "Tüm emaillerde görünecek alt bilgi", type: "textarea", value: "Hyble Ltd. | London, UK" },
      { key: "track_opens", label: "Açılma Takibi", description: "Email açılmalarını takip et", type: "boolean", value: true },
      { key: "track_clicks", label: "Tıklama Takibi", description: "Link tıklamalarını takip et", type: "boolean", value: true },
    ],
    cloud: [
      { key: "max_sites_free", label: "Free Plan Max Site", description: "Ücretsiz planda max site sayısı", type: "number", value: 1 },
      { key: "max_sites_starter", label: "Starter Plan Max Site", description: "Starter planda max site sayısı", type: "number", value: 3 },
      { key: "max_sites_business", label: "Business Plan Max Site", description: "Business planda max site sayısı", type: "number", value: 10 },
      { key: "bandwidth_free_gb", label: "Free Bandwidth (GB)", description: "Ücretsiz plan aylık bant genişliği", type: "number", value: 10 },
      { key: "bandwidth_starter_gb", label: "Starter Bandwidth (GB)", description: "Starter plan aylık bant genişliği", type: "number", value: 50 },
      { key: "bandwidth_business_gb", label: "Business Bandwidth (GB)", description: "Business plan aylık bant genişliği", type: "number", value: 200 },
      { key: "storage_free_mb", label: "Free Storage (MB)", description: "Ücretsiz plan depolama", type: "number", value: 100 },
      { key: "storage_starter_gb", label: "Starter Storage (GB)", description: "Starter plan depolama", type: "number", value: 1 },
      { key: "storage_business_gb", label: "Business Storage (GB)", description: "Business plan depolama", type: "number", value: 5 },
      { key: "build_timeout_minutes", label: "Build Timeout (dk)", description: "Max build süresi", type: "number", value: 15 },
      { key: "auto_deploy_on_push", label: "Push'ta Otomatik Deploy", description: "Git push'ta otomatik deploy", type: "boolean", value: true },
    ],
    hyla: [
      { key: "hyla_enabled", label: "Hyla AI Aktif", description: "AI asistanı aktif et", type: "boolean", value: true },
      { key: "ai_model", label: "AI Model", description: "Kullanılacak AI modeli", type: "select", value: "gpt-4o-mini", options: [{ value: "gpt-4o-mini", label: "GPT-4o Mini" }, { value: "gpt-4o", label: "GPT-4o" }, { value: "claude-3-haiku", label: "Claude 3 Haiku" }] },
      { key: "max_tokens", label: "Max Token", description: "Yanıt başına max token", type: "number", value: 1000 },
      { key: "temperature", label: "Temperature", description: "AI yaratıcılık seviyesi (0-1)", type: "number", value: 0.7 },
      { key: "rate_limit_per_hour", label: "Saat Başı Limit", description: "Kullanıcı başı saatlik istek limiti", type: "number", value: 50 },
      { key: "handoff_threshold", label: "Handoff Eşiği", description: "İnsan desteğine aktarma skoru", type: "number", value: 0.3 },
      { key: "collect_feedback", label: "Geri Bildirim Topla", description: "Kullanıcı geri bildirimi al", type: "boolean", value: true },
      { key: "show_kb_sources", label: "Kaynak Göster", description: "Yanıtlarda KB kaynaklarını göster", type: "boolean", value: true },
    ],
    watch: [
      { key: "monitoring_enabled", label: "Monitoring Aktif", description: "Sistem izlemeyi aktif et", type: "boolean", value: true },
      { key: "default_check_interval", label: "Varsayılan Kontrol Aralığı (sn)", description: "Monitörler için varsayılan aralık", type: "number", value: 60 },
      { key: "min_check_interval", label: "Min Kontrol Aralığı (sn)", description: "İzin verilen minimum aralık", type: "number", value: 30 },
      { key: "alert_cooldown_minutes", label: "Alarm Bekleme (dk)", description: "Tekrar alarm süresi", type: "number", value: 15 },
      { key: "metrics_retention_days", label: "Metrik Saklama (gün)", description: "Metriklerin saklanma süresi", type: "number", value: 30 },
      { key: "cpu_warning_threshold", label: "CPU Uyarı Eşiği (%)", description: "CPU uyarı seviyesi", type: "number", value: 80 },
      { key: "cpu_critical_threshold", label: "CPU Kritik Eşik (%)", description: "CPU kritik seviyesi", type: "number", value: 95 },
      { key: "memory_warning_threshold", label: "RAM Uyarı Eşiği (%)", description: "RAM uyarı seviyesi", type: "number", value: 80 },
      { key: "disk_warning_threshold", label: "Disk Uyarı Eşiği (%)", description: "Disk uyarı seviyesi", type: "number", value: 85 },
    ],
    notify: [
      { key: "notifications_enabled", label: "Bildirimler Aktif", description: "Bildirim sistemini aktif et", type: "boolean", value: true },
      { key: "email_notifications", label: "Email Bildirimleri", description: "Email ile bildirim gönder", type: "boolean", value: true },
      { key: "push_notifications", label: "Push Bildirimleri", description: "Tarayıcı push bildirimi gönder", type: "boolean", value: true },
      { key: "sms_notifications", label: "SMS Bildirimleri", description: "SMS ile bildirim gönder", type: "boolean", value: false },
      { key: "webhook_timeout_seconds", label: "Webhook Timeout (sn)", description: "Webhook istek zaman aşımı", type: "number", value: 10 },
      { key: "webhook_retry_count", label: "Webhook Deneme Sayısı", description: "Başarısız webhook tekrar sayısı", type: "number", value: 3 },
      { key: "digest_enabled", label: "Özet Bildirimi", description: "Günlük/haftalık özet gönder", type: "boolean", value: true },
      { key: "digest_frequency", label: "Özet Sıklığı", description: "Özet bildirim sıklığı", type: "select", value: "daily", options: [{ value: "daily", label: "Günlük" }, { value: "weekly", label: "Haftalık" }] },
    ],
    support: [
      { key: "support_enabled", label: "Destek Sistemi Aktif", description: "Destek bilet sistemini aktif et", type: "boolean", value: true },
      { key: "auto_assign_tickets", label: "Otomatik Atama", description: "Biletleri otomatik ata", type: "boolean", value: true },
      { key: "sla_response_hours", label: "SLA Yanıt Süresi (saat)", description: "İlk yanıt için max süre", type: "number", value: 24 },
      { key: "sla_resolution_hours", label: "SLA Çözüm Süresi (saat)", description: "Çözüm için max süre", type: "number", value: 72 },
      { key: "auto_close_days", label: "Otomatik Kapama (gün)", description: "İnaktif bilet kapama süresi", type: "number", value: 7 },
      { key: "csat_enabled", label: "CSAT Anketi", description: "Müşteri memnuniyet anketi gönder", type: "boolean", value: true },
      { key: "csat_delay_hours", label: "CSAT Gecikmesi (saat)", description: "Anket gönderme gecikmesi", type: "number", value: 24 },
      { key: "max_attachments", label: "Max Ek Sayısı", description: "Mesaj başına max dosya eki", type: "number", value: 5 },
      { key: "max_attachment_size_mb", label: "Max Dosya Boyutu (MB)", description: "Dosya eki boyut limiti", type: "number", value: 10 },
    ],
    pim: [
      { key: "pim_enabled", label: "PIM Aktif", description: "Ürün yönetim sistemini aktif et", type: "boolean", value: true },
      { key: "enable_variants", label: "Varyantlar", description: "Ürün varyantlarını aktif et", type: "boolean", value: true },
      { key: "enable_bundles", label: "Paketler", description: "Ürün paketlerini aktif et", type: "boolean", value: true },
      { key: "max_images_per_product", label: "Max Görsel Sayısı", description: "Ürün başına max görsel", type: "number", value: 10 },
      { key: "image_max_size_mb", label: "Görsel Max Boyut (MB)", description: "Görsel dosya boyut limiti", type: "number", value: 5 },
      { key: "enable_seo", label: "SEO Alanları", description: "SEO meta alanlarını göster", type: "boolean", value: true },
      { key: "default_product_status", label: "Varsayılan Ürün Durumu", description: "Yeni ürünlerin varsayılan durumu", type: "select", value: "DRAFT", options: [{ value: "DRAFT", label: "Taslak" }, { value: "ACTIVE", label: "Aktif" }] },
      { key: "low_stock_threshold", label: "Düşük Stok Eşiği", description: "Düşük stok uyarı seviyesi", type: "number", value: 5 },
    ],
    wallet: [
      { key: "wallet_enabled", label: "Cüzdan Aktif", description: "Cüzdan sistemini aktif et", type: "boolean", value: true },
      { key: "bonus_enabled", label: "Bonus Sistemi", description: "Bonus bakiye sistemini aktif et", type: "boolean", value: true },
      { key: "promo_enabled", label: "Promosyon Sistemi", description: "Promosyon bakiyesini aktif et", type: "boolean", value: true },
      { key: "spending_priority", label: "Harcama Önceliği", description: "Bakiye kullanım sırası", type: "select", value: "PROMO_BONUS_MAIN", options: [{ value: "PROMO_BONUS_MAIN", label: "Promo > Bonus > Ana" }, { value: "BONUS_PROMO_MAIN", label: "Bonus > Promo > Ana" }, { value: "MAIN_ONLY", label: "Sadece Ana Bakiye" }] },
      { key: "min_deposit", label: "Min Yükleme (€)", description: "Minimum bakiye yükleme tutarı", type: "number", value: 5 },
      { key: "max_deposit", label: "Max Yükleme (€)", description: "Maksimum bakiye yükleme tutarı", type: "number", value: 1000 },
      { key: "deposit_bonus_percent", label: "Yükleme Bonusu (%)", description: "Yükleme bonus oranı", type: "number", value: 10 },
      { key: "bonus_min_deposit", label: "Bonus Min Yükleme (€)", description: "Bonus için min yükleme", type: "number", value: 20 },
      { key: "voucher_enabled", label: "Kupon Sistemi", description: "Kupon kodlarını aktif et", type: "boolean", value: true },
    ],
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement actual save via tRPC
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderSettingInput = (setting: SettingItem) => {
    switch (setting.type) {
      case "boolean":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={setting.value as boolean}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        );
      case "select":
        return (
          <select
            defaultValue={setting.value as string}
            className="w-full border rounded-lg px-3 py-2 bg-background"
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            defaultValue={setting.value as string}
            className="w-full border rounded-lg px-3 py-2 bg-background min-h-[80px]"
          />
        );
      case "number":
        return (
          <Input
            type="number"
            defaultValue={setting.value as number}
            className="max-w-[150px]"
          />
        );
      default:
        return (
          <Input
            type="text"
            defaultValue={setting.value as string}
          />
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="h-7 w-7 text-primary" />
            Sistem Ayarları
          </h1>
          <p className="text-muted-foreground mt-1">
            Platform yapılandırmasını yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              Kaydedildi
            </span>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <Card className="w-64 p-2 h-fit sticky top-6 flex-shrink-0">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              {sections.find((s) => s.id === activeSection)?.icon}
              {sections.find((s) => s.id === activeSection)?.label} Ayarları
            </h2>

            <div className="space-y-6">
              {settingsData[activeSection].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-start justify-between py-4 border-b last:border-0"
                >
                  <div className="flex-1 pr-4">
                    <Label className="text-sm font-medium">{setting.label}</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* API Keys Section - Only show for relevant sections */}
          {(activeSection === "billing" || activeSection === "email" || activeSection === "hyla") && (
            <Card className="p-6 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <Key className="h-5 w-5" />
                API Anahtarları
              </h3>
              <div className="space-y-4">
                {activeSection === "billing" && (
                  <>
                    <div>
                      <Label className="text-sm">Stripe Secret Key</Label>
                      <Input type="password" defaultValue="sk_test_..." className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm">Stripe Webhook Secret</Label>
                      <Input type="password" defaultValue="whsec_..." className="mt-1" />
                    </div>
                  </>
                )}
                {activeSection === "email" && (
                  <div>
                    <Label className="text-sm">Resend API Key</Label>
                    <Input type="password" defaultValue="re_..." className="mt-1" />
                  </div>
                )}
                {activeSection === "hyla" && (
                  <div>
                    <Label className="text-sm">OpenAI API Key</Label>
                    <Input type="password" defaultValue="sk-..." className="mt-1" />
                  </div>
                )}
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-4 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                API anahtarları güvenli şekilde saklanır ve maskelenir
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
