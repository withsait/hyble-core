"use client";

import { TicketList } from "@/components/support/TicketList";

export default function SupportPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Destek</h1>
        <p className="text-muted-foreground mt-1">
          Sorularınız ve talepleriniz için destek alın
        </p>
      </div>

      <TicketList />
    </div>
  );
}
