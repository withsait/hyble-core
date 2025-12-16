"use client";

import { useState } from "react";
import { CategoryTree } from "@/components/pim/CategoryTree";
import { CategoryForm } from "@/components/pim/CategoryForm";
import { Button } from "@hyble/ui";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategoriler</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Ürün kategorilerini yönetin
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Category Tree */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <CategoryTree />
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
