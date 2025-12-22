"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateSiteWizard } from "@/components/cloud/CreateSiteWizard";

export default function NewSitePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/cloud"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Sitelere Dön
        </Link>
        <h1 className="text-2xl font-bold">Yeni Site Oluştur</h1>
        <p className="text-muted-foreground mt-1">
          Birkaç adımda sitenizi yayına alın
        </p>
      </div>

      <CreateSiteWizard />
    </div>
  );
}
