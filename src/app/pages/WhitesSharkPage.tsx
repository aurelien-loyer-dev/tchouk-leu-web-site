import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { loadWhiteSharksData, type WhiteSharksPalmaresEntry, type WhiteSharksPlayer } from "../data/whiteSharks";
import { useTranslation } from "react-i18next";

export function WhitesSharkPage() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language ?? "fr").split("-")[0] as "fr" | "en" | "zh";

  const getTranslatedPosition = (position: string) => {
    const directKey = position.trim();
    const directTranslationKey = `whiteSharks.positions.${directKey}`;

    if (i18n.exists(directTranslationKey)) {
      return t(directTranslationKey);
    }

    const normalized = position.trim().toLowerCase();
    const compact = normalized.replace(/[\s/-]+/g, "");
    const aliasesByCompactValue: Record<string, string> = {
      ailierdroit: "ailierDroit",
      ailiergauche: "ailierGauche",
      centrecadre: "centreCadre",
      ailiercentrecadre: "centreCadre",
      milieu: "milieu",
    };
    const normalizedKey = aliasesByCompactValue[compact] ?? normalized;
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

  const getLocalizedPalmaresText = (
    baseText: string,
    translations?: Partial<Record<"en" | "zh", string>>,
  ) => {
    if (currentLang === "en" && translations?.en?.trim()) return translations.en;
    if (currentLang === "zh" && translations?.zh?.trim()) return translations.zh;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeWhiteSharks = async () => {
      try {
        const data = await loadWhiteSharksData();
        setPalmares(data.palmares);
        setPlayers(data.players);
      } catch {
        setPalmares([]);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeWhiteSharks();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-24 pb-14 px-6 bg-gradient-to-b from-violet-200/50 via-violet-50/30 to-background dark:from-violet-950/30 dark:via-background dark:to-background">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/images/WhiteSharksLogo.png"
              alt="Logo White Sharks"
              className="h-16 w-auto mx-auto mb-6 rounded-md"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">White Sharks</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("whiteSharks.description")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Palmares */}
      <section className="py-16 px-6 bg-background border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold tracking-tight">{t("whiteSharks.palmares")}</h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-5 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : palmares.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {palmares.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="h-full border hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                    <CardContent className="p-5 space-y-1.5">
                      <p className="font-semibold leading-snug">
                        {getLocalizedPalmaresText(entry.title, entry.titleTranslations)}
                      </p>
                      <p className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        {entry.year}
                      </p>
                      {entry.description ? (
                        <p className="text-sm text-muted-foreground pt-1">
                          {getLocalizedPalmaresText(entry.description, entry.descriptionTranslations)}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("whiteSharks.palmaresEmpty")}</p>
          )}
        </div>
      </section>

      {/* Roster */}
      <section className="py-16 px-6 bg-background border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h2 className="text-3xl font-bold tracking-tight">{t("whiteSharks.roster")}</h2>
          </motion.div>

          {isLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, si) => (
                <div key={si} className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, pi) => (
                      <Card key={pi} className="border">
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-24" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : players.length > 0 ? (
            <div className="space-y-10">
              {whiteSharksMemberTypeSections.map((section) => {
                const sectionPlayers = players.filter((p) =>
                  section.memberTypes.includes(p.memberType),
                );
                if (sectionPlayers.length === 0) return null;

                return (
                  <div key={section.key}>
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                      {section.title}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sectionPlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.04 }}
                        >
                          <Card className="h-full border hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold leading-tight">
                                  {player.firstName} {player.lastName}
                                </p>
                                {player.memberType === "capitaine" ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-0"
                                  >
                                    {t("whiteSharks.captain")}
                                  </Badge>
                                ) : null}
                              </div>
                              {getPlayerPositions(player).length > 0 ? (
                                <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400">
                                  <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    {getPlayerPositions(player)
                                      .map((pos) => getTranslatedPosition(pos))
                                      .join(" · ")}
                                  </span>
                                </div>
                              ) : null}
                              <p className="text-xs text-muted-foreground">
                                {t("whiteSharks.originClub")} {player.club}
                              </p>
                              {player.birthYear ? (
                                <p className="text-xs text-muted-foreground">{player.birthYear}</p>
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
            <p className="text-muted-foreground">{t("whiteSharks.rosterEmpty")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
