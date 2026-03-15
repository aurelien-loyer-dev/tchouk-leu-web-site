import { motion } from "motion/react";
import { Trophy, Users, Heart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ClubPage() {
  const wallOfFameProfile = {
    fullName: "Lucas Hoareau",
    palmares: "MVP régional 2025 • Capitaine champion interclubs 2024",
    memberSince: "Adhérent depuis 2019",
    photo:
      "https://images.unsplash.com/photo-1566753323558-f4e0952af115?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  };

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
            <h1 className="text-6xl font-bold mb-6">Le Club Tchouk'Leu</h1>
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
              Un exemple de profil mis à l'honneur
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-2 border-[#4C93C3]/20 overflow-hidden">
              <CardContent className="p-0 md:grid md:grid-cols-[240px_1fr]">
                <div className="h-64 md:h-full">
                  <ImageWithFallback
                    src={wallOfFameProfile.photo}
                    alt={`Photo de ${wallOfFameProfile.fullName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <CardTitle className="text-3xl mb-4">{wallOfFameProfile.fullName}</CardTitle>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <p className="text-sm uppercase tracking-wide">Palmarès</p>
                      <p className="text-base text-foreground">{wallOfFameProfile.palmares}</p>
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wide">Ancienneté</p>
                      <p className="text-base text-foreground">{wallOfFameProfile.memberSince}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
