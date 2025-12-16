import React from "react";

interface PasswordStrengthMeterProps {
  strength: number; // 0-100
}

export function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  const getColor = () => {
    if (strength < 30) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 70) return "bg-yellow-500";
    if (strength < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  const getLabel = () => {
    if (strength < 30) return "Çok Zayıf";
    if (strength < 50) return "Zayıf";
    if (strength < 70) return "Orta";
    if (strength < 90) return "Güçlü";
    return "Çok Güçlü";
  };

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Şifre gücü: <span className="font-medium">{getLabel()}</span>
        </p>
        <p className="text-xs text-slate-400">{strength}%</p>
      </div>
      <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-2">
        <li className={strength >= 25 ? "text-green-600" : ""}>
          {strength >= 25 ? "✓" : "○"} En az 8 karakter
        </li>
        <li className={/[A-Z]/.test("") ? "text-green-600" : ""}>
          {strength >= 50 ? "✓" : "○"} Büyük harf
        </li>
        <li className={/[a-z]/.test("") ? "text-green-600" : ""}>
          {strength >= 75 ? "✓" : "○"} Küçük harf
        </li>
        <li className={/[0-9]/.test("") ? "text-green-600" : ""}>
          {strength >= 90 ? "✓" : "○"} Rakam
        </li>
      </ul>
    </div>
  );
}
