import { ProductList } from "@/components/pim/ProductList";

export const metadata = {
  title: "Ürünler | PIM - Hyble",
  description: "Ürün yönetimi",
};

export default function ProductsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ürünler</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Tüm ürünlerinizi buradan yönetin
        </p>
      </div>

      {/* Product List Component */}
      <ProductList />
    </div>
  );
}
