"use client";

import { useState } from "react";
import {
  Search,
  Globe,
  FileText,
  Link,
  Image,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  MousePointer,
  Clock,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
  Settings,
  Zap,
  Target,
  MapPin,
} from "lucide-react";

interface SeoPage {
  id: string;
  url: string;
  title: string;
  description: string;
  score: number;
  issues: {
    type: "error" | "warning" | "info";
    message: string;
    suggestion: string;
  }[];
  keywords: string[];
  lastCrawled: string;
}

interface SeoMetrics {
  overallScore: number;
  indexedPages: number;
  totalPages: number;
  avgLoadTime: number;
  mobileScore: number;
  brokenLinks: number;
  missingAltTags: number;
  duplicateTitles: number;
}

// Mock data
const mockMetrics: SeoMetrics = {
  overallScore: 78,
  indexedPages: 45,
  totalPages: 52,
  avgLoadTime: 2.3,
  mobileScore: 85,
  brokenLinks: 3,
  missingAltTags: 12,
  duplicateTitles: 2,
};

const mockPages: SeoPage[] = [
  {
    id: "page_1",
    url: "/",
    title: "Home - Hyble Store",
    description: "Welcome to Hyble Store. Discover amazing products.",
    score: 92,
    issues: [],
    keywords: ["hyble", "store", "products"],
    lastCrawled: "2024-01-15",
  },
  {
    id: "page_2",
    url: "/products",
    title: "Products",
    description: "",
    score: 45,
    issues: [
      {
        type: "error",
        message: "Meta description is missing",
        suggestion: "Add a meta description between 150-160 characters",
      },
      {
        type: "warning",
        message: "Title too short",
        suggestion: "Expand title to 50-60 characters including brand name",
      },
    ],
    keywords: ["products"],
    lastCrawled: "2024-01-15",
  },
  {
    id: "page_3",
    url: "/about",
    title: "About Us - Hyble Store",
    description: "Learn more about Hyble Store and our mission to deliver quality products.",
    score: 88,
    issues: [
      {
        type: "info",
        message: "Consider adding more internal links",
        suggestion: "Add 2-3 internal links to related pages",
      },
    ],
    keywords: ["about", "hyble", "mission"],
    lastCrawled: "2024-01-14",
  },
];

