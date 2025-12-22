"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateTicketWizard } from "@/components/support/CreateTicketWizard";

export default function NewTicketPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/support"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Taleplere Dön
        </Link>
        <h1 className="text-2xl font-bold">Yeni Destek Talebi</h1>
        <p className="text-muted-foreground mt-1">
          Sorununuzu detaylı açıklayın
        </p>
      </div>

      <CreateTicketWizard />
    </div>
  );
}
