import { motion } from "motion/react";
import { Heart, Users, Target } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadWallOfFameMembers, type WallOfFameMember } from "../data/wallOfFame";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { useTranslation } from "react-i18next";

const wallFunctionLabelByValue = {
  coach: "Coach",
  joueur: "Joueur",
  benevole: "Staff",
  president: "Président",
} as const;

function getPalmaresEntries(member: WallOfFameMember) {
  const palmaresByFunction = member.palmaresByFunction ?? {};
  const entries = member.functions
    .map((fn) => {
      const value = palmaresByFunction[fn]?.trim() ?? "";
      if (!value) return null;
      return { functionLabel: wallFunctionLabelByValue[fn] ?? fn, value };
    })
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  if (entries.length > 0) return entries;
  if (member.palmares?.trim()) return [{ functionLabel: "Général", value: member.palmares.trim() }];
  return [];
}

export function ClubPage() {
  const { t } = useTranslation();
  const [wallOfFameMembers, setWallOfFameMembers] = useState<WallOfFameMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWallOfFameMembers()
      .then(setWallOfFameMembers)
      .catch(() => setWallOfFameMembers([]))
      .finally(() => setIsLoading(false));
  }, []);

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
      <section className="py-16 px-6 bg-[#0a0f18]">
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

      <Separator className="bg-white/[0.06]" />

      {/* Wall of Fame */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-2">
              Wall of Fame
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("club.wofTitle")}</h2>
            <p className="text-slate-500 mt-1">{t("club.wofSubtitle")}</p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/[0.07] overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_140px]">
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-5 w-40 bg-white/5" />
                    <Skeleton className="h-4 w-28 bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                  </div>
                  <Skeleton className="h-36 md:h-full rounded-none bg-white/5" />
                </div>
              ))}
            </div>
          ) : wallOfFameMembers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {wallOfFameMembers.map((member, index) => {
                const palmaresEntries = getPalmaresEntries(member);
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
                  >
                    <Card className="bg-card border-white/[0.07] overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_140px] items-stretch">
                      <CardContent className="px-6 py-5">
                        <div className="space-y-3">
                          <div>
                            <p className="font-bold text-lg text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {member.functions.map((fn) => (
                                <Badge
                                  key={fn}
                                  variant="secondary"
                                  className="bg-[#5B7D95]/15 text-[#7BAEC8] border-0 text-xs px-2 py-0"
                                >
                                  {wallFunctionLabelByValue[fn] ?? fn}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-slate-600 text-xs mt-1">
                              {t("club.wofMemberSince")} {member.memberSince}
                            </p>
                          </div>
                          {palmaresEntries.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-white/[0.05]">
                              {palmaresEntries.map((entry) => (
                                <p
                                  key={`${member.id}-${entry.functionLabel}`}
                                  className="text-sm text-slate-500 leading-relaxed whitespace-pre-line"
                                >
                                  {entry.value}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="relative h-36 md:h-auto order-first md:order-last">
                        <ImageWithFallback
                          src={member.photoSrc}
                          alt={`${member.firstName} ${member.lastName}`}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent md:bg-gradient-to-l" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">{t("club.wofEmpty")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
