"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, Button } from "@hyble/ui";
import {
  Bell,
  Mail,
  Smartphone,
  Webhook,
  Loader2,
  Save,
  Check,
} from "lucide-react";

type Channel = "EMAIL" | "IN_APP" | "PUSH" | "WEBHOOK";
type NotificationType = "transactional" | "system" | "marketing";

interface Preference {
  id: string;
  channel: Channel;
  enabled: boolean;
  categories?: Record<NotificationType, boolean>;
}

const channelConfig: Record<Channel, { icon: React.ReactNode; label: string; description: string }> = {
  EMAIL: { icon: <Mail className="h-5 w-5" />, label: "Email", description: "Fatura, şifre sıfırlama gibi önemli bildirimleri email ile alın" },
  IN_APP: { icon: <Bell className="h-5 w-5" />, label: "Panel İçi", description: "Panel üzerinden anlık bildirimler" },
  PUSH: { icon: <Smartphone className="h-5 w-5" />, label: "Push Bildirim", description: "Tarayıcı üzerinden anlık bildirimler" },
  WEBHOOK: { icon: <Webhook className="h-5 w-5" />, label: "Webhook", description: "Kendi sistemlerinize otomatik bildirim (B2B)" },
};

const categoryLabels: Record<NotificationType, { label: string; description: string; required?: boolean }> = {
  transactional: { label: "İşlemsel", description: "Fatura, ödeme, şifre sıfırlama", required: true },
  system: { label: "Sistem", description: "Bakım, kesinti, güncelleme bildirimleri" },
  marketing: { label: "Pazarlama", description: "Kampanya ve promosyon bildirimleri" },
};

export function NotificationPreferences() {
  const [localPrefs, setLocalPrefs] = useState<Record<Channel, boolean>>({
    EMAIL: true,
    IN_APP: true,
    PUSH: false,
    WEBHOOK: false,
  });
  const [categoryPrefs, setCategoryPrefs] = useState<Record<NotificationType, boolean>>({
    transactional: true,
    system: true,
    marketing: false,
  });

  const { data, isLoading } = trpc.notifications.getPreferences.useQuery();

  const updatePreferences = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      // Show success message
    },
  });

  useEffect(() => {
    if (data?.preferences) {
      const prefs: Record<Channel, boolean> = { EMAIL: true, IN_APP: true, PUSH: false, WEBHOOK: false };
      data.preferences.forEach((p: Preference) => {
        prefs[p.channel] = p.enabled;
      });
      setLocalPrefs(prefs);
    }
  }, [data]);

  const handleToggle = (channel: Channel) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleCategoryToggle = (category: NotificationType) => {
    if (categoryLabels[category].required) return;
    setCategoryPrefs((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    const preferences = Object.entries(localPrefs).map(([channel, enabled]) => ({
      channel: channel as Channel,
      enabled,
      categories: categoryPrefs,
    }));
    updatePreferences.mutate({ preferences });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel Preferences */}
      <Card className="p-6">
        <h3 className="font-semibold mb-1">Bildirim Kanalları</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Hangi kanallardan bildirim almak istediğinizi seçin
        </p>

        <div className="space-y-4">
          {(Object.keys(channelConfig) as Channel[]).map((channel) => {
            const config = channelConfig[channel];
            const isEnabled = localPrefs[channel];

            return (
              <div
                key={channel}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(channel)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Preferences */}
      <Card className="p-6">
        <h3 className="font-semibold mb-1">Bildirim Türleri</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Hangi tür bildirimleri almak istediğinizi seçin
        </p>

        <div className="space-y-4">
          {(Object.keys(categoryLabels) as NotificationType[]).map((category) => {
            const config = categoryLabels[category];
            const isEnabled = categoryPrefs[category];

            return (
              <div
                key={category}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{config.label}</p>
                    {config.required && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        Zorunlu
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </div>
                <button
                  onClick={() => handleCategoryToggle(category)}
                  disabled={config.required}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isEnabled ? "bg-primary" : "bg-muted"
                  } ${config.required ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      isEnabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updatePreferences.isPending}>
          {updatePreferences.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : updatePreferences.isSuccess ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Kaydet
        </Button>
      </div>
    </div>
  );
}
