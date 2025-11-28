import { ArrowRight, Bot, Code2, Zap, Layers, Sparkles } from "lucide-react";
// Sadece bu bileşenleri çağırıyoruz. Sayfa içinde başka kod kalabalığı yok!
import Services from "@/components/Services";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <div className="flex flex-col bg-[#050505] min-h-screen text-[#EDEDED]">

      {/* ------------------------------------------- */}
      {/* HERO SECTION (VİTRİN)                     */}
      {/* ------------------------------------------- */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20 border-b border-white/5">

        {/* Arka Plan: Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-[size:60px_60px] opacity-[0.05]"></div>
        
        {/* Arka Plan: Sahne Işığı */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-[120px] pointer-events-none opacity-40"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center mt-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 animate-fade-in shadow-[0_0_15px_-5px_rgba(204,255,0,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono text-gray-300 tracking-widest uppercase">Hyble 2.0 Yayında</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8 text-white">
            Dijital Geleceğinizi <br />
            <span className="text-primary drop-shadow-neon">
              Kodluyoruz.
            </span>
          </h1>

          {/* Açıklama */}
          <p className="text-xl text-muted max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            İşletmeniz için yapay zeka destekli altyapılar, yüksek performanslı web mimarileri ve ölçeklenebilir dijital çözümler.
          </p>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <button className="group px-8 py-4 bg-primary text-black font-bold text-lg rounded-full transition-all hover:scale-105 hover:shadow-neon">
              <span className="flex items-center gap-2">
                Projeyi Başlat <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium text-lg rounded-full hover:bg-white/10 transition-colors">
              Neler Yapıyoruz?
            </button>
          </div>

          {/* İKON KARTLARI (Sadece 3 Tane - Hizmetler Değil, Özellikler) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-24">
            {[
              { title: "AI-Native", icon: Bot, desc: "Sistemin merkezinde çalışan akıllı algoritmalar." },
              { title: "Modern Mimari", icon: Code2, desc: "Next.js 15 ve Cloud altyapısı ile ışık hızında." },
              { title: "Hızlı Teslimat", icon: Zap, desc: "Gereksiz bürokrasi yok. Sadece sonuç var." }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-white/5 bg-[#0A0A0A] hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-colors text-white border border-white/5">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* --- INFINITE MARQUEE (Kayan Teknoloji Şeridi) --- */}
          <div className="border-t border-white/5 pt-16 pb-16 overflow-hidden relative w-full">
            {/* Yanlardan karartma efekti (Fade) */}
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>
            
            {/* YENİLENMİŞ BAŞLIK (Daha Havalı) */}
            <div className="flex items-center justify-center gap-3 mb-12 opacity-80">
              <Layers className="w-4 h-4 text-primary" />
              <p className="text-xs font-mono text-white tracking-[0.3em] uppercase">
                GÜÇ ALDIĞIMIZ <span className="text-primary font-bold border-b border-primary/50 pb-0.5">YENİ NESİL</span> TEKNOLOJİLER
              </p>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            
            {/* Animasyonlu Şerit */}
            <div className="flex w-max animate-scroll gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
               {[
                 // Gemini en başta!
                 "Google Gemini", "Next.js 15", "Supabase", "Vercel", "Prisma", "Tailwind CSS", "TypeScript", "Docker", "Stripe", "OpenAI",
                 "Google Gemini", "Next.js 15", "Supabase", "Vercel", "Prisma", "Tailwind CSS", "TypeScript", "Docker", "Stripe", "OpenAI"
               ].map((tech, i) => (
                 <span key={i} className="text-3xl font-bold font-display text-white/30 hover:text-white transition-colors cursor-default select-none flex items-center gap-2">
                   {tech === "Google Gemini" && <Sparkles className="w-5 h-5 text-secondary inline mb-1" />}
                   {tech}
                 </span>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* DİĞER BÖLÜMLER */}
      {/* Sadece burada çağırıyoruz. Eğer yukarıda başka kod varsa SİLİNDİ! */}
      <Projects />

    </div>
  );
}