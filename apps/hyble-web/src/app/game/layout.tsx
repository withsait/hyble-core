import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HybleGaming - Minecraft & Game Server Hosting",
  description: "Yüksek performanslı Minecraft sunucu hosting. Düşük ping, anında kurulum, 7/24 destek. Oyun sunucunuzu dakikalar içinde başlatın.",
  openGraph: {
    title: "HybleGaming - Minecraft & Game Server Hosting",
    description: "Yüksek performanslı Minecraft sunucu hosting. Düşük ping, anında kurulum, 7/24 destek.",
    images: ["/og-gaming.png"],
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
}
