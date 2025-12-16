import { ProductForm } from "@/components/pim/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Yeni Ürün | PIM - Hyble",
  description: "Yeni ürün oluştur",
};

export default function NewProductPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Back Link */}
      <Link
        href="/dashboard/pim/products"
        className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Ürünlere Dön
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Ürün</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Yeni bir ürün oluşturun
        </p>
      </div>

      {/* Product Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <ProductForm />
      </div>
    </div>
  );
}
