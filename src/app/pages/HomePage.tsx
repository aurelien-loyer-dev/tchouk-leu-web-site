import { Hero } from "../components/Hero";
import { SpiritSection } from "../components/SpiritSection";
import { IslandSection } from "../components/IslandSection";
import { JoinSection } from "../components/JoinSection";

export function HomePage() {
  return (
    <>
      <Hero />
      <SpiritSection />
      <IslandSection />
      <JoinSection />
    </>
  );
}
