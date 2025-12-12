"use client";

import { Cpu, Gamepad2, Rocket, Globe, ShieldCheck, BarChart3 } from "lucide-react";
import { useEffect, useRef } from "react";

const services = [
  { title: "Web & AI Development", icon: Globe, badge: "Core", description: "Next.js tabanlı, yapay zeka entegreli modern web uygulamaları." },
  { title: "Hyble Gaming", icon: Gamepad2, badge: "Play", description: "Yüksek performanslı Minecraft sunucu kurulumları ve plugin geliştirme." },
  { title: "Dijital Dönüşüm", icon: Cpu, badge: "Business", description: "Manuel iş süreçlerinizi otomasyona döküyoruz. CRM ve ERP çözümleri." },
  { title: "Growth & Pazarlama", icon: BarChart3, badge: "Strategy", description: "Veri odaklı büyüme stratejileri ve sosyal medya yönetimi." },
  { title: "Siber Güvenlik", icon: ShieldCheck, badge: "Security", description: "Beyaz şapkalı koruma kalkanları ve sızma testleri." },
  { title: "Startup Danışmanlığı", icon: Rocket, badge: "Mentorship", description: "Fikirden ürüne giden yolda teknik mentorluk." },
];

export default function Services() {
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

    const cards = sectionRef.current?.querySelectorAll(".service-card");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-16 sm:py-24 relative bg-gray-50 dark:bg-[#0A1628] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Teknolojiye <span className="text-primary">Hibrit</span> Yaklaşım
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg px-4">
            İhtiyaçlarınız için uçtan uca dijital çözümler.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="service-card animate-on-scroll group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border transition-all duration-300
                bg-white dark:bg-[#0A1628]-surface
                border-gray-200 dark:border-[#1A3050]
                hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-neon"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300
                bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white
                group-hover:bg-primary group-hover:text-black group-hover:scale-110"
              >
                <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              {/* Badge */}
              <div className="absolute top-6 sm:top-8 right-6 sm:right-8 text-xs font-mono px-2 sm:px-3 py-1 rounded-full
                bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-muted border border-gray-200 dark:border-white/5"
              >
                {s.badge}
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white pr-16">
                {s.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
