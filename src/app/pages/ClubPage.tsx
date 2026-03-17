import { motion } from "motion/react";
import { Trophy, Users, Heart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadWallOfFameMembers, type WallOfFameMember } from "../data/wallOfFame";
import { useTranslation } from "react-i18next";

const wallFunctionLabelByValue = {
  coach: "Coach",
  joueur: "Joueur",
  benevole: "Bénévole",
  president: "Président",
} as const;

function getPalmaresEntries(member: WallOfFameMember) {
  const palmaresByFunction = member.palmaresByFunction ?? {};

  const entries = member.functions
    .map((functionValue) => {
      const value = palmaresByFunction[functionValue]?.trim() ?? "";

      if (!value) {
        return null;
      }

      return {
        functionLabel: wallFunctionLabelByValue[functionValue] ?? functionValue,
        value,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  if (entries.length > 0) {
    return entries;
  }

  if (member.palmares?.trim()) {
    return [
      {
        functionLabel: "Général",
        value: member.palmares.trim(),
      },
    ];
  }

  return [];
}

export function ClubPage() {
  const { t } = useTranslation();
  const [wallOfFameMembers, setWallOfFameMembers] = useState<WallOfFameMember[]>([]);

  useEffect(() => {
    const initializeWallOfFame = async () => {
      try {
        const loadedMembers = await loadWallOfFameMembers();
        setWallOfFameMembers(loadedMembers);
      } catch {
        setWallOfFameMembers([]);
      }
    };

    void initializeWallOfFame();
  }, []);

  const values = [
    {
      icon: Heart,
      title: t("club.fairPlay"),
      description: t("club.fairPlayDesc"),
    },
    {
      icon: Users,
      title: t("club.teamSpirit"),
      description: t("club.teamSpiritDesc"),
    },
    {
      icon: Target,
      title: t("club.performance"),
      description: t("club.performanceDesc"),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">{t("club.heroTitle")}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("club.heroSubtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-12 text-center">{t("club.historyTitle")}</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("club.historyP1")}
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {t("club.historyP2")}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("club.historyP3")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 px-6 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">{t("club.valuesTitle")}</h2>
            <p className="text-xl text-muted-foreground">
              {t("club.valuesSubtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full text-center hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-[#BFE6FF] dark:bg-[#4C93C3]/20 rounded-full">
                        <value.icon className="h-10 w-10 text-[#4C93C3]" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wall of Fame */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Trophy className="h-16 w-16 mx-auto mb-6 text-[#4C93C3]" />
            <h2 className="text-5xl font-bold mb-4">{t("club.wofTitle")}</h2>
            <p className="text-xl text-muted-foreground">
              {t("club.wofSubtitle")}
            </p>
          </motion.div>

          {wallOfFameMembers.length > 0 ? (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
              {wallOfFameMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {(() => {
                    const palmaresEntries = getPalmaresEntries(member);

                    return (
                  <Card className="overflow-hidden border-2 border-[#4C93C3]/20 grid grid-cols-[280px_1fr] items-stretch">
                    <div className="relative overflow-hidden min-h-64">
                        <ImageWithFallback
                          src={member.photoSrc}
                          alt={`Photo de ${member.firstName} ${member.lastName}`}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>
                    <CardContent className="px-8 py-6">
                        <CardTitle className="text-2xl mb-4">{member.firstName} {member.lastName}</CardTitle>
                        <div className="space-y-4 text-muted-foreground">
                          <div>
                            <p className="text-sm uppercase tracking-wide mb-1">{t("club.wofFunctions")}</p>
                            <p className="text-base text-foreground">
                              {member.functions.map((value) => wallFunctionLabelByValue[value] ?? value).join(" • ")}
                            </p>
                          </div>
                          {palmaresEntries.length > 0 ? (
                            <div>
                              <p className="text-sm uppercase tracking-wide mb-2">{t("club.wofPalmares")}</p>
                              <div className="space-y-3">
                                {palmaresEntries.map((entry) => entry && (
                                  <div key={`${member.id}-${entry.functionLabel}`}>
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{entry.functionLabel}</p>
                                    <p className="text-base whitespace-pre-line text-foreground leading-relaxed">{entry.value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                          <div>
                            <p className="text-sm uppercase tracking-wide mb-1">{t("club.wofMemberSince")}</p>
                            <p className="text-base text-foreground">{member.memberSince}</p>
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                    );
                  })()}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto rounded-xl border border-border/70 bg-muted/20 px-6 py-8 text-center text-muted-foreground">
              {t("club.wofEmpty")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
