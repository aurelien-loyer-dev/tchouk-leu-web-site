import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTranslation } from "react-i18next";

export function IslandSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-6 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-4">{t("island.title")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {t("island.quote")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-xl"
          >
            <ImageWithFallback
              src="images/Plage1.jpg"
              alt="Plage"
              className="w-full h-72 object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-hidden rounded-xl"
          >
            <ImageWithFallback
              src="images/montagne1.jpg"
              alt="Montagne"
              className="w-full h-72 object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
