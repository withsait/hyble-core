"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@hyble/ui";
import { Terminal, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";

interface DeploymentLogsProps {
  deploymentId: string;
  siteSlug: string;
}

type LogLevel = "info" | "warn" | "error" | "success";

interface LogEntry {
  id: string;
  step: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
}

const levelStyles: Record<LogLevel, string> = {
  info: "text-slate-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  success: "text-green-400",
};

export function DeploymentLogs({ deploymentId, siteSlug }: DeploymentLogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = trpc.cloud.deployments.getLogs.useQuery(
    { deploymentId, siteSlug },
    {
      refetchInterval: 3000, // Poll every 3 seconds
    }
  );

  const logs = data?.logs || [];
  const deployment = data?.deployment;

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-white">Build Logları</span>
        </div>
        {deployment && (
          <div className="flex items-center gap-2 text-xs">
            {deployment.status === "BUILDING" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                <span className="text-blue-400">Derleniyor...</span>
              </>
            ) : deployment.status === "SUCCESS" ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Başarılı</span>
              </>
            ) : deployment.status === "FAILED" ? (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-400">Başarısız</span>
              </>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-yellow-400">Kuyrukta</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Log Content */}
      <div
        ref={containerRef}
        className="bg-slate-950 p-4 h-96 overflow-y-auto font-mono text-xs"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Log bekleniyor...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log: LogEntry, index: number) => (
              <div key={log.id || index} className="flex">
                <span className="text-slate-600 w-20 flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <span className={`${levelStyles[log.level as LogLevel] || levelStyles.info} mr-2`}>
                  [{log.step}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
            {deployment?.status === "BUILDING" && (
              <div className="flex items-center text-slate-500 mt-2">
                <span className="animate-pulse">▌</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Build Duration */}
      {deployment?.buildDuration && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 text-xs text-slate-400">
          Build süresi: {deployment.buildDuration}s
        </div>
      )}
    </Card>
  );
}
