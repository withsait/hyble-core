import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@hyble/db";
import { getAdminSession } from "@/lib/admin/auth";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneNumber: true,
        phoneVerified: true,
        trustLevel: true,
        createdAt: true,
        updatedAt: true,
        twoFactorAuth: {
          select: { enabled: true },
        },
        _count: {
          select: { wallets: true, memberships: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert to CSV
    const headers = [
      "ID",
      "Email",
      "Name",
      "Role",
      "Status",
      "Email Verified",
      "Phone",
      "Phone Verified",
      "Trust Level",
      "2FA Enabled",
      "Wallets Count",
      "Organizations Count",
      "Created At",
      "Updated At",
    ];

    const rows = users.map((user) => [
      user.id,
      user.email,
      user.name || "",
      user.role,
      user.status,
      user.emailVerified ? "Yes" : "No",
      user.phoneNumber || "",
      user.phoneVerified ? "Yes" : "No",
      user.trustLevel,
      user.twoFactorAuth?.enabled ? "Yes" : "No",
      user._count.wallets.toString(),
      user._count.memberships.toString(),
      format(user.createdAt, "yyyy-MM-dd HH:mm:ss"),
      format(user.updatedAt, "yyyy-MM-dd HH:mm:ss"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const filename = `users-export-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
}
