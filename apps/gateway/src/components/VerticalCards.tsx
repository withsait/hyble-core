"use client";

import { motion } from "framer-motion";

const verticals = [
  {
    name: "Studios",
    tagline: "Game Server Hosting",
    description:
      "High-performance game servers for Minecraft, Roblox, Rust, and more. Launch in seconds with our GamePanel.",
    href: "https://studios.hyble.co",
    color: "studios",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    ),
    features: ["Minecraft", "Roblox", "Rust", "GamePanel"],
    bgGradient: "from-studios-500 to-studios-600",
    borderColor: "border-studios-200",
    hoverBorder: "hover:border-studios-300",
    textColor: "text-studios-600",
  },
  {
    name: "Digital",
    tagline: "Enterprise Web Services",
    description:
      "Professional web hosting, domains, and managed services for businesses of all sizes.",
    href: "https://digital.hyble.co",
    color: "digital",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ),
    features: ["Web Hosting", "Domains", "SSL", "Email"],
    bgGradient: "from-digital-500 to-digital-600",
    borderColor: "border-digital-200",
    hoverBorder: "hover:border-digital-300",
    textColor: "text-digital-600",
  },
  {
    name: "Cloud",
    tagline: "SaaS Solutions",
    description:
      "Powerful cloud applications including GamePanel for server management and WebStore for e-commerce.",
    href: "https://cloud.hyble.co",
    color: "cloud",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
    features: ["GamePanel", "WebStore", "Analytics", "API"],
    bgGradient: "from-cloud-500 to-cloud-600",
    borderColor: "border-cloud-200",
    hoverBorder: "hover:border-cloud-300",
    textColor: "text-cloud-600",
  },
];

export function VerticalCards() {
  return (
    <section id="verticals" className="bg-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight text-foreground-primary sm:text-4xl"
          >
            Three Verticals, One Platform
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-foreground-secondary"
          >
            Choose the right solution for your needs. All backed by Hyble&apos;s
            reliable infrastructure.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {verticals.map((vertical, index) => (
            <motion.a
              key={vertical.name}
              href={vertical.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border ${vertical.borderColor} bg-white p-8 shadow-sm transition-all duration-300 ${vertical.hoverBorder} hover:shadow-lg`}
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${vertical.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
              />

              <div className="relative">
                {/* Icon */}
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${vertical.bgGradient} p-3 text-white`}
                >
                  {vertical.icon}
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-foreground-primary">
                  {vertical.name}
                </h3>
                <p className={`mt-1 text-sm font-medium ${vertical.textColor}`}>
                  {vertical.tagline}
                </p>
                <p className="mt-4 text-foreground-secondary">
                  {vertical.description}
                </p>

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {vertical.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground-primary">
                  <span>Learn more</span>
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
