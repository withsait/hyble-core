"use client";

import { ArrowRight, Zap, Shield, Code } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0A0AFF] text-gray-900 dark:text-white transition-colors duration-300">

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-4 pt-20">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern bg-[size:60px_60px] opacity-20 dark:opacity-10" />

        {/* Gradient Orbs for dark mode */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-400/20 dark:bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-400/20 dark:bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span className="text-sm text-gray-600 dark:text-white/90">All-in-one platform for developers</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mb-8">
            <span className="text-gray-900 dark:text-white">Build.</span>{" "}
            <span className="text-blue-600 dark:text-cyan-400">Launch.</span>{" "}
            <span className="text-gray-900 dark:text-white">Scale.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
            Everything you need to build and grow your software business.
            Authentication, tools, licensing, and monitoring — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/contact"
              className="group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <span className="flex items-center gap-2">
                Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-medium text-lg rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Features Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500 dark:text-white/60">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              <span>Lightning fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-500" />
              <span>Secure by default</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-500" />
              <span>Developer first</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
