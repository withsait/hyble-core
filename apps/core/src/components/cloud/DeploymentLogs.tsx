"use client";

import { useEffect, useRef } from "react";
import { Card } from "@hyble/ui";
import { Terminal, CheckCircle, Loader2 } from "lucide-react";

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

// Mock data - will be replaced with tRPC query when cloud router is implemented
const mockLogs: LogEntry[] = [
  { id: "1", step: "clone", message: "Cloning repository...", level: "info", timestamp: new Date() },
  { id: "2", step: "clone", message: "Repository cloned successfully", level: "success", timestamp: new Date() },
  { id: "3", step: "install", message: "Installing dependencies...", level: "info", timestamp: new Date() },
  { id: "4", step: "install", message: "Dependencies installed (42 packages)", level: "success", timestamp: new Date() },
  { id: "5", step: "build", message: "Running build command: pnpm build", level: "info", timestamp: new Date() },
  { id: "6", step: "build", message: "Build completed successfully", level: "success", timestamp: new Date() },
  { id: "7", step: "deploy", message: "Deploying to edge network...", level: "info", timestamp: new Date() },
  { id: "8", step: "deploy", message: "Deployment complete!", level: "success", timestamp: new Date() },
];

const mockDeployment = {
  status: "SUCCESS",
  buildDuration: 45,
};

export function DeploymentLogs({ deploymentId, siteSlug }: DeploymentLogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // TODO: Replace with tRPC query when cloud router is ready
  // const { data, isLoading } = trpc.cloud.deployments.getLogs.useQuery(...);
  const logs = mockLogs;
  const deployment = mockDeployment;
  const isLoading = false;

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
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
          <span className="text-green-400">Başarılı</span>
        </div>
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
            {logs.map((log, index) => (
              <div key={log.id || index} className="flex">
                <span className="text-slate-600 w-20 flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <span className={`${levelStyles[log.level] || levelStyles.info} mr-2`}>
                  [{log.step}]
                </span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))}
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
