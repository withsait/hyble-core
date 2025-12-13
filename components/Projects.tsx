"use client";

import { ArrowUpRight, Code, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

const projects = [
  {
    title: "Hyble Panel",
    description: "Customer portal and management system. Real-time dashboard, billing management, and support system.",
    tags: ["Next.js", "Prisma", "PostgreSQL"],
    icon: Code,
    link: "/panel"
  },
  {
    title: "AI Assistant",
    description: "AI-powered customer support assistant. GPT-4 and Gemini integration.",
    tags: ["OpenAI", "Gemini", "RAG"],
    icon: Sparkles,
    link: "#"
  },
  {
    title: "SecureGuard",
    description: "Cyber security monitoring and protection platform. SIEM integration and threat analysis.",
    tags: ["Security", "Monitoring", "AI"],
    icon: Shield,
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
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Featured <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">Projects</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-4">
            Some of the projects we&apos;ve developed and manage.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {projects.map((project, i) => (
            <Link
              key={i}
              href={project.link}
              className="project-card animate-on-scroll group relative p-5 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all duration-300
                bg-gray-50 dark:bg-[#0D1E36]
                border-gray-200 dark:border-[#1A3050]
                hover:border-gray-300 dark:hover:border-[#2A4060] hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300
                bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white
                group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 group-hover:scale-110"
              >
                <project.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-5 sm:top-8 right-5 sm:right-8 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900 transition-all">
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
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5"
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
