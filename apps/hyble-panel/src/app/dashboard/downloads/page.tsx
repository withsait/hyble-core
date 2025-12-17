"use client";

import { DownloadProductList } from "@/components/downloads/DownloadProductList";

export default function DownloadsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">İndirmeler</h1>
        <p className="text-muted-foreground mt-1">
          Satın aldığınız dijital ürünleri indirin
        </p>
      </div>

      <DownloadProductList />
    </div>
  );
}
