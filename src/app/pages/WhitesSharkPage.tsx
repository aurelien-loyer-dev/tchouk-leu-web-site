import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Award, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { loadWhiteSharksData, type WhiteSharksPalmaresEntry, type WhiteSharksPlayer } from "../data/whiteSharks";
import { useTranslation } from "react-i18next";

export function WhitesSharkPage() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language ?? "fr").split("-")[0] as "fr" | "en" | "zh";

  const getTranslatedPosition = (position: string) => {
    const normalized = position.trim().toLowerCase();
    const normalizedKey =
      normalized === "ailier / centre cadre" || normalized === "ailier/centre cadre"
        ? "ailierCentreCadre"
        : normalized;
    const translationKey = `whiteSharks.positions.${normalizedKey}`;

    if (i18n.exists(translationKey)) {
      return t(translationKey);
    }

    return position;
  };

  const getPlayerPositions = (player: WhiteSharksPlayer) => {
    if (Array.isArray(player.positions) && player.positions.length > 0) {
      return player.positions;
    }

    return player.position ? [player.position] : [];
  };

  const getLocalizedPalmaresText = (baseText: string, translations?: Partial<Record<"en" | "zh", string>>) => {
    if (currentLang === "en" && translations?.en?.trim()) {
      return translations.en;
    }

    if (currentLang === "zh" && translations?.zh?.trim()) {
      return translations.zh;
    }

    return baseText;
  };

  const whiteSharksMemberTypeSections: Array<{
    key: string;
    title: string;
    memberTypes: WhiteSharksPlayer["memberType"][];
  }> = [
    { key: "coach", title: t("whiteSharks.coaches"), memberTypes: ["coach"] },
    { key: "benevole", title: t("whiteSharks.volunteers"), memberTypes: ["benevole"] },
    { key: "joueur", title: t("whiteSharks.players"), memberTypes: ["capitaine", "joueur"] },
  ];

  const [palmares, setPalmares] = useState<WhiteSharksPalmaresEntry[]>([]);
  const [players, setPlayers] = useState<WhiteSharksPlayer[]>([]);

  useEffect(() => {
    const initializeWhiteSharks = async () => {
      try {
        const data = await loadWhiteSharksData();
        setPalmares(data.palmares);
        setPlayers(data.players);
      } catch {
        setPalmares([]);
        setPlayers([]);
      }
    };

    void initializeWhiteSharks();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-violet-300/60 via-violet-100/50 to-background dark:from-violet-950/35 dark:via-background dark:to-background text-foreground">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-violet-300 dark:border-violet-400/30 bg-violet-100/60 dark:bg-background/70 p-10 md:p-14 backdrop-blur-sm"
          >
            <img
              src="/images/WhiteSharksLogo.png"
              alt="Logo White Sharks"
              className="h-20 w-auto mx-auto mb-6 rounded-md"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">White Sharks</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("whiteSharks.description")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <Award className="h-12 w-12 mx-auto mb-4 text-violet-600" />
            <h2 className="text-4xl font-bold mb-2">{t("whiteSharks.palmares")}</h2>
          </motion.div>

          {palmares.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {palmares.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="h-full border-violet-200 dark:border-violet-900/40">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">{getLocalizedPalmaresText(entry.title, entry.titleTranslations)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{entry.year}</p>
                    </CardHeader>
                    {entry.description ? (
                      <CardContent className="pb-6">
                        <p className="text-muted-foreground">{getLocalizedPalmaresText(entry.description, entry.descriptionTranslations)}</p>
                      </CardContent>
                    ) : null}
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-6 py-8 text-center text-muted-foreground">
              {t("whiteSharks.palmaresEmpty")}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <Users className="h-12 w-12 mx-auto mb-4 text-violet-600" />
            <h2 className="text-4xl font-bold mb-2">{t("whiteSharks.roster")}</h2>
          </motion.div>

          {players.length > 0 ? (
            <div className="space-y-10">
              {whiteSharksMemberTypeSections.map((section) => {
                const sectionPlayers = players.filter((player) => section.memberTypes.includes(player.memberType));

                if (sectionPlayers.length === 0) {
                  return null;
                }

                return (
                  <div key={section.key} className="space-y-4">
                    <h3 className="text-2xl font-semibold">{section.title}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionPlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                          <Card className={`h-full ${player.memberType === "capitaine" ? "border-2 border-violet-500 bg-violet-50/70 dark:bg-violet-950/20" : ""}`}>
                            <CardContent className="p-6 space-y-3">
                              {player.memberType === "capitaine" ? (
                                <p className="inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                  {t("whiteSharks.captain")}
                                </p>
                              ) : null}
                              <p className="text-xl font-semibold">{player.firstName} {player.lastName}</p>
                              {getPlayerPositions(player).length > 0 ? (
                                <p className="text-sm inline-flex items-center gap-2 text-violet-700 dark:text-violet-300">
                                  <Shield className="h-4 w-4" />
                                  {getPlayerPositions(player).map((position) => getTranslatedPosition(position)).join(" • ")}
                                </p>
                              ) : null}
                              <p className="text-sm text-muted-foreground">{t("whiteSharks.originClub")} {player.club}</p>
                              {player.birthYear ? (
                                <p className="text-sm font-medium text-muted-foreground">{t("whiteSharks.bornIn")} {player.birthYear}</p>
                              ) : null}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-muted/20 px-6 py-8 text-center text-muted-foreground">
              {t("whiteSharks.rosterEmpty")}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}