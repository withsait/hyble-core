"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button, Input } from "@hyble/ui";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Package, 
  Layers, 
  Box, 
  Wrench 
} from "lucide-react";

export function ProductList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  
  // Debounce search could be added here, but keeping it simple for now
  const { data, isLoading, refetch } = trpc.pim.listProducts.useQuery({
    search: search || undefined,
    limit: 50, // Fetch a reasonable amount for the table
  });

  const deleteProduct = trpc.pim.deleteProduct.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Hata: ${error.message}`);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      deleteProduct.mutate({ id });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "DIGITAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "SUBSCRIPTION":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "BUNDLE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "SERVICE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DIGITAL": return <Package className="h-4 w-4 mr-1" />;
      case "SUBSCRIPTION": return <Layers className="h-4 w-4 mr-1" />;
      case "BUNDLE": return <Box className="h-4 w-4 mr-1" />;
      case "SERVICE": return <Wrench className="h-4 w-4 mr-1" />;
      default: return <Package className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Input
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button onClick={() => router.push("/dashboard/pim/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ürün
        </Button>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3">Ürün Adı</th>
                <th scope="col" className="px-6 py-3">Tip</th>
                <th scope="col" className="px-6 py-3">Durum</th>
                <th scope="col" className="px-6 py-3">Fiyat</th>
                <th scope="col" className="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Yükleniyor...
                  </td>
                </tr>
              ) : data?.products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                data?.products.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex flex-col">
                        <span>{product.nameTr}</span>
                        <span className="text-xs text-muted-foreground">{product.nameEn}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(product.type)}`}>
                        {getTypeIcon(product.type)}
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status || "")}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.lowestPrice 
                        ? `${Number(product.lowestPrice).toFixed(2)} ${product.currency}`
                        : `${Number(product.basePrice || 0).toFixed(2)} ${product.currency}`
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => router.push(`/dashboard/pim/products/${product.id}`)}
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Düzenle</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(product.id)}
                          title="Sil"
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
