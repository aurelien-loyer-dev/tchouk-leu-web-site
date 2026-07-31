import { motion } from "motion/react";
import { Heart, Users, Target } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { ShaderBackground } from "../components/ui/shader-background";
import { Separator } from "../components/ui/separator";
import { useTranslation } from "react-i18next";

export function ClubPage() {
  const { t } = useTranslation();

  const values = [
    { icon: Heart, title: t("club.fairPlay"), description: t("club.fairPlayDesc") },
    { icon: Users, title: t("club.teamSpirit"), description: t("club.teamSpiritDesc") },
    { icon: Target, title: t("club.performance"), description: t("club.performanceDesc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a26] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#5B7D95]/10 blur-3xl rounded-full" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">Le club</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
              {t("club.heroTitle")}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              {t("club.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Histoire */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-8 tracking-tight text-foreground">
              {t("club.historyTitle")}
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed max-w-3xl">
              <p>{t("club.historyP1")}</p>
              <p>{t("club.historyP2")}</p>
              <p>{t("club.historyP3")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Valeurs */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <ShaderBackground className="w-full h-full" />
        </div>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-2">
              {t("club.valuesTitle")}
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t("club.valuesSubtitle")}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-card border-white/[0.07] h-full">
                  <CardContent className="p-6">
                    <div className="w-9 h-9 rounded-lg bg-[#5B7D95]/15 flex items-center justify-center mb-4">
                      <value.icon className="h-4.5 w-4.5 text-[#5B7D95]" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
