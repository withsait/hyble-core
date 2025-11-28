import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer";
import FloatingAI from "@/components/FloatingAI";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {children}
      </main>
      <Footer />
      <FloatingAI />
    </>
  );
}