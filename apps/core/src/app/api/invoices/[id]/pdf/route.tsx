import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@hyble/db";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch invoice
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Parse items and billing address from JSON
    const items = (invoice.items as Array<{
      name: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>) || [];

    const billingAddress = invoice.billingAddress as {
      line1: string;
      line2?: string;
      city: string;
      postalCode: string;
      country: string;
    } | null;

    // Prepare invoice data for PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status as "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED",
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      customerName: user?.name || "Müşteri",
      customerEmail: user?.email || "",
      customerAddress: billingAddress,
      items,
      subtotal: parseFloat(invoice.subtotal.toString()),
      taxRate: parseFloat(invoice.taxRate.toString()),
      taxAmount: parseFloat(invoice.taxAmount.toString()),
      total: parseFloat(invoice.total.toString()),
      currency: invoice.currency,
      notes: invoice.notes,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF data={invoiceData} />
    );

    // Return PDF as response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[Invoice PDF] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
