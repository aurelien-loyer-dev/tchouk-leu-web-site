import { motion } from "motion/react";
import { Trophy, Users, Heart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadWallOfFameMembers, type WallOfFameMember } from "../data/wallOfFame";

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
      title: "Fair-play",
      description: "Le respect des règles et des adversaires au cœur de notre pratique",
    },
    {
      icon: Users,
      title: "Esprit d'équipe",
      description: "La cohésion et l'entraide sont nos forces principales",
    },
    {
      icon: Target,
      title: "Performance",
      description: "Progresser ensemble tout en gardant le plaisir du jeu",
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
            <h1 className="text-6xl font-bold mb-6">Le Tchouk'Leu</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Depuis 2014, Tchouk'Leu est le club de tchoukball de référence à la Réunion, 
              alliant passion sportive et esprit insulaire.
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
            <h2 className="text-5xl font-bold mb-12 text-center">Notre histoire</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Tchouk'Leu est né en 2014 de la volonté d'un groupe de passionnés de tchoukball, 
                un sport encore peu connu à la Réunion. Inspirés par les valeurs de fair-play et 
                de respect qui caractérisent ce sport, ils ont décidé de créer un club à Saint-Leu.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Au fil des années, le club a su grandir et se développer, attirant des joueurs de 
                tous niveaux et de tous âges. Aujourd'hui, Tchouk'Leu compte plusieurs dizaines de 
                licenciés et participe activement aux compétitions régionales et interrégionales.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Notre club se distingue par son ambiance conviviale, son engagement envers la 
                formation des jeunes et son attachement aux valeurs sportives et humaines.
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
            <h2 className="text-5xl font-bold mb-4">Nos valeurs</h2>
            <p className="text-xl text-muted-foreground">
              Les principes qui guident notre club au quotidien
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
            <h2 className="text-5xl font-bold mb-4">Wall of Fame</h2>
            <p className="text-xl text-muted-foreground">
              Les personnes mises à l'honneur par le club
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
                            <p className="text-sm uppercase tracking-wide mb-1">Fonctions</p>
                            <p className="text-base text-foreground">
                              {member.functions.map((value) => wallFunctionLabelByValue[value] ?? value).join(" • ")}
                            </p>
                          </div>
                          {palmaresEntries.length > 0 ? (
                            <div>
                              <p className="text-sm uppercase tracking-wide mb-2">Palmarès</p>
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
                            <p className="text-sm uppercase tracking-wide mb-1">Adhérent depuis</p>
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
              Aucun profil Wall of Fame pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
