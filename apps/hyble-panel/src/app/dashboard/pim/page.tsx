import Link from "next/link";
import { Package, FolderTree, TrendingUp, AlertCircle } from "lucide-react";
import { prisma } from "@hyble/db";

export const metadata = {
  title: "PIM - Hyble",
  description: "Product Information Management",
};

export default async function PIMDashboardPage() {
  // Fetch stats
  const [productCount, categoryCount, draftCount, activeCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const stats = [
    {
      title: "Toplam Ürün",
      value: productCount,
      icon: Package,
      color: "blue",
      href: "/dashboard/pim/products",
    },
    {
      title: "Kategoriler",
      value: categoryCount,
      icon: FolderTree,
      color: "green",
      href: "/dashboard/pim/categories",
    },
    {
      title: "Aktif Ürünler",
      value: activeCount,
      icon: TrendingUp,
      color: "emerald",
      href: "/dashboard/pim/products?status=ACTIVE",
    },
    {
      title: "Taslaklar",
      value: draftCount,
      icon: AlertCircle,
      color: "yellow",
      href: "/dashboard/pim/products?status=DRAFT",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PIM Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Ürün ve kategori yönetimi
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/30 rounded-xl transition-all"
          >
            <div className={`w-12 h-12 rounded-lg ${colorStyles[stat.color as keyof typeof colorStyles]} flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {stat.title}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/pim/products/new"
          className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Package className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Yeni Ürün Ekle</h3>
          <p className="text-blue-100 text-sm">
            Kataloga yeni bir ürün ekleyin
          </p>
        </Link>

        <Link
          href="/dashboard/pim/categories"
          className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl text-white hover:from-emerald-600 hover:to-emerald-700 transition-all"
        >
          <FolderTree className="h-8 w-8 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Kategorileri Yönet</h3>
          <p className="text-emerald-100 text-sm">
            Ürün kategorilerini düzenleyin
          </p>
        </Link>
      </div>
    </div>
  );
}
