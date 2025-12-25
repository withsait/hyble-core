"use client";

import { useState } from "react";
import {
  Activity,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Cpu,
  MemoryStick,
  Wifi,
  FileArchive,
  History,
  Settings,
  Flag,
  Calendar,
  Trash2,
  Eye,
  Play,
  Pause,
} from "lucide-react";

// Mock data for demonstration
const mockSystemHealth = {
  status: "healthy",
  uptime: "14d 6h 23m",
  version: "1.0.0",
  checks: {
    database: { status: "healthy", latency: 12 },
    redis: { status: "healthy", latency: 3 },
    storage: { status: "healthy", used: "45%" },
  },
};

const mockStats = {
  cpu: 32,
  memory: 58,
  disk: 45,
  network: 120,
  requests: 1234,
  errors: 12,
};

const mockErrors = [
  {
    id: "1",
    message: "Database connection timeout",
    category: "database",
    severity: "high",
    count: 5,
    occurredAt: "2025-01-10T10:30:00Z",
    resolved: false,
  },
  {
    id: "2",
    message: "Payment gateway error",
    category: "payment",
    severity: "critical",
    count: 2,
    occurredAt: "2025-01-10T09:15:00Z",
    resolved: false,
  },
  {
    id: "3",
    message: "Rate limit exceeded",
    category: "auth",
    severity: "medium",
    count: 15,
    occurredAt: "2025-01-10T08:00:00Z",
    resolved: true,
  },
];

const mockBackups = [
  {
    id: "1",
    type: "database",
    status: "completed",
    size: 256000000,
    startedAt: "2025-01-10T02:00:00Z",
    duration: 120,
  },
  {
    id: "2",
    type: "full",
    status: "completed",
    size: 1024000000,
    startedAt: "2025-01-09T02:00:00Z",
    duration: 600,
  },
];

const mockFeatureFlags = [
  { key: "ai_assistant", name: "AI Assistant", enabled: true, rollout: 100 },
  { key: "dark_mode", name: "Dark Mode", enabled: true, rollout: 100 },
  { key: "new_checkout", name: "New Checkout Flow", enabled: false, rollout: 25 },
  { key: "beta_features", name: "Beta Features", enabled: true, rollout: 10 },
];

const mockDeployments = [
  {
    id: "1",
    target: "production",
    status: "completed",
    apps: ["core", "gateway"],
    commit: "abc1234",
    duration: 180000,
    startedAt: "2025-01-10T14:00:00Z",
  },
  {
    id: "2",
    target: "staging",
    status: "running",
    apps: ["console"],
    commit: "def5678",
    duration: null,
    startedAt: "2025-01-10T15:30:00Z",
  },
];

export default function InfrastructurePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "errors" | "backups" | "deployments" | "features" | "settings"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "errors", label: "Errors", icon: AlertTriangle },
    { id: "backups", label: "Backups", icon: FileArchive },
    { id: "deployments", label: "Deployments", icon: Server },
    { id: "features", label: "Feature Flags", icon: Flag },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
    return (bytes / 1073741824).toFixed(2) + " GB";
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10";
      case "high":
        return "text-orange-500 bg-orange-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "completed":
        return "text-green-500";
      case "degraded":
      case "running":
        return "text-yellow-500";
      case "unhealthy":
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Infrastructure
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            System monitoring and management
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              System Health
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={`w-5 h-5 ${getStatusColor(mockSystemHealth.status)}`} />
                  <span className="font-medium">Status</span>
                </div>
                <p className="text-2xl font-bold capitalize">{mockSystemHealth.status}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Uptime</span>
                </div>
                <p className="text-2xl font-bold">{mockSystemHealth.uptime}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Database</span>
                </div>
                <p className="text-2xl font-bold">{mockSystemHealth.checks.database.latency}ms</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Redis</span>
                </div>
                <p className="text-2xl font-bold">{mockSystemHealth.checks.redis.latency}ms</p>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Resource Usage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* CPU */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">CPU</span>
                  <span className="font-medium">{mockStats.cpu}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${mockStats.cpu}%` }}
                  />
                </div>
              </div>
              {/* Memory */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Memory</span>
                  <span className="font-medium">{mockStats.memory}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${mockStats.memory}%` }}
                  />
                </div>
              </div>
              {/* Disk */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Disk</span>
                  <span className="font-medium">{mockStats.disk}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${mockStats.disk}%` }}
                  />
                </div>
              </div>
              {/* Network */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Network</span>
                  <span className="font-medium">{mockStats.network} Mbps</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(mockStats.network / 1000) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Requests/min</p>
                  <p className="text-3xl font-bold">{mockStats.requests}</p>
                </div>
                <Activity className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Errors (24h)</p>
                  <p className="text-3xl font-bold text-red-500">{mockStats.errors}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Backup</p>
                  <p className="text-3xl font-bold">6h ago</p>
                </div>
                <FileArchive className="w-10 h-10 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === "errors" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold">Error Logs</h2>
            <div className="flex gap-2">
              <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                <option>All Categories</option>
                <option>Database</option>
                <option>Network</option>
                <option>Payment</option>
                <option>Auth</option>
              </select>
              <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                <option>All Severities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Severity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Message</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Count</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockErrors.map((error) => (
                <tr key={error.id} className={error.resolved ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{error.message}</td>
                  <td className="px-4 py-3 text-gray-500">{error.category}</td>
                  <td className="px-4 py-3">{error.count}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(error.occurredAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!error.resolved && (
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-green-500">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === "backups" && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Backup
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Full Backup
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Started</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockBackups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-4 py-3 font-medium capitalize">{backup.type}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 ${getStatusColor(backup.status)}`}>
                        <CheckCircle className="w-4 h-4" />
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatBytes(backup.size)}</td>
                    <td className="px-4 py-3">{backup.duration}s</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(backup.startedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500">
                          <History className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === "deployments" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Target</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Apps</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Commit</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockDeployments.map((deploy) => (
                <tr key={deploy.id}>
                  <td className="px-4 py-3 font-medium capitalize">{deploy.target}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 ${getStatusColor(deploy.status)}`}>
                      {deploy.status === "running" ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {deploy.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {deploy.apps.map((app) => (
                        <span
                          key={app}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                        >
                          {app}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{deploy.commit}</td>
                  <td className="px-4 py-3">
                    {deploy.duration ? formatDuration(deploy.duration) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(deploy.startedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === "features" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Flag</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rollout</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockFeatureFlags.map((flag) => (
                <tr key={flag.key}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{flag.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{flag.key}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        flag.enabled
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${flag.rollout}%` }}
                        />
                      </div>
                      <span className="text-sm">{flag.rollout}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`p-2 rounded-lg ${
                        flag.enabled
                          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30"
                          : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30"
                      }`}
                    >
                      {flag.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Cache Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium">Redis Cache</p>
                  <p className="text-sm text-gray-500">Memory: 128MB / 256MB</p>
                </div>
                <button className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  Flush Cache
                </button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="font-medium">CDN Cache</p>
                  <p className="text-sm text-gray-500">Cloudflare</p>
                </div>
                <button className="px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                  Purge All
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Maintenance Mode</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Maintenance Mode</p>
                  <p className="text-sm text-gray-500">Show maintenance page to all users</p>
                </div>
                <button className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  rows={3}
                  placeholder="We're performing scheduled maintenance..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
