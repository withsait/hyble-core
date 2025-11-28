import { Bot, Sparkles } from "lucide-react";

export default function FloatingAI() {
  return (
    <button className="fixed bottom-8 right-8 z-50 group">
      {/* Glow Efekti - ARTIK MAVİ/TURKUAZ GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary via-tertiary to-primary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse font-sans"></div>
      
      {/* Buton Gövdesi */}
      <div className="relative bg-[#0A0A0A] border border-secondary/30 group-hover:border-secondary text-white p-4 rounded-full shadow-neon-blue transition-all hover:scale-110 group-hover:-translate-y-1 flex items-center justify-center">
        {/* İkon Rengi Mavi Oldu */}
        <Bot className="w-6 h-6 text-secondary" />
        
        {/* Bildirim Noktası */}
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full">
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
        </span>
      </div>

      {/* Tooltip (Konuşma Balonu) */}
      <div className="absolute bottom-full right-0 mb-4 w-72 p-5 bg-[#0A0A0A]/90 backdrop-blur-xl border border-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 pointer-events-none shadow-2xl">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm font-bold text-white font-display tracking-wide">Hyble Architect AI</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed font-sans">
          <span className="text-secondary font-medium">Sait Bey</span>, sistemler aktif. Yeni hibrit renk paletini işliyorum. Başka bir arzunuz var mı?
        </p>
      </div>
    </button>
  );
}