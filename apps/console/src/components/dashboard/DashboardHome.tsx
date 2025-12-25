"use client";

import { useState } from "react";
import {
  CreditCard,
  Globe,
  Server,
  Ticket,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Bell,
  ChevronRight,
  Package,
  Download,
  Key,
  Settings,
  Zap,
  Shield,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
} from "lucide-react";

interface DashboardHomeProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// Mock data
const quickStats = [
  {
    label: "Active Services",
    value: "5",
    change: "+2",
    trend: "up",
    icon: Package,
    color: "blue",
  },
  {
    label: "Wallet Balance",
    value: "₺2,450",
    change: "+₺500",
    trend: "up",
    icon: Wallet,
    color: "green",
  },
  {
    label: "Open Tickets",
    value: "2",
    change: "-1",
    trend: "down",
    icon: Ticket,
    color: "yellow",
  },
  {
    label: "This Month",
    value: "₺890",
    change: "-₺110",
    trend: "down",
    icon: CreditCard,
    color: "purple",
  },
];

const recentActivities = [
  {
    id: 1,
    type: "payment",
    title: "Payment received",
    description: "Invoice #INV-2024-0125 paid",
    amount: "₺299",
    time: "2 hours ago",
    icon: CreditCard,
    status: "success",
  },
  {
    id: 2,
    type: "service",
    title: "Website deployed",
    description: "hyble-store.com is now live",
    time: "5 hours ago",
    icon: Globe,
    status: "success",
  },
  {
    id: 3,
    type: "ticket",
    title: "Support ticket updated",
    description: "Ticket #TKT-456 - Awaiting response",
    time: "1 day ago",
    icon: Ticket,
    status: "pending",
  },
  {
    id: 4,
    type: "server",
    title: "Server renewal",
    description: "Minecraft server renewed for 30 days",
    time: "2 days ago",
    icon: Server,
    status: "success",
  },
];

const activeServices = [
  {
    id: 1,
    name: "hyble-store.com",
    type: "website",
    plan: "Business",
    status: "active",
    renewsAt: "2024-03-15",
    icon: Globe,
  },
  {
    id: 2,
    name: "MC Server - SurvivalCraft",
    type: "gameserver",
    plan: "Premium",
    status: "active",
    renewsAt: "2024-02-28",
    icon: Server,
  },
  {
    id: 3,
    name: "E-commerce Template",
    type: "template",
    plan: "One-time",
    status: "active",
    icon: Package,
  },
];

const notifications = [
  {
    id: 1,
    type: "warning",
    title: "Domain expiring soon",
    message: "hyble-store.com expires in 7 days",
    time: "1 hour ago",
  },
  {
    id: 2,
    type: "info",
    title: "New feature available",
    message: "Try our new AI website builder",
    time: "3 hours ago",
  },
  {
    id: 3,
    type: "success",
    title: "Backup completed",
    message: "Your website backup is ready",
    time: "1 day ago",
  },
];

const quickActions = [
  { label: "New Website", icon: Globe, href: "/websites/new", color: "blue" },
  { label: "New Server", icon: Server, href: "/servers/new", color: "purple" },
  { label: "Add Funds", icon: Wallet, href: "/wallet/deposit", color: "green" },
  { label: "Get Support", icon: Ticket, href: "/support/new", color: "orange" },
];

export function DashboardHome({ user }: DashboardHomeProps) {
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "pending":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30";
      case "error":
      case "expired":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="text-yellow-500" size={18} />;
      case "success":
        return <CheckCircle className="text-green-500" size={18} />;
      default:
        return <Bell className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your services today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Zap size={18} />
            Quick Actions
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === "blue"
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : stat.color === "green"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : stat.color === "yellow"
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-purple-100 dark:bg-purple-900/30"
                }`}
              >
                <stat.icon
                  size={20}
                  className={
                    stat.color === "blue"
                      ? "text-blue-600 dark:text-blue-400"
                      : stat.color === "green"
                      ? "text-green-600 dark:text-green-400"
                      : stat.color === "yellow"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-purple-600 dark:text-purple-400"
                  }
                />
              </div>
              <span
                className={`flex items-center gap-0.5 text-sm font-medium ${
                  stat.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="col-span-2 space-y-6">
          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-${action.color}-500 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-colors bg-white dark:bg-gray-800`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    action.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : action.color === "purple"
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : action.color === "green"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-orange-100 dark:bg-orange-900/30"
                  }`}
                >
                  <action.icon
                    size={24}
                    className={
                      action.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : action.color === "purple"
                        ? "text-purple-600 dark:text-purple-400"
                        : action.color === "green"
                        ? "text-green-600 dark:text-green-400"
                        : "text-orange-600 dark:text-orange-400"
                    }
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              </a>
            ))}
          </div>

          {/* Active services */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Active Services
              </h2>
              <a
                href="/services"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activeServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <service.icon size={20} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {service.plan} Plan
                        {service.renewsAt && ` • Renews ${service.renewsAt}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        service.status
                      )}`}
                    >
                      {service.status}
                    </span>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <Settings size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <a
                href="/activity"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </a>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      <activity.icon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {activity.amount}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell size={18} />
                Notifications
              </h2>
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                {notifications.length}
              </span>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications
                .slice(0, showAllNotifications ? undefined : 3)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {notifications.length > 3 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                  className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                >
                  {showAllNotifications ? "Show Less" : "View All Notifications"}
                </button>
              </div>
            )}
          </div>

          {/* Wallet card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <Wallet size={24} />
              <span className="text-sm opacity-80">Hyble Wallet</span>
            </div>
            <p className="text-3xl font-bold mb-1">₺2,450.00</p>
            <p className="text-sm opacity-80 mb-4">Available Balance</p>
            <div className="flex gap-2">
              <a
                href="/wallet/deposit"
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center text-sm font-medium"
              >
                Add Funds
              </a>
              <a
                href="/wallet"
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-center text-sm font-medium"
              >
                History
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h3>
            <div className="space-y-2">
              {[
                { icon: Download, label: "Downloads", href: "/downloads" },
                { icon: Key, label: "API Keys", href: "/settings/api-keys" },
                { icon: FileText, label: "Invoices", href: "/billing/invoices" },
                { icon: Shield, label: "Security", href: "/settings/security" },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <link.icon size={18} className="text-gray-500" />
                  <span className="text-sm">{link.label}</span>
                  <ChevronRight size={14} className="ml-auto text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Promo card */}
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} />
              <span className="text-sm font-medium">Special Offer</span>
            </div>
            <h3 className="text-lg font-bold mb-2">
              Get 20% off on all hosting plans!
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Use code NEWYEAR24 at checkout
            </p>
            <a
              href="/store"
              className="block w-full py-2 bg-white text-orange-600 rounded-lg text-center text-sm font-medium hover:bg-gray-100"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
