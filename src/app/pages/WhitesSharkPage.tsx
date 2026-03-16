import { motion } from "motion/react";
import { Shield, Users, Calendar, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";

export function WhitesSharkPage() {
  const highlights = [
    {
      icon: Users,
      title: "Section jeunes",
      description: "Un espace pensé pour la progression, le plaisir de jouer et l'esprit d'équipe.",
    },
    {
      icon: Shield,
      title: "Valeurs du tchoukball",
      description: "Respect, fair-play et engagement collectif au cœur de chaque séance.",
    },
    {
      icon: Calendar,
      title: "Suivi des entraînements",
      description: "Les créneaux et activités sont visibles dans le planning du club.",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4C93C3]/30 bg-[#BFE6FF]/50 dark:bg-[#4C93C3]/15 px-4 py-2 mb-6">
              <Trophy className="h-4 w-4 text-[#4C93C3]" />
              <span className="text-sm font-medium">La Réunion • Jeunes</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Whites Shark</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Page dédiée à l'équipe jeunes Whites Shark à La Réunion, avec les informations essentielles
              pour suivre la dynamique du groupe et rejoindre les entraînements.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Card className="h-full border-[#4C93C3]/20">
                <CardHeader>
                  <div className="mb-4 inline-flex rounded-full bg-[#BFE6FF] dark:bg-[#4C93C3]/20 p-3">
                    <item.icon className="h-6 w-6 text-[#4C93C3]" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Suivre ou rejoindre Whites Shark</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Consulte le planning du club pour voir les prochaines séances, puis contacte-nous pour intégrer le groupe jeunes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-[#4C93C3] text-white hover:bg-[#3a7ba8]">
                <Link to="/planning">Voir le planning</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">Nous contacter</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}