import { Hero } from "../components/Hero";
import { SpiritSection } from "../components/SpiritSection";
import { Gallery } from "../components/Gallery";
import { JoinSection } from "../components/JoinSection";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router";

export function HomePage() {
  return (
    <>
      <Hero />
      <SpiritSection />

      {/* Scroll cinématique vers la galerie */}
      <section className="bg-background overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">Galerie</p>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                Des moments<br />
                <span className="text-[#5B7D95]">inoubliables</span>
              </h2>
              <p className="mt-3 text-slate-400 text-base max-w-md mx-auto">
                Revivez les meilleurs moments du club Tchouk&apos;Leu
              </p>
            </div>
          }
        >
          <div className="relative w-full h-full group">
            <ImageWithFallback
              src="images/tchoukleu.jpg"
              alt="Tchouk'Leu en action"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/80 via-transparent to-transparent flex items-end justify-center pb-8">
              <Link
                to="/galerie"
                className="px-6 py-2.5 rounded-full bg-[#5B7D95]/80 hover:bg-[#5B7D95] text-white text-sm font-semibold backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
              >
                Voir la galerie →
              </Link>
            </div>
          </div>
        </ContainerScroll>
      </section>

      <Gallery />
      <JoinSection />
    </>
  );
}
