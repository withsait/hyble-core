import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyble Panel",
  description: "Manage your Hyble services",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
