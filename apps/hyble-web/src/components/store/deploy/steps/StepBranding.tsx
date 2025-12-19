"use client";

import { useState, useCallback } from "react";
import { Upload, Palette, Type, X } from "lucide-react";
import type { WizardData } from "../DeployWizard";

interface StepBrandingProps {
  data: WizardData;
  updateData: (updates: Partial<WizardData>) => void;
}

const colorPresets = [
  { name: "Mavi", primary: "#3B82F6", secondary: "#10B981" },
  { name: "Mor", primary: "#8B5CF6", secondary: "#EC4899" },
  { name: "Turuncu", primary: "#F59E0B", secondary: "#EF4444" },
  { name: "Yeşil", primary: "#10B981", secondary: "#3B82F6" },
  { name: "Kırmızı", primary: "#EF4444", secondary: "#F59E0B" },
  { name: "Lacivert", primary: "#1E3A5F", secondary: "#3B82F6" },
];

const fontPresets = [
  { name: "Inter", value: "Inter" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Playfair", value: "Playfair Display" },
  { name: "Montserrat", value: "Montserrat" },
];

export function StepBranding({ data, updateData }: StepBrandingProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateData({ logo: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Marka Kimliği
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Logo, renkler ve font ayarlarını yapın (opsiyonel)
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Logo
        </label>

        {data.logo ? (
          <div className="relative w-40 h-40 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden">
            <img
              src={data.logo}
              alt="Logo"
              className="w-full h-full object-contain p-4"
            />
            <button
              onClick={() => updateData({ logo: null })}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${dragActive
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                : "border-slate-300 dark:border-slate-600"
              }
            `}
          >
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Logo dosyasını sürükleyin veya
            </p>
            <label className="cursor-pointer">
              <span className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
                dosya seçin
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-2">
              PNG, JPG, SVG - Max 2MB
            </p>
          </div>
        )}
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Palette className="w-4 h-4 inline mr-2" />
          Renk Şeması
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => updateData({
                primaryColor: preset.primary,
                secondaryColor: preset.secondary
              })}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${data.primaryColor === preset.primary
                  ? "border-amber-500 ring-2 ring-amber-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                }
              `}
            >
              <div className="flex gap-1 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {preset.name}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Colors */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Ana Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => updateData({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">İkincil Renk</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.secondaryColor}
                onChange={(e) => updateData({ secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Type className="w-4 h-4 inline mr-2" />
          Font Ailesi
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {fontPresets.map((font) => (
            <button
              key={font.value}
              onClick={() => updateData({ fontFamily: font.value })}
              className={`
                p-3 rounded-xl border-2 transition-all
                ${data.fontFamily === font.value
                  ? "border-amber-500 ring-2 ring-amber-500/20"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300"
                }
              `}
              style={{ fontFamily: font.value }}
            >
              <span className="text-lg font-medium text-slate-900 dark:text-white block mb-1">
                Aa
              </span>
              <span className="text-xs text-slate-500">{font.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
