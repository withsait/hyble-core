"use client";

import { ArrowUpRight, Code, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const projects = [
  {
    title: "Hyble Panel",
    description: "Müşteri portalı ve yönetim sistemi. Real-time dashboard, fatura yönetimi ve destek sistemi.",
    tags: ["Next.js", "Prisma", "PostgreSQL"],
    icon: Code,
    color: "primary",
    link: "/panel"
  },
  {
    title: "AI Assistant",
    description: "Yapay zeka destekli müşteri destek asistanı. GPT-4 ve Gemini entegrasyonu.",
    tags: ["OpenAI", "Gemini", "RAG"],
    icon: Sparkles,
    color: "secondary",
    link: "#"
  },
  {
    title: "SecureGuard",
    description: "Siber güvenlik izleme ve koruma platformu. SIEM entegrasyonu ve tehdit analizi.",
    tags: ["Security", "Monitoring", "AI"],
    icon: Shield,
    color: "accent",
    link: "#"
  }
];

export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.current?.querySelectorAll(".project-card");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 relative bg-white dark:bg-[#061020] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Öne Çıkan <span className="text-primary">Projeler</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-4">
            Geliştirdiğimiz ve yönettiğimiz bazı projeler.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project, i) => (
            <Link
              key={i}
              href={project.link}
              className="project-card animate-on-scroll group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all duration-300
                bg-gray-50 dark:bg-[#0D1E36]
                border-gray-200 dark:border-[#1A3050]
                hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-neon"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300
                ${project.color === 'primary' ? 'bg-primary/10 text-primary' :
                  project.color === 'secondary' ? 'bg-secondary/10 text-secondary' :
                  'bg-accent/10 text-accent'}
                group-hover:scale-110`}
              >
                <project.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-6 sm:top-8 right-6 sm:right-8 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-primary group-hover:text-black transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-muted border border-gray-200 dark:border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
