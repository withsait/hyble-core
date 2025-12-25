"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";

interface SettingSection {
  id: string;
  title: string;
  icon: any;
  description: string;
}

const sections: SettingSection[] = [
  { id: "general", title: "Genel Ayarlar", icon: Globe, description: "Site adı, dil, para birimi" },
  { id: "email", title: "Email Ayarları", icon: Mail, description: "SMTP ve email bildirimleri" },
  { id: "payment", title: "Ödeme Ayarları", icon: CreditCard, description: "Ödeme sağlayıcıları" },
  { id: "security", title: "Güvenlik", icon: Shield, description: "Güvenlik politikaları" },
  { id: "notifications", title: "Bildirimler", icon: Bell, description: "Bildirim tercihleri" },
  { id: "appearance", title: "Görünüm", icon: Palette, description: "Tema ve marka" },
  { id: "api", title: "API Anahtarları", icon: Key, description: "API entegrasyonları" },
  { id: "database", title: "Veritabanı", icon: Database, description: "Veritabanı bakımı" },
];

export function SystemSettings() {
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trpc/settings.getAll");
      const data = await response.json();
      if (data.result?.data) {
        setSettings(data.result.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/trpc/settings.updateAll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: settings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Site Adı
        </label>
        <input
          type="text"
          value={settings.siteName || ""}
          onChange={(e) => updateSetting("siteName", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Site URL
        </label>
        <input
          type="url"
          value={settings.siteUrl || ""}
          onChange={(e) => updateSetting("siteUrl", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Varsayılan Dil
          </label>
          <select
            value={settings.defaultLanguage || "tr"}
            onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Varsayılan Para Birimi
          </label>
          <select
            value={settings.defaultCurrency || "TRY"}
            onChange={(e) => updateSetting("defaultCurrency", e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          >
            <option value="TRY">TRY - Türk Lirası</option>
            <option value="USD">USD - Amerikan Doları</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - İngiliz Sterlini</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Zaman Dilimi
        </label>
        <select
          value={settings.timezone || "Europe/Istanbul"}
          onChange={(e) => updateSetting("timezone", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        >
          <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="America/New_York">America/New_York (GMT-5)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
        </select>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">Bakım Modu</p>
          <p className="text-sm text-slate-500">Site bakım moduna alınır, sadece adminler erişebilir</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode || false}
            onChange={(e) => updateSetting("maintenanceMode", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Email Sağlayıcısı
        </label>
        <select
          value={settings.emailProvider || "resend"}
          onChange={(e) => updateSetting("emailProvider", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        >
          <option value="resend">Resend</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
          <option value="ses">Amazon SES</option>
          <option value="smtp">Custom SMTP</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Gönderen Email
        </label>
        <input
          type="email"
          value={settings.fromEmail || ""}
          onChange={(e) => updateSetting("fromEmail", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          placeholder="noreply@hyble.co"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Gönderen Adı
        </label>
        <input
          type="text"
          value={settings.fromName || ""}
          onChange={(e) => updateSetting("fromName", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          placeholder="Hyble"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          API Anahtarı
        </label>
        <div className="relative">
          <input
            type={showSecrets.emailApiKey ? "text" : "password"}
            value={settings.emailApiKey || ""}
            onChange={(e) => updateSetting("emailApiKey", e.target.value)}
            className="w-full px-4 py-2 pr-20 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={() => toggleShowSecret("emailApiKey")}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              {showSecrets.emailApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(settings.emailApiKey || "")}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Email Bildirimleri</h4>
        <div className="space-y-2">
          {[
            { key: "emailWelcome", label: "Hoşgeldin emaili" },
            { key: "emailOrderConfirmation", label: "Sipariş onayı" },
            { key: "emailPaymentReceipt", label: "Ödeme makbuzu" },
            { key: "emailPasswordReset", label: "Şifre sıfırlama" },
            { key: "emailNewsletter", label: "Bülten" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings[item.key] !== false}
                onChange={(e) => updateSetting(item.key, e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/icons/stripe.svg" alt="Stripe" className="w-8 h-8" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Stripe</p>
              <p className="text-xs text-slate-500">Uluslararası ödemeler</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.stripeEnabled || false}
              onChange={(e) => updateSetting("stripeEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
        {settings.stripeEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets.stripeSecret ? "text" : "password"}
                  value={settings.stripeSecretKey || ""}
                  onChange={(e) => updateSetting("stripeSecretKey", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                  placeholder="sk_..."
                />
                <button
                  onClick={() => toggleShowSecret("stripeSecret")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                >
                  {showSecrets.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Publishable Key</label>
              <input
                type="text"
                value={settings.stripePublishableKey || ""}
                onChange={(e) => updateSetting("stripePublishableKey", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                placeholder="pk_..."
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/icons/iyzico.svg" alt="iyzico" className="w-8 h-8" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">iyzico</p>
              <p className="text-xs text-slate-500">Türkiye ödemeleri</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.iyzicoEnabled || false}
              onChange={(e) => updateSetting("iyzicoEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
        {settings.iyzicoEnabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">API Key</label>
              <input
                type="text"
                value={settings.iyzicoApiKey || ""}
                onChange={(e) => updateSetting("iyzicoApiKey", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Secret Key</label>
              <div className="relative">
                <input
                  type={showSecrets.iyzicoSecret ? "text" : "password"}
                  value={settings.iyzicoSecretKey || ""}
                  onChange={(e) => updateSetting("iyzicoSecretKey", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => toggleShowSecret("iyzicoSecret")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                >
                  {showSecrets.iyzicoSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/icons/paypal.svg" alt="PayPal" className="w-8 h-8" />
            <div>
              <p className="font-medium text-slate-900 dark:text-white">PayPal</p>
              <p className="text-xs text-slate-500">Global ödemeler</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paypalEnabled || false}
              onChange={(e) => updateSetting("paypalEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">İki Faktörlü Doğrulama Zorunluluğu</p>
          <p className="text-sm text-slate-500">Tüm kullanıcılar için 2FA zorunlu olsun</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.require2FA || false}
            onChange={(e) => updateSetting("require2FA", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Oturum Süresi (dakika)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout || 1440}
          onChange={(e) => updateSetting("sessionTimeout", parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Başarısız Giriş Limiti
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts || 5}
          onChange={(e) => updateSetting("maxLoginAttempts", parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Hesap Kilitleme Süresi (dakika)
        </label>
        <input
          type="number"
          value={settings.lockoutDuration || 30}
          onChange={(e) => updateSetting("lockoutDuration", parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-lg">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">IP Rate Limiting</p>
          <p className="text-sm text-slate-500">API isteklerini IP bazında sınırla</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.rateLimitEnabled !== false}
            onChange={(e) => updateSetting("rateLimitEnabled", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer dark:bg-slate-700 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            API Anahtarları Güvenlik Uyarısı
          </p>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          API anahtarlarını güvenli bir şekilde saklayın ve asla istemci tarafında kullanmayın.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Claude API Key (Anthropic)
        </label>
        <div className="relative">
          <input
            type={showSecrets.claudeApiKey ? "text" : "password"}
            value={settings.claudeApiKey || ""}
            onChange={(e) => updateSetting("claudeApiKey", e.target.value)}
            className="w-full px-4 py-2 pr-20 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
            placeholder="sk-ant-..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button onClick={() => toggleShowSecret("claudeApiKey")} className="p-1 text-slate-400">
              {showSecrets.claudeApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Google Gemini API Key
        </label>
        <div className="relative">
          <input
            type={showSecrets.geminiApiKey ? "text" : "password"}
            value={settings.geminiApiKey || ""}
            onChange={(e) => updateSetting("geminiApiKey", e.target.value)}
            className="w-full px-4 py-2 pr-20 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
            placeholder="AIza..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button onClick={() => toggleShowSecret("geminiApiKey")} className="p-1 text-slate-400">
              {showSecrets.geminiApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Google Analytics ID
        </label>
        <input
          type="text"
          value={settings.googleAnalyticsId || ""}
          onChange={(e) => updateSetting("googleAnalyticsId", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          placeholder="G-XXXXXXXXXX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Google reCAPTCHA Site Key
        </label>
        <input
          type="text"
          value={settings.recaptchaSiteKey || ""}
          onChange={(e) => updateSetting("recaptchaSiteKey", e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Google reCAPTCHA Secret Key
        </label>
        <div className="relative">
          <input
            type={showSecrets.recaptchaSecret ? "text" : "password"}
            value={settings.recaptchaSecretKey || ""}
            onChange={(e) => updateSetting("recaptchaSecretKey", e.target.value)}
            className="w-full px-4 py-2 pr-20 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white"
          />
          <button onClick={() => toggleShowSecret("recaptchaSecret")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400">
            {showSecrets.recaptchaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "email":
        return renderEmailSettings();
      case "payment":
        return renderPaymentSettings();
      case "security":
        return renderSecuritySettings();
      case "api":
        return renderApiSettings();
      default:
        return (
          <div className="text-center py-12 text-slate-500">
            Bu bölüm yakında eklenecek...
          </div>
        );
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Sistem Ayarları</h3>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <section.icon className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-slate-400">{section.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-sm text-slate-500">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                saved
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Kaydedildi" : "Kaydet"}
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
