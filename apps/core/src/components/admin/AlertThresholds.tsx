"use client";

import { useState } from "react";
import { Bell, Plus, Trash2, Save, AlertTriangle, CheckCircle } from "lucide-react";

interface AlertThreshold {
  id: string;
  name: string;
  metric: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  value: number;
  severity: "info" | "warning" | "critical";
  isActive: boolean;
  notifyEmail: boolean;
  notifySlack: boolean;
}

const metricOptions = [
  { value: "active_users", label: "Aktif Kullanıcı Sayısı" },
  { value: "daily_registrations", label: "Günlük Kayıt Sayısı" },
  { value: "failed_logins", label: "Başarısız Giriş" },
  { value: "pending_support", label: "Bekleyen Destek Talebi" },
  { value: "wallet_balance", label: "Toplam Cüzdan Bakiyesi" },
  { value: "revenue_daily", label: "Günlük Gelir" },
  { value: "error_rate", label: "Hata Oranı (%)" },
  { value: "response_time", label: "Yanıt Süresi (ms)" },
];

const operatorOptions = [
  { value: "gt", label: ">" },
  { value: "gte", label: ">=" },
  { value: "lt", label: "<" },
  { value: "lte", label: "<=" },
  { value: "eq", label: "=" },
];

const severityOptions = [
  { value: "info", label: "Bilgi", color: "blue" },
  { value: "warning", label: "Uyarı", color: "amber" },
  { value: "critical", label: "Kritik", color: "red" },
];

export function AlertThresholds() {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    {
      id: "1",
      name: "Yüksek Başarısız Giriş",
      metric: "failed_logins",
      operator: "gt",
      value: 100,
      severity: "warning",
      isActive: true,
      notifyEmail: true,
      notifySlack: false,
    },
    {
      id: "2",
      name: "Düşük Günlük Kayıt",
      metric: "daily_registrations",
      operator: "lt",
      value: 10,
      severity: "info",
      isActive: true,
      notifyEmail: false,
      notifySlack: false,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newThreshold, setNewThreshold] = useState<Partial<AlertThreshold>>({
    metric: "active_users",
    operator: "gt",
    value: 0,
    severity: "warning",
    isActive: true,
    notifyEmail: true,
    notifySlack: false,
  });

  const addThreshold = () => {
    if (!newThreshold.name || !newThreshold.metric) return;

    setThresholds(prev => [...prev, {
      id: Date.now().toString(),
      name: newThreshold.name!,
      metric: newThreshold.metric!,
      operator: newThreshold.operator as AlertThreshold["operator"],
      value: newThreshold.value || 0,
      severity: newThreshold.severity as AlertThreshold["severity"],
      isActive: newThreshold.isActive || true,
      notifyEmail: newThreshold.notifyEmail || false,
      notifySlack: newThreshold.notifySlack || false,
    }]);

    setNewThreshold({
      metric: "active_users",
      operator: "gt",
      value: 0,
      severity: "warning",
      isActive: true,
      notifyEmail: true,
      notifySlack: false,
    });
    setIsAdding(false);
  };

  const deleteThreshold = (id: string) => {
    setThresholds(prev => prev.filter(t => t.id !== id));
  };

  const toggleThreshold = (id: string) => {
    setThresholds(prev => prev.map(t =>
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "warning": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="bg-white dark:bg-[#12121a] border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Alert Eşikleri
            </h3>
            <p className="text-sm text-slate-500">
              Sistem metriklerini izleyin ve uyarı alın
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni Eşik
        </button>
      </div>

      {/* Add New Threshold Form */}
      {isAdding && (
        <div className="mb-6 p-4 bg-slate-50 dark:bg-[#0d0d14] rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white mb-4">Yeni Alert Eşiği</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                İsim
              </label>
              <input
                type="text"
                value={newThreshold.name || ""}
                onChange={e => setNewThreshold(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
                placeholder="Eşik adı..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Metrik
              </label>
              <select
                value={newThreshold.metric}
                onChange={e => setNewThreshold(prev => ({ ...prev, metric: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              >
                {metricOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Operatör
              </label>
              <select
                value={newThreshold.operator}
                onChange={e => setNewThreshold(prev => ({ ...prev, operator: e.target.value as AlertThreshold["operator"] }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              >
                {operatorOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Değer
              </label>
              <input
                type="number"
                value={newThreshold.value || 0}
                onChange={e => setNewThreshold(prev => ({ ...prev, value: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">
                Önem Seviyesi
              </label>
              <select
                value={newThreshold.severity}
                onChange={e => setNewThreshold(prev => ({ ...prev, severity: e.target.value as AlertThreshold["severity"] }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white text-sm"
              >
                {severityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newThreshold.notifyEmail}
                  onChange={e => setNewThreshold(prev => ({ ...prev, notifyEmail: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newThreshold.notifySlack}
                  onChange={e => setNewThreshold(prev => ({ ...prev, notifySlack: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Slack</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm"
            >
              İptal
            </button>
            <button
              onClick={addThreshold}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Thresholds List */}
      <div className="space-y-3">
        {thresholds.map(threshold => (
          <div
            key={threshold.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              threshold.isActive
                ? "bg-white dark:bg-[#0d0d14] border-slate-200 dark:border-slate-700"
                : "bg-slate-50 dark:bg-[#0a0a0f] border-slate-100 dark:border-slate-800 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${
                threshold.isActive ? "bg-green-500" : "bg-slate-400"
              }`} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {threshold.name}
                </p>
                <p className="text-sm text-slate-500">
                  {metricOptions.find(m => m.value === threshold.metric)?.label}{" "}
                  {operatorOptions.find(o => o.value === threshold.operator)?.label}{" "}
                  {threshold.value}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threshold.severity)}`}>
                {severityOptions.find(s => s.value === threshold.severity)?.label}
              </span>
              <button
                onClick={() => toggleThreshold(threshold.id)}
                className={`p-2 rounded-lg transition-colors ${
                  threshold.isActive
                    ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {threshold.isActive ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => deleteThreshold(threshold.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {thresholds.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            Henüz alert eşiği tanımlanmamış
          </div>
        )}
      </div>
    </div>
  );
}
