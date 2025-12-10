import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyble Admin - God Panel",
  description: "Hyble Platform Administration",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
