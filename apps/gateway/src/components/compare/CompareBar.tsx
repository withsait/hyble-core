"use client";

import { useCompare, MAX_COMPARE_ITEMS } from "@/lib/compare-context";
import Link from "next/link";
import { X, GitCompare, Package, Trash2 } from "lucide-react";

export function CompareBar() {
  const { items, itemCount, removeItem, clearAll, isOpen, setIsOpen } = useCompare();

  if (itemCount === 0) return null;

  return (
    <>
      {/* Collapsed Bar - Fixed at bottom */}
      {!isOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            <GitCompare className="w-5 h-5" />
            <span className="font-medium">{itemCount} ürün karşılaştır</span>
            <span className="w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {itemCount}
            </span>
          </button>
        </div>
      )}

      {/* Expanded Bar */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-2xl animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Karşılaştırma ({itemCount}/{MAX_COMPARE_ITEMS})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAll}
                  className="text-sm text-slate-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Temizle
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex items-stretch gap-4 overflow-x-auto pb-2">
              {/* Selected Products */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-48 bg-slate-50 dark:bg-slate-700 rounded-lg p-3 relative group"
                >
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-600 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {item.primaryImage ? (
                      <img
                        src={item.primaryImage}
                        alt={item.nameTr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {item.nameTr}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.lowestPrice !== null ? `€${item.lowestPrice.toFixed(2)}` : "Fiyat için tıklayın"}
                  </p>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: MAX_COMPARE_ITEMS - itemCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-shrink-0 w-48 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg p-3 flex items-center justify-center"
                >
                  <p className="text-sm text-slate-400 text-center">
                    +{i + 1}. ürün seçin
                  </p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Alışverişe Devam Et
              </button>
              <Link
                href="/store/compare"
                className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${
                  itemCount < 2 ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                Karşılaştır ({itemCount} ürün)
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
