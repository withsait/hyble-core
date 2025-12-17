// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input } from "@hyble/ui";
import { trpc } from "@/lib/trpc/client";
import {
  ShoppingBag,
  Search,
  Filter,
  Package,
  Cloud,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  ChevronRight,
  Loader2,
  Tag,
} from "lucide-react";

const typeIcons: Record<string, typeof Cloud> = {
  DIGITAL: Package,
  SUBSCRIPTION: Zap,
  BUNDLE: ShoppingBag,
  SERVICE: Server,
};

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // tRPC queries
  const { data: productsData, isLoading: productsLoading } = trpc.pim.listProducts.useQuery({
    status: "ACTIVE",
    categoryId: selectedCategory || undefined,
    search: searchTerm || undefined,
    limit: 50,
  });

  const { data: categoriesData } = trpc.pim.listCategories.useQuery({});

  const categories = categoriesData || [];
  const products = productsData?.products || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <ShoppingBag className="h-7 w-7 text-primary" />
          Ürün Kataloğu
        </h1>
        <p className="text-muted-foreground mt-1">
          Hosting, cloud ve diğer hizmetlerimizi keşfedin
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tümü
          </Button>
          {categories.map((category: any) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.nameTr}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Aramanızla eşleşen ürün bulunamadı" : "Henüz ürün yok"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const Icon = typeIcons[product.type] || Package;
            const lowestPrice = product.lowestPrice || product.basePrice;

            return (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Image/Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                  {product.primaryImage ? (
                    <img
                      src={product.primaryImage}
                      alt={product.nameTr}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="h-12 w-12 text-primary/50" />
                  )}
                  {product.isFeatured && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Öne Çıkan
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {product.nameTr}
                      </h3>
                      {product.shortDescTr && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {product.shortDescTr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-muted px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      {lowestPrice ? (
                        <>
                          <span className="text-lg font-bold text-primary">
                            €{Number(lowestPrice).toFixed(2)}
                          </span>
                          {product.type === "SUBSCRIPTION" && (
                            <span className="text-xs text-muted-foreground">/ay</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Fiyat için iletişim</span>
                      )}
                    </div>
                    <Link href={`/store/${product.slug}`}>
                      <Button size="sm">
                        İncele
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Featured Categories */}
      {!searchTerm && !selectedCategory && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Popüler Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Cloud, title: "Cloud Hosting", desc: "VPS & Cloud Sunucular", color: "bg-blue-500" },
              { icon: Globe, title: "Web Hosting", desc: "Paylaşımlı Hosting", color: "bg-green-500" },
              { icon: Database, title: "Veritabanı", desc: "Managed Databases", color: "bg-purple-500" },
              { icon: Shield, title: "SSL & Güvenlik", desc: "Sertifikalar", color: "bg-orange-500" },
            ].map((cat, i) => (
              <Card
                key={i}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className={`h-10 w-10 ${cat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <cat.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-sm">{cat.title}</h3>
                <p className="text-xs text-muted-foreground">{cat.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
