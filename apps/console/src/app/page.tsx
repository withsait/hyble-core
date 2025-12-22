import { Card, CardContent, CardHeader, CardTitle } from "@hyble/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground-primary">Dashboard</h1>
        <p className="mt-1 text-foreground-secondary">
          Welcome back! Here&apos;s an overview of your services.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground-primary">0</div>
            <p className="text-xs text-foreground-muted">
              Across all verticals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">
              Credits Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground-primary">
              £0.00
            </div>
            <p className="text-xs text-foreground-muted">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">
              Monthly Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground-primary">
              £0.00
            </div>
            <p className="text-xs text-foreground-muted">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground-secondary">
              Support Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground-primary">0</div>
            <p className="text-xs text-foreground-muted">Open tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground-primary">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="https://studios.hyble.co"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-studios-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-studios-100 text-studios-600 transition-colors group-hover:bg-studios-200">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground-primary">
                Create Game Server
              </h3>
              <p className="text-sm text-foreground-secondary">
                Minecraft, Roblox, Rust & more
              </p>
            </div>
          </a>

          <a
            href="https://digital.hyble.co"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-digital-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-digital-100 text-digital-600 transition-colors group-hover:bg-digital-200">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground-primary">
                Start Web Project
              </h3>
              <p className="text-sm text-foreground-secondary">
                Hosting, domains & SSL
              </p>
            </div>
          </a>

          <a
            href="https://cloud.hyble.co"
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-cloud-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cloud-100 text-cloud-600 transition-colors group-hover:bg-cloud-200">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-foreground-primary">
                Explore Cloud Apps
              </h3>
              <p className="text-sm text-foreground-secondary">
                GamePanel, WebStore & more
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Empty state for services */}
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground-primary">
            No active services
          </h3>
          <p className="mt-1 text-foreground-secondary">
            Get started by creating your first service from one of our
            verticals.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a
              href="https://studios.hyble.co"
              className="rounded-lg bg-studios-600 px-4 py-2 text-sm font-medium text-white hover:bg-studios-700"
            >
              Browse Studios
            </a>
            <a
              href="https://digital.hyble.co"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-foreground-primary hover:bg-gray-50"
            >
              Browse Digital
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
