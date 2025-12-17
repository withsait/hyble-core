"use client";

import { SiteList } from "@/components/cloud/SiteList";

export default function CloudDashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Cloud Hosting</h1>
        <p className="text-muted-foreground mt-1">
          Sitelerinizi yönetin ve deploy edin
        </p>
      </div>

      <SiteList />
    </div>
  );
}
