import { UniversalBar } from "@hyble/ui";

export default function CloudHomePage() {
  return (
    <>
      <UniversalBar activeApp="cloud" />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-cloud-50 to-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-cloud-100 px-4 py-1.5 text-sm font-medium text-cloud-700">
                SaaS Solutions
              </span>

              <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground-primary sm:text-5xl lg:text-6xl">
                Powerful{" "}
                <span className="bg-gradient-to-r from-cloud-600 to-cloud-400 bg-clip-text text-transparent">
                  Cloud Applications
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
                Enterprise-grade SaaS products designed to streamline your
                operations. GamePanel for server management, WebStore for
                e-commerce, and more.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://console.hyble.co/cloud"
                  className="inline-flex items-center justify-center rounded-lg bg-cloud-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-cloud-500/25 transition-all hover:bg-cloud-700"
                >
                  Explore Apps
                </a>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-base font-medium text-foreground-primary transition-colors hover:bg-gray-50"
                >
                  View Products
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground-primary">
                Our Products
              </h2>
              <p className="mt-4 text-lg text-foreground-secondary">
                Cloud-native applications built for scale and reliability.
              </p>
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {/* GamePanel */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-xl bg-studios-100 p-4 text-studios-600">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-studios-100 px-2 py-0.5 text-xs font-medium text-studios-700">
                      Gaming
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-foreground-primary">
                      GamePanel
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-foreground-secondary">
                  The ultimate game server management platform. Control
                  Minecraft, Rust, and more with an intuitive dashboard. Perfect
                  for hosting providers.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Multi-game support",
                    "Player management",
                    "Real-time console",
                    "Automated backups",
                    "Mod/plugin installer",
                    "White-label ready",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <svg className="h-4 w-4 text-studios-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-bold text-cloud-600">
                    From £29/mo
                  </p>
                  <a
                    href="/gamepanel"
                    className="text-sm font-medium text-cloud-600 hover:text-cloud-700"
                  >
                    Learn more →
                  </a>
                </div>
              </div>

              {/* WebStore */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-xl bg-digital-100 p-4 text-digital-600">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="inline-flex rounded-full bg-digital-100 px-2 py-0.5 text-xs font-medium text-digital-700">
                      E-commerce
                    </span>
                    <h3 className="mt-2 text-xl font-semibold text-foreground-primary">
                      WebStore
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-foreground-secondary">
                  A complete e-commerce solution for game servers and digital
                  products. Accept payments, manage orders, and grow your
                  community.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Stripe & PayPal integration",
                    "Digital product delivery",
                    "Subscription management",
                    "Discord integration",
                    "Custom themes",
                    "Analytics dashboard",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <svg className="h-4 w-4 text-digital-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-2xl font-bold text-cloud-600">
                    From £19/mo
                  </p>
                  <a
                    href="/webstore"
                    className="text-sm font-medium text-cloud-600 hover:text-cloud-700"
                  >
                    Learn more →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-foreground-primary">
              More Apps Coming Soon
            </h2>
            <p className="mt-4 text-foreground-secondary">
              We&apos;re building the next generation of cloud applications.
              Stay tuned!
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
