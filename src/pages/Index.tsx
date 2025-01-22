import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutSection />
    </div>
  );
}