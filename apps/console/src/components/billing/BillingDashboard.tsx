"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Download,
  FileText,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  RefreshCw,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  DollarSign,
} from "lucide-react";

interface BillingDashboardProps {
  userId: string;
}

// Mock data
const paymentMethods = [
  {
    id: "pm_1",
    type: "card",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "card",
    brand: "mastercard",
    last4: "8888",
    expiryMonth: 6,
    expiryYear: 2026,
    isDefault: false,
  },
];

const invoices = [
  {
    id: "INV-2024-0125",
    date: "2024-01-15",
    amount: 299,
    status: "paid",
    description: "Website Hosting - Business Plan",
    paymentMethod: "Visa •••• 4242",
  },
  {
    id: "INV-2024-0124",
    date: "2024-01-10",
    amount: 149,
    status: "paid",
    description: "Minecraft Server - Premium",
    paymentMethod: "Wallet",
  },
  {
    id: "INV-2024-0123",
    date: "2024-01-05",
    amount: 500,
    status: "pending",
    description: "Custom Website Development",
    paymentMethod: "-",
  },
  {
    id: "INV-2024-0122",
    date: "2024-01-01",
    amount: 79,
    status: "failed",
    description: "Domain Renewal",
    paymentMethod: "Visa •••• 4242",
  },
];

const subscriptions = [
  {
    id: "sub_1",
    name: "Website Hosting - Business",
    amount: 299,
    interval: "month",
    status: "active",
    nextBilling: "2024-02-15",
    cancelAt: null,
  },
  {
    id: "sub_2",
    name: "Minecraft Server - Premium",
    amount: 149,
    interval: "month",
    status: "active",
    nextBilling: "2024-02-10",
    cancelAt: null,
  },
  {
    id: "sub_3",
    name: "SSL Certificate",
    amount: 99,
    interval: "year",
    status: "active",
    nextBilling: "2025-01-15",
    cancelAt: null,
  },
];

const transactions = [
  {
    id: "txn_1",
    type: "credit",
    amount: 500,
    description: "Wallet top-up",
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: "txn_2",
    type: "debit",
    amount: 149,
    description: "Minecraft Server Payment",
    date: "2024-01-10",
    status: "completed",
  },
  {
    id: "txn_3",
    type: "credit",
    amount: 50,
    description: "Referral bonus",
    date: "2024-01-08",
    status: "completed",
  },
];

export function BillingDashboard({ userId }: BillingDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "invoices" | "subscriptions" | "payment-methods" | "wallet"
  >("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const walletBalance = 2450;
  const monthlySpending = 527;
  const pendingAmount = 500;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
      case "active":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
            <CheckCircle size={12} />
            {status}
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
            <Clock size={12} />
            {status}
          </span>
        );
      case "failed":
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
            <XCircle size={12} />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // In real app, use actual card brand icons
    return (
      <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
        {brand.toUpperCase().slice(0, 4)}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Billing & Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your billing information, invoices, and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview", label: "Overview" },
          { id: "invoices", label: "Invoices" },
          { id: "subscriptions", label: "Subscriptions" },
          { id: "payment-methods", label: "Payment Methods" },
          { id: "wallet", label: "Wallet" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wallet className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{walletBalance.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CreditCard className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <span className="flex items-center gap-0.5 text-sm text-red-600">
                  <ArrowUpRight size={14} />
                  12%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{monthlySpending.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Spending</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{pendingAmount.toLocaleString()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <RefreshCw className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {subscriptions.length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
            </div>
          </div>

          {/* Recent invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Recent Invoices
              </h2>
              <button
                onClick={() => setActiveTab("invoices")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.slice(0, 4).map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="text-gray-600 dark:text-gray-400" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.id}
                      </p>
                      <p className="text-sm text-gray-500">{invoice.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₺{invoice.amount}
                      </p>
                      <p className="text-sm text-gray-500">{invoice.date}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <Download size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active subscriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Active Subscriptions
              </h2>
              <button
                onClick={() => setActiveTab("subscriptions")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Manage <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sub.name}</p>
                    <p className="text-sm text-gray-500">
                      Next billing: {sub.nextBilling}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₺{sub.amount}/{sub.interval}
                    </p>
                    {getStatusBadge(sub.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
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
                  placeholder="Search invoices..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Invoice list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Invoice
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.id}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-600 dark:text-gray-300">
                        {invoice.description}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-600 dark:text-gray-300">{invoice.date}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₺{invoice.amount}
                      </p>
                    </td>
                    <td className="p-4">{getStatusBadge(invoice.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status === "pending" && (
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Pay Now
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <Download size={16} className="text-gray-500" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                          <ExternalLink size={16} className="text-gray-500" />
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

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <RefreshCw className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ₺{sub.amount}/{sub.interval} • Next billing: {sub.nextBilling}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(sub.status)}
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="text-gray-900 dark:text-white">Visa •••• 4242</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                      Update Plan
                    </button>
                    <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "payment-methods" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Saved Payment Methods
            </h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} />
              Add New Card
            </button>
          </div>

          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getCardBrandIcon(method.brand)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          •••• •••• •••• {method.last4}
                        </p>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Set as Default
                      </button>
                    )}
                    <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other payment options */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Other Payment Options
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "PayPal", connected: false },
                { name: "iyzico", connected: true },
                { name: "Bank Transfer", connected: false },
              ].map((option) => (
                <div
                  key={option.name}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {option.name}
                  </span>
                  {option.connected ? (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Connected
                    </span>
                  ) : (
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-4xl font-bold">₺{walletBalance.toLocaleString()}</p>
              </div>
              <Wallet size={48} className="opacity-30" />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100">
                Add Funds
              </button>
              <button className="flex-1 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30">
                Transfer
              </button>
            </div>
          </div>

          {/* Quick add amounts */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Add
            </h3>
            <div className="flex gap-3">
              {[100, 250, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium"
                >
                  ₺{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction history */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                Download Statement
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === "credit"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      {txn.type === "credit" ? (
                        <ArrowDownRight
                          className="text-green-600 dark:text-green-400"
                          size={18}
                        />
                      ) : (
                        <ArrowUpRight className="text-red-600 dark:text-red-400" size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {txn.description}
                      </p>
                      <p className="text-sm text-gray-500">{txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        txn.type === "credit"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {txn.type === "credit" ? "+" : "-"}₺{txn.amount}
                    </p>
                    {getStatusBadge(txn.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingDashboard;
