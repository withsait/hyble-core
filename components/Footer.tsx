import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020202] border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Marka */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-3xl font-bold font-display text-white tracking-tighter mb-6 block">
              hyble<span className="text-primary">.</span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-8">
              Yapay zeka gücüyle işletmeleri ve toplulukları dönüştüren yeni nesil dijital mimarlık ofisi.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"><Twitter className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"><Instagram className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"><Linkedin className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"><Github className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Linkler */}
          <div>
            <h4 className="text-white font-bold mb-6">Şirket</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Kariyer</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Linkler 2 */}
          <div>
            <h4 className="text-white font-bold mb-6">Hizmetler</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link href="#" className="hover:text-primary transition-colors">Web Geliştirme</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">AI Danışmanlığı</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Minecraft Sunucu</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Siber Güvenlik</Link></li>
            </ul>
          </div>
        </div>

        {/* Alt Telif */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; 2025 Hyble Digital Solutions. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Gizlilik Politikası</Link>
            <Link href="#" className="hover:text-white">Kullanım Şartları</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}