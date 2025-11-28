import { Cpu, Gamepad2, Rocket, Globe, ShieldCheck, BarChart3 } from "lucide-react";

// Hizmet listesi
const services = [
  { title: "Web & AI Development", icon: Globe, badge: "Core", description: "Next.js tabanlı, yapay zeka entegreli modern web uygulamaları." },
  { title: "Hyble Gaming", icon: Gamepad2, badge: "Play", description: "Yüksek performanslı Minecraft sunucu kurulumları ve plugin geliştirme." },
  { title: "Dijital Dönüşüm", icon: Cpu, badge: "Business", description: "Manuel iş süreçlerinizi otomasyona döküyoruz. CRM ve ERP çözümleri." },
  { title: "Growth & Pazarlama", icon: BarChart3, badge: "Strategy", description: "Veri odaklı büyüme stratejileri ve sosyal medya yönetimi." },
  { title: "Siber Güvenlik", icon: ShieldCheck, badge: "Security", description: "Beyaz şapkalı koruma kalkanları ve sızma testleri." },
  { title: "Startup Danışmanlığı", icon: Rocket, badge: "Mentorship", description: "Fikirden ürüne giden yolda teknik mentorluk." },
];

export default function Services() {
  return (
    // ZEMİN: Sadece 'bg-background' (Antrasit #050505)
    <section className="py-24 relative bg-background">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-sans mb-4 text-foreground">
            Teknolojiye <span className="text-primary">Hibrit</span> Yaklaşım
          </h2>
          <p className="text-muted max-w-2xl mx-auto text-lg font-body">
            İhtiyaçlarınız için uçtan uca dijital çözümler.
          </p>
        </div>

        {/* Kartlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div 
              key={i}
              className="group relative p-8 rounded-3xl border transition-all duration-300
              /* YENİ STİL: Antrasit Kart (#0A0A0A), İnce Gri Çizgi (#1F1F1F) */
              bg-surface border-border hover:border-primary/30 hover:-translate-y-1"
            >
              {/* İkon Kutusu */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110
                /* Normal: Şeffaf Beyaz, Hover: Neon Yeşil */
                bg-white/5 text-white 
                group-hover:bg-primary group-hover:text-black">
                <s.icon className="w-6 h-6" />
              </div>

              {/* Badge (Etiket) */}
              <div className="absolute top-8 right-8 text-xs font-mono px-3 py-1 rounded-full
                bg-white/5 text-muted border border-white/5">
                {s.badge}
              </div>

              {/* Başlık */}
              <h3 className="text-xl font-bold mb-3 font-sans text-foreground">
                {s.title}
              </h3>
              
              {/* Açıklama */}
              <p className="text-sm leading-relaxed text-muted font-body">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}