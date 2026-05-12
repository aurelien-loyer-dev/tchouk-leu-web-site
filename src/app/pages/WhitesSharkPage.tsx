import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { loadWhiteSharksData, type WhiteSharksPalmaresEntry, type WhiteSharksPlayer } from "../data/whiteSharks";
import { useTranslation } from "react-i18next";

export function WhitesSharkPage() {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language ?? "fr").split("-")[0] as "fr" | "en" | "zh";

  const getTranslatedPosition = (position: string) => {
    const directKey = `whiteSharks.positions.${position.trim()}`;
    if (i18n.exists(directKey)) return t(directKey);
    const normalized = position.trim().toLowerCase();
    const compact = normalized.replace(/[\s/-]+/g, "");
    const aliasesByCompact: Record<string, string> = {
      ailierdroit: "ailierDroit", ailiergauche: "ailierGauche",
      centrecadre: "centreCadre", ailiercentrecadre: "centreCadre", milieu: "milieu",
    };
    const key = `whiteSharks.positions.${aliasesByCompact[compact] ?? normalized}`;
    return i18n.exists(key) ? t(key) : position;
  };

  const getPlayerPositions = (player: WhiteSharksPlayer) =>
    Array.isArray(player.positions) && player.positions.length > 0 ? player.positions : player.position ? [player.position] : [];

  const getLocalizedText = (base: string, translations?: Partial<Record<"en" | "zh", string>>) => {
    if (currentLang === "en" && translations?.en?.trim()) return translations.en;
    if (currentLang === "zh" && translations?.zh?.trim()) return translations.zh;
    return base;
  };

  const sections: Array<{ key: string; title: string; memberTypes: WhiteSharksPlayer["memberType"][] }> = [
    { key: "coach", title: t("whiteSharks.coaches"), memberTypes: ["coach"] },
    { key: "benevole", title: t("whiteSharks.volunteers"), memberTypes: ["benevole"] },
    { key: "joueur", title: t("whiteSharks.players"), memberTypes: ["capitaine", "joueur"] },
  ];

  const [palmares, setPalmares] = useState<WhiteSharksPalmaresEntry[]>([]);
  const [players, setPlayers] = useState<WhiteSharksPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWhiteSharksData()
      .then((data) => { setPalmares(data.palmares); setPlayers(data.players); })
      .catch(() => { setPalmares([]); setPlayers([]); })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-violet-600/10 blur-3xl rounded-full" />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <img
              src="/images/WhiteSharksLogo.png"
              alt="White Sharks"
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">White Sharks</h1>
            <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t("whiteSharks.description")}
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Palmares */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">Palmarès</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("whiteSharks.palmares")}</h2>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />
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
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <Card className="h-full bg-card border-violet-500/10 hover:border-violet-500/25 transition-colors">
                    <CardContent className="p-5">
                      <p className="font-semibold text-foreground leading-snug mb-1.5">
                        {getLocalizedText(entry.title, entry.titleTranslations)}
                      </p>
                      <Badge className="bg-violet-500/15 text-violet-300 border-0 text-xs mb-2">
                        {entry.year}
                      </Badge>
                      {entry.description && (
                        <p className="text-sm text-slate-500 mt-1">
                          {getLocalizedText(entry.description, entry.descriptionTranslations)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">{t("whiteSharks.palmaresEmpty")}</p>
          )}
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Roster */}
      <section className="py-16 px-6 bg-[#0a0f18]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">Équipe</p>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("whiteSharks.roster")}</h2>
          </motion.div>

          {isLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 2 }).map((_, si) => (
                <div key={si} className="space-y-3">
                  <Skeleton className="h-5 w-28 bg-white/5" />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, pi) => (
                      <Skeleton key={pi} className="h-24 rounded-xl bg-white/5" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : players.length > 0 ? (
            <div className="space-y-10">
              {sections.map((section) => {
                const sectionPlayers = players.filter((p) => section.memberTypes.includes(p.memberType));
                if (sectionPlayers.length === 0) return null;
                return (
                  <div key={section.key}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">
                      {section.title}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sectionPlayers.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                        >
                          <Card className="h-full bg-card border-violet-500/10 hover:border-violet-500/25 transition-colors">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground leading-tight">
                                  {player.firstName} {player.lastName}
                                </p>
                                {player.memberType === "capitaine" && (
                                  <Badge className="text-xs px-1.5 py-0 bg-violet-500/20 text-violet-300 border-0">
                                    {t("whiteSharks.captain")}
                                  </Badge>
                                )}
                              </div>
                              {getPlayerPositions(player).length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-violet-400">
                                  <Shield className="h-3 w-3 flex-shrink-0" />
                                  <span>{getPlayerPositions(player).map(getTranslatedPosition).join(" · ")}</span>
                                </div>
                              )}
                              <p className="text-xs text-slate-600">
                                {t("whiteSharks.originClub")} {player.club}
                              </p>
                              {player.birthYear && (
                                <p className="text-xs text-slate-600">{player.birthYear}</p>
                              )}
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
            <p className="text-slate-500">{t("whiteSharks.rosterEmpty")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
