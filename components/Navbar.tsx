import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-bold text-white tracking-tighter">
            hyble
          </span>
          <span className="w-2 h-2 rounded-full bg-primary mb-1 group-hover:animate-pulse"></span>
        </Link>

        {/* ORTA MENÜ */}
        <div className="hidden md:flex items-center gap-8">
          {["Hizmetler", "Projeler", "AI Çözümleri", "Blog"].map((item) => (
            <Link key={item} href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              {item}
            </Link>
          ))}
        </div>

        {/* SAĞ TARAF */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all group"
          >
            Müşteri Girişi
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
          </Link>
        </div>

      </div>
    </nav>
  );
}