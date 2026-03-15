import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function TrainingSection() {
  const trainingCards = [
    {
      icon: Calendar,
      title: "Séances d'entraînement",
      content: [
        "Lundi – 18h00 à 20h00",
        "Mercredi – 18h00 à 20h00",
        "Samedi – 10h00 à 12h00",
      ],
    },
    {
      icon: MapPin,
      title: "Lieu",
      content: ["Gymnase de Saint-Leu"],
    },
    {
      icon: Users,
      title: "Public",
      content: ["Débutants bienvenus", "Tous niveaux acceptés"],
    },
  ];

  return (
    <section id="entrainements" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Entraînements</h2>
          <p className="text-xl text-muted-foreground">
            Rejoignez-nous pour des sessions dynamiques et conviviales
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {trainingCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full border-2 hover:border-[#4C93C3] transition-all duration-300 hover:shadow-xl bg-card dark:bg-card">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[#BFE6FF] dark:bg-[#4C93C3]/20 rounded-lg">
                      <card.icon className="h-8 w-8 text-[#4C93C3]" />
                    </div>
                    <CardTitle className="text-2xl">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {card.content.map((item, i) => (
                      <li key={i} className="text-lg text-muted-foreground flex items-start gap-2">
                        <span className="text-[#4C93C3] mt-1.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
