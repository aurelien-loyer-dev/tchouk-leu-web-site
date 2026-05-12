import { Hero } from "../components/Hero";
import { SpiritSection } from "../components/SpiritSection";
import { Gallery } from "../components/Gallery";
import { JoinSection } from "../components/JoinSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <SpiritSection />
      <Gallery />
      <JoinSection />
    </>
  );
}
