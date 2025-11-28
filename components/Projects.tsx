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
    // BÖLÜM ZEMİNİ: Gündüz hafif gri (Kartlar beyaz görünsün diye), Gece SİYAH
    <section className="py-24 relative bg-gray-50 dark:bg-black transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-black dark:text-white">
            Teknolojiye <span className="text-primary">Hibrit</span> Yaklaşım
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            İhtiyaçlarınız için uçtan uca dijital çözümler.
          </p>
        </div>

        {/* Kartlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div 
              key={i}
              className="group relative p-8 rounded-2xl border transition-all duration-300
              /* GÜNDÜZ: Beyaz Kart, Gri Çizgi, Hafif Gölge */
              bg-white border-gray-200 shadow-sm hover:shadow-xl hover:border-primary/50
              /* GECE: Koyu Gri (#111) Kart, İnce Beyaz Çizgi */
              dark:bg-[#111111] dark:border-white/10 dark:hover:border-primary/30"
            >
              {/* İkon Kutusu */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110
                /* Gündüz Rengi */
                bg-gray-100 text-black 
                /* Gece Rengi */
                dark:bg-white/5 dark:text-white 
                /* Hover Rengi (Her ikisinde de Neon Yeşil) */
                group-hover:bg-primary group-hover:text-black">
                <s.icon className="w-6 h-6" />
              </div>

              {/* Badge (Etiket) */}
              <div className="absolute top-8 right-8 text-xs font-mono px-2 py-1 rounded
                bg-gray-100 text-gray-600
                dark:bg-white/5 dark:text-gray-400 border border-transparent dark:border-white/5">
                {s.badge}
              </div>

              {/* Başlık */}
              <h3 className="text-xl font-bold mb-3 font-display text-black dark:text-white">
                {s.title}
              </h3>
              
              {/* Açıklama */}
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