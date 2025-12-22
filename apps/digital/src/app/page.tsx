import { UniversalBar } from "@hyble/ui";

export default function DigitalHomePage() {
  return (
    <>
      <UniversalBar activeApp="digital" />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-digital-50 to-white py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-digital-100 px-4 py-1.5 text-sm font-medium text-digital-700">
                Enterprise Web Services
              </span>

              <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground-primary sm:text-5xl lg:text-6xl">
                Build Your{" "}
                <span className="bg-gradient-to-r from-digital-600 to-digital-400 bg-clip-text text-transparent">
                  Digital Presence
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
                Professional web hosting, domain registration, SSL certificates,
                and managed services designed for businesses that demand
                reliability.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://console.hyble.co/digital"
                  className="inline-flex items-center justify-center rounded-lg bg-digital-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-digital-500/25 transition-all hover:bg-digital-700"
                >
                  Get Started
                </a>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-8 py-3 text-base font-medium text-foreground-primary transition-colors hover:bg-gray-50"
                >
                  View Services
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground-primary">
                Our Services
              </h2>
              <p className="mt-4 text-lg text-foreground-secondary">
                Everything you need to establish and grow your online presence.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Web Hosting */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-digital-100 p-3 text-digital-600">
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
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground-primary">
                  Web Hosting
                </h3>
                <p className="mt-4 text-foreground-secondary">
                  High-performance hosting with SSD storage, automatic backups,
                  and 99.9% uptime guarantee.
                </p>
                <p className="mt-4 text-2xl font-bold text-digital-600">
                  From £4.99/mo
                </p>
              </div>

              {/* Domains */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-digital-100 p-3 text-digital-600">
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
                <h3 className="mt-6 text-xl font-semibold text-foreground-primary">
                  Domain Registration
                </h3>
                <p className="mt-4 text-foreground-secondary">
                  Register your perfect domain from hundreds of TLDs with free
                  WHOIS privacy protection.
                </p>
                <p className="mt-4 text-2xl font-bold text-digital-600">
                  From £9.99/yr
                </p>
              </div>

              {/* SSL */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 transition-shadow hover:shadow-lg">
                <div className="inline-flex rounded-xl bg-digital-100 p-3 text-digital-600">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground-primary">
                  SSL Certificates
                </h3>
                <p className="mt-4 text-foreground-secondary">
                  Secure your website with industry-standard SSL certificates.
                  Free Let&apos;s Encrypt or premium options.
                </p>
                <p className="mt-4 text-2xl font-bold text-digital-600">
                  Free - £99/yr
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-foreground-primary">
              More Services Coming Soon
            </h2>
            <p className="mt-4 text-foreground-secondary">
              We&apos;re constantly expanding our offerings to better serve your
              business needs.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