export function SeoManager() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "pages" | "keywords" | "performance" | "tools"
  >("overview");
  const [selectedPage, setSelectedPage] = useState<SeoPage | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SEO Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Optimize your website for search engines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isScanning ? "animate-spin" : ""} />
            {isScanning ? "Scanning..." : "Run SEO Scan"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: "overview", label: "Overview" },
          { id: "pages", label: "Pages" },
          { id: "keywords", label: "Keywords" },
          { id: "performance", label: "Performance" },
          { id: "tools", label: "Tools" },
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
          {/* Score card */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div
                className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBg(
                  mockMetrics.overallScore
                )} mb-4`}
              >
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    mockMetrics.overallScore
                  )}`}
                >
                  {mockMetrics.overallScore}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                SEO Score
              </p>
              <p className="text-sm text-gray-500">Overall health</p>
            </div>

            <div className="col-span-3 grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.indexedPages}/{mockMetrics.totalPages}
                    </p>
                    <p className="text-sm text-gray-500">Indexed Pages</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${
                        (mockMetrics.indexedPages / mockMetrics.totalPages) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Zap className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.avgLoadTime}s
                    </p>
                    <p className="text-sm text-gray-500">Avg Load Time</p>
                  </div>
                </div>
                <p
                  className={`text-sm ${
                    mockMetrics.avgLoadTime < 3
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {mockMetrics.avgLoadTime < 3 ? "Good" : "Needs improvement"}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Globe className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.mobileScore}
                    </p>
                    <p className="text-sm text-gray-500">Mobile Score</p>
                  </div>
                </div>
                <p className="text-sm text-green-600">Mobile friendly</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Link className="text-red-600 dark:text-red-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.brokenLinks}
                    </p>
                    <p className="text-sm text-gray-500">Broken Links</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Image className="text-yellow-600 dark:text-yellow-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.missingAltTags}
                    </p>
                    <p className="text-sm text-gray-500">Missing Alt Tags</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertCircle className="text-orange-600 dark:text-orange-400" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.duplicateTitles}
                    </p>
                    <p className="text-sm text-gray-500">Duplicate Titles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Issues list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Issues to Fix
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockPages
                .filter((p) => p.issues.length > 0)
                .flatMap((page) =>
                  page.issues.map((issue, i) => ({
                    ...issue,
                    pageUrl: page.url,
                    pageId: `${page.id}_${i}`,
                  }))
                )
                .map((issue) => (
                  <div
                    key={issue.pageId}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        issue.type === "error"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : issue.type === "warning"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <XCircle className="text-red-600 dark:text-red-400" size={16} />
                      ) : issue.type === "warning" ? (
                        <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={16} />
                      ) : (
                        <AlertCircle className="text-blue-600 dark:text-blue-400" size={16} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {issue.message}
                      </p>
                      <p className="text-sm text-gray-500">{issue.suggestion}</p>
                      <p className="text-xs text-gray-400 mt-1">{issue.pageUrl}</p>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Fix
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === "pages" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search pages..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Page
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Score
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Issues
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Crawled
                </th>
                <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockPages.map((page) => (
                <tr
                  key={page.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {page.url}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {page.title}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getScoreBg(
                        page.score
                      )} ${getScoreColor(page.score)}`}
                    >
                      {page.score}
                    </span>
                  </td>
                  <td className="p-4">
                    {page.issues.length > 0 ? (
                      <span className="flex items-center gap-1 text-sm">
                        {page.issues.filter((i) => i.type === "error").length > 0 && (
                          <span className="flex items-center gap-0.5 text-red-600">
                            <XCircle size={14} />
                            {page.issues.filter((i) => i.type === "error").length}
                          </span>
                        )}
                        {page.issues.filter((i) => i.type === "warning").length > 0 && (
                          <span className="flex items-center gap-0.5 text-yellow-600 ml-2">
                            <AlertCircle size={14} />
                            {page.issues.filter((i) => i.type === "warning").length}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle size={14} />
                        No issues
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{page.lastCrawled}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedPage(page)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Target Keywords
            </h2>
            <div className="space-y-4">
              {[
                { keyword: "hyble store", position: 5, volume: 1200, difficulty: 45 },
                { keyword: "web templates", position: 12, volume: 8500, difficulty: 72 },
                { keyword: "website builder turkey", position: 3, volume: 890, difficulty: 38 },
              ].map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Target className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {kw.keyword}
                      </p>
                      <p className="text-sm text-gray-500">
                        {kw.volume.toLocaleString()} monthly searches
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{kw.position}
                      </p>
                      <p className="text-xs text-gray-500">Position</p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-lg font-semibold ${
                          kw.difficulty < 50
                            ? "text-green-600"
                            : kw.difficulty < 70
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {kw.difficulty}
                      </p>
                      <p className="text-xs text-gray-500">Difficulty</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Core Web Vitals
            </h2>
            <div className="space-y-4">
              {[
                { label: "LCP (Largest Contentful Paint)", value: "2.1s", status: "good" },
                { label: "FID (First Input Delay)", value: "45ms", status: "good" },
                { label: "CLS (Cumulative Layout Shift)", value: "0.08", status: "good" },
                { label: "TTFB (Time to First Byte)", value: "0.8s", status: "warning" },
              ].map((metric, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {metric.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        metric.status === "good"
                          ? "bg-green-500"
                          : metric.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Page Speed Insights
            </h2>
            <div className="space-y-4">
              {[
                { label: "Mobile Performance", score: 85 },
                { label: "Desktop Performance", score: 92 },
                { label: "Accessibility", score: 88 },
                { label: "Best Practices", score: 95 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span
                      className={`font-semibold ${
                        item.score >= 90
                          ? "text-green-600"
                          : item.score >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.score}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 90
                          ? "bg-green-500"
                          : item.score >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === "tools" && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Sitemap Generator",
              description: "Generate XML sitemap for search engines",
              icon: MapPin,
            },
            {
              title: "Robots.txt Editor",
              description: "Edit and manage your robots.txt file",
              icon: FileText,
            },
            {
              title: "Meta Tag Generator",
              description: "Generate meta tags for your pages",
              icon: Settings,
            },
            {
              title: "Schema Markup",
              description: "Add structured data to your pages",
              icon: Globe,
            },
            {
              title: "Redirect Manager",
              description: "Manage 301 and 302 redirects",
              icon: Link,
            },
            {
              title: "Bulk Meta Editor",
              description: "Edit meta tags for multiple pages",
              icon: FileText,
            },
          ].map((tool, i) => (
            <button
              key={i}
              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <tool.icon className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400 ml-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeoManager;
