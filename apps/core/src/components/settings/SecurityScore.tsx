"use client";

import { CheckCircle2, Circle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  score: number; // 0-100
  factors: { name: string; completed: boolean; points: number }[];
}

export function SecurityScore({ score, factors }: Props) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return "bg-green-100 dark:bg-green-900/20";
    if (s >= 50) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full", getBgColor(score), getColor(score))}>
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Güvenlik Puanı</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hesap güvenliğinizin durumu</p>
          </div>
        </div>
        <div className="text-right">
          <span className={cn("text-3xl font-bold", getColor(score))}>{score}</span>
          <span className="text-slate-400 text-sm">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", {
            "bg-green-500": score >= 80,
            "bg-yellow-500": score >= 50 && score < 80,
            "bg-red-500": score < 50,
          })}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="space-y-3">
        {factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {factor.completed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-slate-400" />
              )}
              <span className={factor.completed ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>
                {factor.name}
              </span>
            </div>
            {!factor.completed && (
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">+{factor.points} puan</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
