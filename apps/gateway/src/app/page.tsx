import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VerticalCards } from "@/components/VerticalCards";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <VerticalCards />
      </main>
      <Footer />
    </>
  );
}
