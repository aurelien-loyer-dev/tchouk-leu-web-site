import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { ContainerScroll } from "./ui/container-scroll-animation";

export function SpiritSection() {
  const { t } = useTranslation();

  const values = [
    t("spirit.fairPlay"),
    t("spirit.teamSpirit"),
    t("spirit.respect"),
    t("spirit.energy"),
  ];

  return (
    <section id="club" className="bg-background overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="mb-6 text-center px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">
              Le club
            </p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight mb-4">
              {t("spirit.title")}
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-xl mx-auto mb-6">
              {t("spirit.description")}
            </p>
            <ul className="flex flex-wrap justify-center gap-3">
              {values.map((value, index) => (
                <motion.li
                  key={value}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5B7D95]/10 border border-[#5B7D95]/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#5B7D95] flex-shrink-0" />
                  <span className="text-slate-300 text-sm font-medium">{value}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        }
      >
        <div className="relative w-full h-full">
          <ImageWithFallback
            src="images/tchoukleu.jpg"
            alt="Tchouk'Leu en action"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/70 via-transparent to-transparent" />
        </div>
      </ContainerScroll>
    </section>
  );
}
