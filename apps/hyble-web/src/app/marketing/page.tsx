"use client";

import {
  ArrowRight,
  Zap,
  Shield,
  Code,
  Cloud,
  Lock,
  BarChart3,
  Rocket,
  Globe,
  CheckCircle2,
  Sparkles,
  Server,
  Database,
  Cpu
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption with SSL/TLS, DDoS protection, and automated security patches. Your data stays safe 24/7.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Powered by NVMe SSDs and optimized infrastructure. Experience 99.99% uptime with sub-millisecond response times.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Content delivered from 200+ edge locations worldwide. Your users get blazing fast speeds wherever they are.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Database,
    title: "Managed Databases",
    description: "PostgreSQL, MySQL, Redis - fully managed with automatic backups, scaling, and zero-downtime migrations.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Cpu,
    title: "Auto Scaling",
    description: "Resources that grow with your business. Handle traffic spikes effortlessly with intelligent auto-scaling.",
    gradient: "from-blue-600 to-indigo-600",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "200+", label: "Edge Locations" },
  { value: "50ms", label: "Avg Response" },
  { value: "24/7", label: "Expert Support" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white transition-colors duration-500">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-4 pt-20">

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

          {/* Gradient Orbs */}
          <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-transparent dark:from-blue-500/20 dark:via-indigo-500/10 blur-3xl rounded-full animate-pulse" />
          <div className="absolute top-1/4 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-400/30 via-blue-400/20 to-transparent dark:from-cyan-500/20 dark:via-blue-500/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-t from-indigo-400/20 via-purple-400/10 to-transparent dark:from-indigo-500/15 dark:via-purple-500/10 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-blue-200/50 dark:border-blue-500/30 bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl mb-8 shadow-lg shadow-blue-500/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Next-generation cloud platform</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-8">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">Build.</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Launch.</span>{" "}
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">Scale.</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed px-4 font-light">
            The all-in-one cloud platform for modern developers. Deploy faster, scale smarter, and build the future with enterprise-grade infrastructure.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="https://id.hyble.co/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-lg rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 md:py-32 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent dark:via-blue-950/20" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
              <Rocket className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">succeed</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Build, deploy, and scale your applications with our comprehensive suite of cloud services.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HYBLE SECTION */}
      <section id="about" className="py-24 md:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                Why Choose Hyble
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                Built for developers,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">trusted by enterprises</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Join thousands of companies who trust Hyble to power their mission-critical applications. From startups to Fortune 500, we scale with you.
              </p>

              {/* Benefits List */}
              <div className="space-y-4">
                {[
                  "Zero-downtime deployments",
                  "SOC 2 Type II Certified",
                  "GDPR & HIPAA Compliant",
                  "24/7 Premium Support",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="https://id.hyble.co/register"
                className="inline-flex items-center gap-2 mt-10 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
                {/* Terminal/Dashboard Mock */}
                <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Terminal Header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-slate-400 text-sm font-mono">hyble deploy</span>
                  </div>
                  {/* Terminal Content */}
                  <div className="p-6 font-mono text-sm space-y-2">
                    <div className="text-green-400">$ hyble deploy --production</div>
                    <div className="text-slate-400">Building application...</div>
                    <div className="text-slate-400">Running tests... <span className="text-green-400">passed</span></div>
                    <div className="text-slate-400">Deploying to 12 regions...</div>
                    <div className="text-blue-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Deployed successfully in 2.3s
                    </div>
                    <div className="text-slate-500">https://app.hyble.co</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">99.99%</div>
                      <div className="text-xs text-slate-500">Uptime</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">12</div>
                      <div className="text-xs text-slate-500">Regions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Ready to build the future?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of developers building amazing products with Hyble.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://id.hyble.co/register"
              className="group px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/docs"
              className="px-10 py-5 bg-transparent border-2 border-white/30 text-white font-semibold text-lg rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
