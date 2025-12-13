"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Bot, Code2, Zap, Layers, Sparkles, Gamepad2, Play, Star, Users, Globe, Cpu, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import Services from "@/components/Services";
import Projects from "@/components/Projects";

// Intersection Observer Hook for scroll animations
function useIntersectionObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

// Stats Data
const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "50+", label: "Happy Clients" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "24/7", label: "Support" },
];

// Feature Cards
const features = [
  { title: "AI-Native", icon: Bot, desc: "Intelligent algorithms powering every system." },
  { title: "Modern Architecture", icon: Code2, desc: "Lightning fast with Next.js 15 and Cloud infrastructure." },
  { title: "Fast Delivery", icon: Zap, desc: "No unnecessary bureaucracy. Just results." }
];

// Tech Stack
const techStack = [
  "Google Gemini", "Next.js 15", "Supabase", "Vercel", "Prisma",
  "Tailwind CSS", "TypeScript", "Docker", "Stripe", "OpenAI"
];

export default function Home() {
  useIntersectionObserver();
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax effect for hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] dark:bg-[#061020] text-gray-900 dark:text-[#EDEDED] transition-colors duration-300">

      {/* ============================================= */}
      {/* HERO SECTION                                */}
      {/* ============================================= */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-28 sm:pt-32 pb-8 sm:pb-12 border-b border-gray-200 dark:border-[#1A3050]">

        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern bg-[size:40px_40px] sm:bg-[size:60px_60px] opacity-50 dark:opacity-[0.15]" />

        {/* Gradient Orbs - Mavi tonlar */}
        <div
          ref={heroRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-b from-blue-500/20 dark:from-blue-500/10 via-transparent to-transparent blur-[80px] sm:blur-[120px] pointer-events-none will-change-transform"
        />
        <div className="absolute bottom-0 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-gradient-to-tl from-cyan-500/10 via-transparent to-transparent blur-[60px] sm:blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 text-center mt-4 sm:mt-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md mb-6 sm:mb-8 animate-fade-in-down shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-xs font-mono text-gray-600 dark:text-gray-300 tracking-widest uppercase">All In One. All In Hyble.</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.15] mb-5 sm:mb-8 text-gray-900 dark:text-white animate-scale-in px-2">
            <span className="block">We Build Your</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600">
              Digital Future.
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-10 font-light leading-relaxed animate-fade-in-up px-4">
            AI-powered infrastructure, high-performance web architectures, and scalable digital solutions for your business.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-14 px-4 w-full">
            <Link
              href="/contact"
              className="w-full sm:w-auto group px-5 sm:px-8 py-3 sm:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm sm:text-base md:text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-slide-in-left touch-target"
            >
              <span className="flex items-center justify-center gap-2">
                Start Your Project <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="#services"
              className="w-full sm:w-auto px-5 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium text-sm sm:text-base md:text-lg rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 animate-slide-in-right touch-target"
            >
              What We Do
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-14 px-2 animate-on-scroll w-full">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/5"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-left mb-8 sm:mb-14 px-2 w-full">
            {features.map((item, i) => (
              <div
                key={i}
                className="animate-on-scroll group p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border transition-all duration-300 bg-white dark:bg-[#0D1E36] border-gray-200 dark:border-[#1A3050] hover:border-gray-300 dark:hover:border-[#2A4060] hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6 transition-all duration-300 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white border border-gray-200 dark:border-white/5 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 group-hover:scale-110">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tech Stack Marquee */}
          <div className="border-t border-gray-200 dark:border-white/5 pt-8 sm:pt-12 pb-6 sm:pb-12 overflow-hidden relative w-full">
            <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAFBFC] dark:from-[#061020] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAFBFC] dark:from-[#061020] to-transparent z-10 pointer-events-none" />

            <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-10 opacity-80 px-2">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <p className="text-[9px] sm:text-xs font-mono text-gray-600 dark:text-white tracking-[0.15em] sm:tracking-[0.3em] uppercase text-center">
                POWERED BY <span className="text-gray-900 dark:text-white font-bold">TECHNOLOGY</span>
              </p>
              <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            </div>

            <div className="flex w-max animate-scroll gap-6 sm:gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
              {[...techStack, ...techStack].map((tech, i) => (
                <span key={i} className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white transition-colors cursor-default select-none flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  {tech === "Google Gemini" && <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-500 inline mb-0.5" />}
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-4 pb-4 sm:pb-6 animate-bounce-slow">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* MINEBLE GAMING SECTION - Minecraft Theme    */}
      {/* ============================================= */}
      <section id="mineble" className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-minecraft-grass/10 via-minecraft-emerald/5 to-minecraft-diamond/10 dark:from-minecraft-grass/20 dark:via-minecraft-creeper/10 dark:to-minecraft-diamond/20">

        {/* Pixel Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(76, 175, 80, 0.3) 8px, rgba(76, 175, 80, 0.3) 16px),
                              repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(76, 175, 80, 0.3) 8px, rgba(76, 175, 80, 0.3) 16px)`,
          }} />
        </div>

        {/* Floating Pixel Elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-minecraft-grass animate-pixel-float opacity-40 hidden sm:block" />
        <div className="absolute top-20 right-20 w-6 h-6 bg-minecraft-emerald animate-pixel-float opacity-30 hidden sm:block" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-minecraft-diamond animate-pixel-float opacity-30 hidden sm:block" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 right-1/3 w-4 h-4 bg-minecraft-gold animate-pixel-float opacity-40 hidden sm:block" style={{ animationDelay: "1.5s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left: Content */}
            <div className="animate-on-scroll">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-minecraft-grass/20 border border-minecraft-grass/30 mb-6">
                <Gamepad2 className="w-4 h-4 text-minecraft-grass" />
                <span className="text-xs font-mono text-minecraft-grass tracking-wider uppercase">Mineble Gaming</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-minecraft-grass via-minecraft-emerald to-minecraft-diamond">Minecraft</span>
                <br />
                <span className="text-gray-900 dark:text-white">Server Solutions</span>
              </h2>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
                High-performance Minecraft servers, custom plugin development, and professional server management.
                Elevate your player experience to the next level.
              </p>

              {/* Feature List */}
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "Custom Plugin Development",
                  "Anti-Cheat Systems",
                  "Performance Optimization",
                  "24/7 Technical Support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded bg-minecraft-grass/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-minecraft-grass" />
                    </div>
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA - Sarı/Yeşil sadece burada */}
              <Link
                href="/gaming"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-minecraft-grass to-minecraft-emerald text-white font-bold rounded-xl hover:shadow-minecraft transition-all duration-300 hover:scale-105 active:scale-95 touch-target"
              >
                <Play className="w-5 h-5" />
                Launch Server
              </Link>
            </div>

            {/* Right: Visual Card */}
            <div className="animate-on-scroll" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-minecraft-grass/30 via-minecraft-emerald/20 to-minecraft-diamond/30 blur-2xl opacity-50 animate-pulse-slow" />

                {/* Main Card */}
                <div className="relative bg-white dark:bg-[#0D1E36] border-2 border-minecraft-grass/30 dark:border-minecraft-grass/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 overflow-hidden">
                  {/* Pixel Corner Decorations */}
                  <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 bg-minecraft-grass/20" />
                  <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-minecraft-emerald/20" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 bg-minecraft-diamond/20" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-minecraft-gold/20" />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-minecraft-grass/10 border border-minecraft-grass/20">
                      <Users className="w-5 h-5 sm:w-8 sm:h-8 text-minecraft-grass mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">10K+</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Active Players</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-minecraft-emerald/10 border border-minecraft-emerald/20">
                      <Globe className="w-5 h-5 sm:w-8 sm:h-8 text-minecraft-emerald mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">25+</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Active Servers</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-minecraft-diamond/10 border border-minecraft-diamond/20">
                      <Cpu className="w-5 h-5 sm:w-8 sm:h-8 text-minecraft-diamond mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">20ms</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Avg. Ping</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 rounded-xl bg-minecraft-gold/10 border border-minecraft-gold/20">
                      <Star className="w-5 h-5 sm:w-8 sm:h-8 text-minecraft-gold mx-auto mb-1 sm:mb-2" />
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">4.9</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">User Rating</div>
                    </div>
                  </div>

                  {/* Server Status */}
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-[#061020] border border-gray-200 dark:border-[#1A3050]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-minecraft-grass animate-pulse" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">play.mineble.co</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-minecraft-grass font-mono">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* SERVICES & PROJECTS                          */}
      {/* ============================================= */}
      <Services />
      <Projects />

      {/* ============================================= */}
      {/* CTA SECTION                                   */}
      {/* ============================================= */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-500/10 blur-[100px] sm:blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-on-scroll text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Let&apos;s Bring Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">Project to Life</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 px-4">
              Whether it&apos;s a startup idea or an enterprise transformation project,
              we&apos;re ready to create solutions together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-base sm:text-lg rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 touch-target"
              >
                Start Free Consultation
              </Link>
              <Link
                href="/portfolio"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium text-base sm:text-lg rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 touch-target"
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
