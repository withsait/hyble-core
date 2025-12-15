"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSubmit: (code: string) => Promise<void>;
  onUseBackupCode?: () => void;
  loading?: boolean;
  error?: string;
}

export function TwoFactorForm({ onSubmit, onUseBackupCode, loading, error }: Props) {
  const [code, setCode] = React.useState(["", "", "", "", "", ""]);
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const processInput = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");

    if (pastedData.length === 0) return;

    const newCode = [...code];
    pastedData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    const nextIndex = Math.min(pastedData.length, 5);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => processInput(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "w-10 h-12 text-center text-lg font-mono transition-all rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              error && "border-red-500 focus:ring-red-500"
            )}
            disabled={loading}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}

      <button
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
        onClick={() => onSubmit(code.join(""))}
        disabled={loading || code.some(c => !c)}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Doğrula
      </button>

      {onUseBackupCode && (
        <div className="text-center">
          <button
            type="button"
            onClick={onUseBackupCode}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline-offset-4 hover:underline transition-colors"
          >
            Yedek kod kullan
          </button>
        </div>
      )}
    </div>
  );
}
