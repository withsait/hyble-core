"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains a number", test: (p) => /\d/.test(p) },
  {
    label: "Contains special character",
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, passed } = useMemo(() => {
    const results = requirements.map((req) => req.test(password));
    return {
      score: results.filter(Boolean).length,
      passed: results,
    };
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  }, [score]);

  const strengthColor = useMemo(() => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  }, [score]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Password strength</span>
          <span
            className={`font-medium ${
              score <= 2
                ? "text-red-400"
                : score <= 3
                  ? "text-yellow-400"
                  : score <= 4
                    ? "text-blue-400"
                    : "text-green-400"
            }`}
          >
            {strengthLabel}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= score ? strengthColor : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={req.label}
            className={`flex items-center gap-2 text-sm transition-colors ${
              passed[index] ? "text-green-400" : "text-slate-500"
            }`}
          >
            {passed[index] ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
