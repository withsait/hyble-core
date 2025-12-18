"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@hyble/ui";
import {
  Globe,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Shield,
  ExternalLink,
  Trash2,
  Copy,
  Info,
} from "lucide-react";

// Mock data
const mockDomains = [
  {
    id: "1",
    domain: "mybusiness.hyble.co",
    type: "primary",
    status: "active",
    sslStatus: "active",
  },
  {
    id: "2",
    domain: "www.mybusiness.com",
    type: "redirect",
    status: "pending",
    sslStatus: "pending",
  },
];

export default function WebsiteDomainsPage() {
  const params = useParams();
  const websiteId = params.id as string;
  const [showAddModal, setShowAddModal] = useState(false);

  const domains = mockDomains;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/websites"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Alan Adları
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Web sitenizin alan adlarını yönetin
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Alan Adı Ekle
          </button>
        </div>

        {/* DNS Info */}
        <Card className="p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Özel alan adınızı kullanmak için DNS kayıtlarınızı aşağıdaki değerlere yönlendirin:
              </p>
              <div className="mt-2 flex gap-4">
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  A: 178.63.138.97
                </code>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  CNAME: proxy.hyble.co
                </code>
              </div>
            </div>
          </div>
        </Card>

        {/* Domains List */}
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {domain.domain}
                      </h3>
                      {domain.type === "primary" && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                          Birincil
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        domain.status === "active"
                          ? "text-green-600"
                          : domain.status === "pending"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}>
                        {domain.status === "active" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {domain.status === "active" ? "Aktif" : "Beklemede"}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        domain.sslStatus === "active"
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}>
                        <Shield className="w-3 h-3" />
                        SSL: {domain.sslStatus === "active" ? "Aktif" : "Beklemede"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <Copy className="w-5 h-5" />
                  </button>
                  {domain.type !== "primary" && (
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
