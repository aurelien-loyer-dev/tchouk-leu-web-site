import { motion } from "motion/react";
import { Heart, Users, Target } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadWallOfFameMembers, type WallOfFameMember } from "../data/wallOfFame";
import { Skeleton } from "../components/ui/skeleton";
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
    .map((functionValue) => {
      const value = palmaresByFunction[functionValue]?.trim() ?? "";
      if (!value) return null;
      return { functionLabel: wallFunctionLabelByValue[functionValue] ?? functionValue, value };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (entries.length > 0) return entries;

  if (member.palmares?.trim()) {
    return [{ functionLabel: "Général", value: member.palmares.trim() }];
  }

  return [];
}

export function ClubPage() {
  const { t } = useTranslation();
  const [wallOfFameMembers, setWallOfFameMembers] = useState<WallOfFameMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWallOfFame = async () => {
      try {
        const loadedMembers = await loadWallOfFameMembers();
        setWallOfFameMembers(loadedMembers);
      } catch {
        setWallOfFameMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeWallOfFame();
  }, []);

  const values = [
    { icon: Heart, title: t("club.fairPlay"), description: t("club.fairPlayDesc") },
    { icon: Users, title: t("club.teamSpirit"), description: t("club.teamSpiritDesc") },
    { icon: Target, title: t("club.performance"), description: t("club.performanceDesc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-14 px-6 bg-gradient-to-b from-[#EAF2F6] to-background dark:from-[#1E2D36] dark:to-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t("club.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t("club.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-16 px-6 bg-background border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 tracking-tight">{t("club.historyTitle")}</h2>
            <div className="space-y-5 text-muted-foreground text-base leading-relaxed">
              <p>{t("club.historyP1")}</p>
              <p>{t("club.historyP2")}</p>
              <p>{t("club.historyP3")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-6 bg-muted/20 dark:bg-muted/5 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold mb-2 tracking-tight">{t("club.valuesTitle")}</h2>
            <p className="text-muted-foreground">{t("club.valuesSubtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    <value.icon className="h-5 w-5 text-[#5B7D95]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1.5">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <section className="py-16 px-6 bg-background border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold mb-2 tracking-tight">{t("club.wofTitle")}</h2>
            <p className="text-muted-foreground">{t("club.wofSubtitle")}</p>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border grid grid-cols-1 md:grid-cols-[240px_1fr]">
                  <Skeleton className="h-52 md:h-full rounded-none" />
                  <CardContent className="px-6 py-6 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : wallOfFameMembers.length > 0 ? (
            <div className="flex flex-col gap-5">
              {wallOfFameMembers.map((member, index) => {
                const palmaresEntries = getPalmaresEntries(member);
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                  >
                    <Card className="overflow-hidden border grid grid-cols-1 md:grid-cols-[1fr_160px] items-stretch">
                      <CardContent className="px-6 py-5">
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-semibold text-base">
                              {member.functions
                                .map((v) => wallFunctionLabelByValue[v] ?? v)
                                .join(" · ")}
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5">
                              {t("club.wofMemberSince")} {member.memberSince}
                            </p>
                          </div>
                          {palmaresEntries.length > 0 ? (
                            <div className="space-y-1.5 pt-1">
                              {palmaresEntries.map(
                                (entry) =>
                                  entry && (
                                    <p key={`${member.id}-${entry.functionLabel}`} className="whitespace-pre-line leading-relaxed text-muted-foreground">
                                      {entry.value}
                                    </p>
                                  ),
                              )}
                            </div>
                          ) : null}
                          <p className="text-xs text-muted-foreground/60 pt-1">
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                      </CardContent>
                      <div className="relative h-40 md:h-auto order-first md:order-last">
                        <ImageWithFallback
                          src={member.photoSrc}
                          alt={`Photo de ${member.firstName} ${member.lastName}`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("club.wofEmpty")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
