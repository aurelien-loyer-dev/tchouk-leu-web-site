import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

export function SpiritSection() {
  const { t } = useTranslation();

  const values = [
    t("spirit.fairPlay"),
    t("spirit.teamSpirit"),
    t("spirit.respect"),
    t("spirit.energy"),
  ];

  return (
    <section id="club" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">
              Le club
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5">
              {t("spirit.title")}
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              {t("spirit.description")}
            </p>
            <ul className="space-y-3">
              {values.map((value, index) => (
                <motion.li
                  key={value}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#5B7D95] flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{value}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07]">
              <ImageWithFallback
                src="images/tchoukleu.jpg"
                alt="Action de tchoukball"
                loading="lazy"
                decoding="async"
                className="w-full h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/60 to-transparent" />
            </div>
            {/* Decorative border glow */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#5B7D95]/20 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
