import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function DashboardLayout({
  user,
  title,
  subtitle,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <Header user={user} title={title} subtitle={subtitle} />

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
