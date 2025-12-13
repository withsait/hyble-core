"use client";

import {
  ArrowRight,
  Zap,
  Shield,
  Cloud,
  Activity,
  CheckCircle,
  Server,
  Database,
  Globe,
  Lock,
  BarChart3,
  Cpu
} from "lucide-react";
import Link from "next/link";

// Auth URL
const AUTH_URL = "https://id.hyble.co";

const features = [
  {
    icon: Cloud,
    title: "Hyble Cloud",
    description: "Scalable cloud infrastructure with automatic load balancing and global distribution.",
  },
  {
    icon: Server,
    title: "Hyble Store",
    description: "Deploy and manage applications with our intuitive control panel and API.",
  },
  {
    icon: Activity,
    title: "Status Monitoring",
    description: "Real-time monitoring and alerting for all your services and infrastructure.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, DDoS protection, and automated security patches.",
  },
];

const benefits = [
  "99.9% uptime guarantee",
  "24/7 technical support",
  "Automatic backups",
  "Global CDN included",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          {/* Subtle gradient overlay at top */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-8">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Enterprise-Grade Hosting Solutions</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-gray-900">Scale Without </span>
            <span className="text-blue-600">Limits</span>
            <span className="text-gray-900">.</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Secure, reliable, and compliant infrastructure designed for modern businesses and developers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href={`${AUTH_URL}/register`}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Start Deploying
            </a>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-3.5 bg-white border border-gray-300 text-gray-700 font-semibold text-base rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              Contact Sales
            </Link>
          </div>

        </div>

        {/* Curved divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C240 50 480 60 720 60C960 60 1200 50 1440 30V60H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reliable infrastructure with 99.9% uptime guarantee and dedicated support.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HYBLE SECTION */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Why businesses choose Hyble
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From startups to enterprises, thousands of companies trust Hyble to power their critical infrastructure with reliability and performance.
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <a
                href={`${AUTH_URL}/register`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right Visual - Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-blue-600 rounded-2xl text-white">
                <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <div className="text-blue-100 text-sm">Uptime SLA</div>
              </div>
              <div className="p-6 bg-gray-900 rounded-2xl text-white">
                <Globe className="w-8 h-8 mb-3 opacity-80" />
                <div className="text-3xl font-bold mb-1">12+</div>
                <div className="text-gray-400 text-sm">Global Regions</div>
              </div>
              <div className="p-6 bg-gray-100 rounded-2xl">
                <Zap className="w-8 h-8 mb-3 text-amber-500" />
                <div className="text-3xl font-bold text-gray-900 mb-1">&lt;50ms</div>
                <div className="text-gray-500 text-sm">Avg Latency</div>
              </div>
              <div className="p-6 bg-green-50 rounded-2xl">
                <Shield className="w-8 h-8 mb-3 text-green-600" />
                <div className="text-3xl font-bold text-gray-900 mb-1">SOC 2</div>
                <div className="text-gray-500 text-sm">Certified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Starter</h3>
              <p className="text-sm text-gray-500 mb-4">For side projects</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <a
                href={`${AUTH_URL}/register`}
                className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div className="p-6 bg-blue-600 rounded-2xl text-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-sm text-blue-100 mb-4">For growing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-blue-200">/month</span>
              </div>
              <a
                href={`${AUTH_URL}/register`}
                className="block w-full text-center py-2.5 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="p-6 bg-white rounded-2xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Enterprise</h3>
              <p className="text-sm text-gray-500 mb-4">For large orgs</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <a
                href="/contact"
                className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of developers and businesses building on Hyble.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${AUTH_URL}/register`}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              Create Free Account
            </a>
            <a
              href="/docs"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all border border-gray-700"
            >
              View Documentation
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
