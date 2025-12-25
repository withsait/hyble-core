"use client";

import { useState } from "react";
import { Settings, GripVertical, Eye, EyeOff, Save, RotateCcw } from "lucide-react";

interface Widget {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

const defaultWidgets: Widget[] = [
  { id: "stats", name: "Ana İstatistikler", enabled: true, order: 0 },
  { id: "secondary-stats", name: "İkincil İstatistikler", enabled: true, order: 1 },
  { id: "quick-actions", name: "Hızlı İşlemler", enabled: true, order: 2 },
  { id: "registration-chart", name: "Kayıt Grafiği", enabled: true, order: 3 },
  { id: "recent-users", name: "Son Kullanıcılar", enabled: true, order: 4 },
  { id: "pending-support", name: "Bekleyen Destek", enabled: false, order: 5 },
  { id: "revenue-chart", name: "Gelir Grafiği", enabled: false, order: 6 },
  { id: "active-sessions", name: "Aktif Oturumlar", enabled: false, order: 7 },
];

export function DashboardCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
    setHasChanges(true);
  };

  const moveWidget = (id: string, direction: "up" | "down") => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newWidgets = [...prev];
      const temp = newWidgets[index]!;
      newWidgets[index] = newWidgets[newIndex]!;
      newWidgets[newIndex] = temp;
      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      await fetch("/api/admin/dashboard-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const resetToDefault = () => {
    setWidgets(defaultWidgets);
    setHasChanges(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors z-50"
        title="Dashboard Ayarları"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#12121a] rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Dashboard Özelleştirme
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Widget'ları sürükleyerek sıralayın, göz ikonuna tıklayarak gizleyin.
          </p>

          <div className="space-y-2">
            {widgets.sort((a, b) => a.order - b.order).map((widget, index) => (
              <div
                key={widget.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  widget.enabled
                    ? "bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-slate-700"
                    : "bg-slate-50 dark:bg-[#0a0a0f] border-slate-100 dark:border-slate-800 opacity-60"
                }`}
              >
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />

                <span className={`flex-1 text-sm ${
                  widget.enabled
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-500"
                }`}>
                  {widget.name}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveWidget(widget.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, "down")}
                    disabled={index === widgets.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`p-1.5 rounded ${
                      widget.enabled
                        ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            Varsayılana Dön
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
