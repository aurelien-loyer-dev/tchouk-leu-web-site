import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export function TrainingSection() {
  const { t } = useTranslation();

  const trainingCards = [
    {
      icon: Calendar,
      title: t("training.sessions"),
      content: t("training.sessionLines", { returnObjects: true }) as string[],
    },
    {
      icon: MapPin,
      title: t("training.location"),
      content: t("training.locationLines", { returnObjects: true }) as string[],
    },
    {
      icon: Users,
      title: t("training.audience"),
      content: t("training.audienceLines", { returnObjects: true }) as string[],
    },
  ];

  return (
    <section id="entrainements" className="py-20 px-6 bg-muted/20 dark:bg-muted/5 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold tracking-tight mb-3">{t("training.title")}</h2>
          <p className="text-lg text-muted-foreground">{t("training.subtitle")}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {trainingCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <card.icon className="h-5 w-5 text-[#5B7D95] flex-shrink-0" />
                <h3 className="font-semibold text-lg">{card.title}</h3>
              </div>
              <ul className="space-y-2 pl-8">
                {card.content.map((item, i) => (
                  <li key={i} className="text-muted-foreground text-base leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
