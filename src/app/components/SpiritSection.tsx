import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "react-i18next";

export function SpiritSection() {
  const { t } = useTranslation();

  const values = [
    t("spirit.fairPlay"),
    t("spirit.teamSpirit"),
    t("spirit.respect"),
    t("spirit.energy"),
  ];

  return (
    <section id="club" className="py-20 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-bold mb-5 tracking-tight">{t("spirit.title")}</h2>
            <p className="text-lg mb-10 text-muted-foreground leading-relaxed">
              {t("spirit.description")}
            </p>
            <ul className="space-y-0">
              {values.map((value, index) => (
                <motion.li
                  key={value}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className={`flex items-center gap-4 py-3.5 ${
                    index < values.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5B7D95] flex-shrink-0" />
                  <span className="font-medium">{value}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-xl">
              <ImageWithFallback
                src="images/tchoukleu.jpg"
                alt="Action de tchoukball"
                className="w-full h-[480px] object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
