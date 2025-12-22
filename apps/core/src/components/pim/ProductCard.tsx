"use client";

import Link from "next/link";
import { Package, Layers, Box, Wrench } from "lucide-react";

interface ProductCardProps {
  id: string;
  nameTr: string;
  nameEn: string;
  type: string;
  status: string;
  basePrice?: string | number | null;
  currency: string;
  thumbnail?: string | null;
}

export function ProductCard({
  id,
  nameTr,
  nameEn,
  type,
  status,
  basePrice,
  currency,
  thumbnail,
}: ProductCardProps) {
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "DIGITAL":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "SUBSCRIPTION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "BUNDLE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "SERVICE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "ARCHIVED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DIGITAL": return <Package className="h-4 w-4" />;
      case "SUBSCRIPTION": return <Layers className="h-4 w-4" />;
      case "BUNDLE": return <Box className="h-4 w-4" />;
      case "SERVICE": return <Wrench className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <Link href={`/admin/products/${id}`}>
      <div className="group rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={nameTr}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {getTypeIcon(type)}
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
              {status === "ACTIVE" ? "Aktif" : status === "DRAFT" ? "Taslak" : "Arşiv"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {nameTr}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{nameEn}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getTypeBadgeColor(type)}`}>
              {getTypeIcon(type)}
              {type}
            </span>
          </div>

          {/* Price */}
          <div className="pt-2 border-t">
            <p className="text-lg font-semibold">
              {basePrice ? `${Number(basePrice).toFixed(2)} ${currency}` : "Fiyat belirtilmemiş"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
