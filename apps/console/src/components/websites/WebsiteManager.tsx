"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Settings,
  RefreshCw,
  Trash2,
  Copy,
  Lock,
  Unlock,
  BarChart3,
  Edit,
  Eye,
  Pause,
  Play,
  Download,
  Upload,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  Code,
  Database,
  Mail,
  FileText,
  Activity,
} from "lucide-react";

interface Website {
  id: string;
  name: string;
  domain: string;
  status: "active" | "paused" | "building" | "error" | "expired";
  plan: string;
  template?: string;
  ssl: boolean;
  analytics: {
    visitors: number;
    pageViews: number;
    bandwidth: number;
  };
  lastUpdated: string;
  expiresAt?: string;
  createdAt: string;
}

// Mock data
const websites: Website[] = [
  {
    id: "web_1",
    name: "Hyble Store",
    domain: "hyble-store.com",
    status: "active",
    plan: "Business",
    template: "E-commerce Pro",
    ssl: true,
    analytics: {
      visitors: 1250,
      pageViews: 4500,
      bandwidth: 2.5,
    },
    lastUpdated: "2024-01-14",
    expiresAt: "2024-03-15",
    createdAt: "2023-06-15",
  },
  {
    id: "web_2",
    name: "My Portfolio",
    domain: "john-portfolio.hyble.co",
    status: "active",
    plan: "Starter",
    template: "Portfolio Modern",
    ssl: true,
    analytics: {
      visitors: 320,
      pageViews: 890,
      bandwidth: 0.5,
    },
    lastUpdated: "2024-01-10",
    createdAt: "2023-12-01",
  },
  {
    id: "web_3",
    name: "Blog Site",
    domain: "my-blog.hyble.co",
    status: "building",
    plan: "Starter",
    ssl: true,
    analytics: {
      visitors: 0,
      pageViews: 0,
      bandwidth: 0,
    },
    lastUpdated: "2024-01-15",
    createdAt: "2024-01-15",
  },
];

export function WebsiteManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
            <CheckCircle size={12} />
            Active
          </span>
        );
      case "paused":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
            <Pause size={12} />
            Paused
          </span>
        );
      case "building":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
            <RefreshCw size={12} className="animate-spin" />
            Building
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
            <XCircle size={12} />
            Error
          </span>
        );
      case "expired":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
            <Clock size={12} />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      website.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || website.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Websites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your websites and domains
          </p>
        </div>
        <a
          href="/websites/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Website
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {websites.length}
              </p>
              <p className="text-sm text-gray-500">Total Websites</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {websites.filter((w) => w.status === "active").length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {websites.reduce((acc, w) => acc + w.analytics.visitors, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total Visitors</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Activity className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {websites.reduce((acc, w) => acc + w.analytics.bandwidth, 0).toFixed(1)} GB
              </p>
              <p className="text-sm text-gray-500">Bandwidth Used</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search websites..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="building">Building</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Website grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredWebsites.map((website) => (
          <div
            key={website.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            {/* Preview header */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {website.ssl && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white rounded text-xs">
                      <Lock size={10} />
                      SSL
                    </span>
                  )}
                  {getStatusBadge(website.status)}
                </div>
                <a
                  href={`https://${website.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {website.name}
                  </h3>
                  <p className="text-sm text-gray-500">{website.domain}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === website.id ? null : website.id)
                    }
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <MoreVertical size={18} className="text-gray-500" />
                  </button>
                  {activeDropdown === website.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <a
                          href={`/websites/${website.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit size={14} />
                          Edit Website
                        </a>
                        <a
                          href={`/websites/${website.id}/analytics`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <BarChart3 size={14} />
                          Analytics
                        </a>
                        <a
                          href={`/websites/${website.id}/settings`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Settings size={14} />
                          Settings
                        </a>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full">
                          <Copy size={14} />
                          Duplicate
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full">
                          <Download size={14} />
                          Export
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {website.analytics.visitors.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Visitors</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {website.analytics.pageViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Page Views</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {website.analytics.bandwidth} GB
                  </p>
                  <p className="text-xs text-gray-500">Bandwidth</p>
                </div>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Plan</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {website.plan}
                  </span>
                </div>
                {website.template && (
                  <div className="flex items-center justify-between">
                    <span>Template</span>
                    <span className="text-gray-900 dark:text-white">
                      {website.template}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <span className="text-gray-900 dark:text-white">
                    {website.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <a
                  href={`/websites/${website.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Edit size={14} />
                  Edit
                </a>
                <a
                  href={`https://${website.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  <Eye size={14} />
                  Preview
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Add new website card */}
        <a
          href="/websites/new"
          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col items-center justify-center min-h-[300px] group"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
            <Plus
              size={32}
              className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Create New Website
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Start from scratch or use a template
          </p>
        </a>
      </div>

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Connect Domain", href: "/domains/connect" },
            { icon: Shield, label: "SSL Certificates", href: "/ssl" },
            { icon: Database, label: "Backups", href: "/backups" },
            { icon: Mail, label: "Email Setup", href: "/email" },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <action.icon size={20} className="text-gray-600 dark:text-gray-400" />
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {action.label}
              </span>
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WebsiteManager;
