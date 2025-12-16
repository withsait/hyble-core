"use client";

import { useState } from "react";
import { Copy, Download, AlertTriangle, Check } from "lucide-react";

interface Props {
  codes: string[];
  onDownload?: () => void;
  onCopy?: () => void;
}

export function BackupCodesDisplay({ codes, onDownload, onCopy }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([codes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "hyble-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onDownload?.();
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Önemli Uyarı</p>
          <p className="text-sm mt-1">
            Bu kodları güvenli bir yerde saklayın. Hesabınıza erişiminizi kaybederseniz,
            bu kodlar hesabınızı kurtarmanın <strong>tek yoludur</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-center select-all">
        {codes.map((code, index) => (
          <div key={index} className="tracking-widest text-slate-900 dark:text-white">
            {code}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium transition-colors flex items-center justify-center"
          onClick={handleCopy}
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
        <button
          className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-medium transition-colors flex items-center justify-center"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          TXT İndir
        </button>
      </div>
    </div>
  );
}
