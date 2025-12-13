"use client";

import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Rocket,
  Globe,
  CheckCircle2,
  Sparkles,
  Server,
  Database,
  Cpu,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

// Auth URL for external links
const AUTH_URL = "https://id.hyble.co";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption with SSL/TLS, DDoS protection, and automated security patches.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Powered by NVMe SSDs and optimized infrastructure. 99.99% uptime guaranteed.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Content delivered from 200+ edge locations worldwide for blazing fast speeds.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Database,
    title: "Managed Databases",
    description: "PostgreSQL, MySQL, Redis - fully managed with automatic backups and scaling.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Cpu,
    title: "Auto Scaling",
    description: "Resources that grow with your business. Handle traffic spikes effortlessly.",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    icon: Clock,
    title: "Instant Deployment",
    description: "Deploy in seconds with our streamlined CI/CD pipeline and one-click rollbacks.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime", icon: TrendingUp },
  { value: "200+", label: "Edge Nodes", icon: Globe },
  { value: "<50ms", label: "Latency", icon: Zap },
  { value: "24/7", label: "Support", icon: Users },
];

const benefits = [
  "Zero-downtime deployments",
  "SOC 2 Type II Certified",
  "GDPR & HIPAA Compliant",
  "24/7 Premium Support",
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors duration-500">

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden px-4 pt-20 pb-12">

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

          {/* Gradient Orbs */}
          <div className="absolute top-0 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/25 via-indigo-400/15 to-transparent dark:from-blue-500/15 dark:via-indigo-500/10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-400/25 via-blue-400/15 to-transparent dark:from-cyan-500/15 dark:via-blue-500/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-gradient-to-t from-indigo-400/15 via-purple-400/10 to-transparent dark:from-indigo-500/10 dark:via-purple-500/5 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200/60 dark:border-blue-500/30 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">Next-generation cloud platform</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-5">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">Build.</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Launch.</span>{" "}
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">Scale.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed px-2">
            The all-in-one cloud platform for modern developers. Deploy faster, scale smarter, and build the future with enterprise-grade infrastructure.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <a
              href={`${AUTH_URL}/register`}
              className="group relative w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold text-base rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Building Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
            <Link
              href="#features"
              className="w-full sm:w-auto px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-semibold text-base rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <stat.icon className="w-4 h-4 text-blue-500" />
                  <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce opacity-60">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/10" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">succeed</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Build, deploy, and scale your applications with our comprehensive cloud services.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-400 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HYBLE SECTION */}
      <section id="about" className="py-16 md:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
                <Shield className="w-3.5 h-3.5" />
                Why Choose Hyble
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                Built for developers,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">trusted by enterprises</span>
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Join thousands of companies who trust Hyble to power their mission-critical applications. From startups to Fortune 500, we scale with you.
              </p>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <a
                href={`${AUTH_URL}/register`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-700">
                {/* Terminal/Dashboard Mock */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden shadow-xl">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 border-b border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="ml-3 text-slate-400 text-xs font-mono">hyble deploy</span>
                  </div>
                  {/* Terminal Content */}
                  <div className="p-4 font-mono text-xs space-y-1.5">
                    <div className="text-green-400">$ hyble deploy --production</div>
                    <div className="text-slate-400">Building application...</div>
                    <div className="text-slate-400">Running tests... <span className="text-green-400">passed</span></div>
                    <div className="text-slate-400">Deploying to 12 regions...</div>
                    <div className="text-blue-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Deployed successfully in 2.3s
                    </div>
                    <div className="text-slate-500">https://app.hyble.co</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-3 -right-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">99.99%</div>
                      <div className="text-[10px] text-slate-500">Uptime</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Server className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white">12</div>
                      <div className="text-[10px] text-slate-500">Regions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-16 md:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Simple Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
              Start free, scale as you grow
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              No hidden fees. No surprises. Pay only for what you use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Starter</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Perfect for side projects</p>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>
              <a
                href={`${AUTH_URL}/register`}
                className="block w-full text-center py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Pro - Highlighted */}
            <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-500 shadow-xl shadow-blue-500/20 relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
              <p className="text-sm text-blue-100 mb-4">For growing businesses</p>
              <div className="mb-4">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-sm text-blue-200">/month</span>
              </div>
              <a
                href={`${AUTH_URL}/register`}
                className="block w-full text-center py-2.5 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Start Free Trial
              </a>
            </div>

            {/* Enterprise */}
            <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Enterprise</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">For large organizations</p>
              <div className="mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white">Custom</span>
              </div>
              <a
                href="/contact"
                className="block w-full text-center py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ready to build the future?
          </h2>
          <p className="text-base md:text-lg text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of developers building amazing products with Hyble.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${AUTH_URL}/register`}
              className="group w-full sm:w-auto px-8 py-3.5 bg-white text-blue-600 font-bold text-base rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                Start for Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </a>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white/30 text-white font-semibold text-base rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
