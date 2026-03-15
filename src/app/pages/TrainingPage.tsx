import { motion } from "motion/react";
import { Calendar, MapPin, Users, User, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function TrainingPage() {
  const categories = [
    {
      icon: User,
      name: "M12 / M15",
      description: "Entraînements adaptés aux jeunes catégories",
      schedule: [
        { day: "Mercredi", time: "14h00 - 17h00", location: "Gymnase de Stella" },
        { day: "Samedi", time: "15h30 - 17h00", location: "Terrain de Beach de Saint-Leu" },
      ],
      color: "#4C93C3",
    },
    {
      icon: UserCheck,
      name: "Seniors (+18 ans)",
      description: "Entraînements compétitifs et perfectionnement",
      schedule: [
        { day: "Mercredi", time: "14h00 - 17h00", location: "Gymnase de Stella" },
        { day: "Samedi", time: "17h00 - 19h00", location: "Terrain de Beach de Saint-Leu" },
      ],
      color: "#1F2A37",
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
            <h1 className="text-6xl font-bold mb-6">Entraînements</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rejoignez-nous pour des sessions adaptées à tous les âges et tous les niveaux
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lieu d'entraînement */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-12 text-center">Où nous trouver</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-[#4C93C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <MapPin className="h-8 w-8 text-[#4C93C3]" />
                    Gymnase de Stella
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg">
                  <div>
                    <p className="font-semibold mb-2">Adresse :</p>
                    <p className="text-muted-foreground">
                      Stella<br />
                      97436 Saint-Leu<br />
                      Île de la Réunion
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Accès :</p>
                    <p className="text-muted-foreground">
                      Parking disponible
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Créneaux :</p>
                    <p className="text-muted-foreground">
                      Mercredi 14h00 - 17h00 (toutes catégories)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#4C93C3]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-3xl">
                    <MapPin className="h-8 w-8 text-[#4C93C3]" />
                    Terrain de Beach de Saint-Leu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg">
                  <div>
                    <p className="font-semibold mb-2">Adresse :</p>
                    <p className="text-muted-foreground">
                      Front de mer de Saint-Leu<br />
                      97436 Saint-Leu<br />
                      Île de la Réunion
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Accès :</p>
                    <p className="text-muted-foreground">
                      Parking à proximité
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Créneaux :</p>
                    <p className="text-muted-foreground">
                      Samedi 15h30 - 17h00 (M12/M15)<br />
                      Samedi 17h00 - 19h00 (Seniors)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 bg-muted/30 dark:bg-muted/10 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-6">Informations pratiques</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-[#4C93C3] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Débutants bienvenus</p>
                    <p className="text-muted-foreground">
                      Séances d'essai gratuites<br />
                      Encadrement adapté à tous les niveaux
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-[#4C93C3] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-1">Contact</p>
                    <p className="text-muted-foreground">
                      Pour plus d'informations, visitez notre page contact
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Catégories d'âge */}
      <section className="py-20 px-6 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">Catégories</h2>
            <p className="text-xl text-muted-foreground">
              Des entraînements adaptés à chaque tranche d'âge
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#4C93C3]">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div 
                        className="p-4 rounded-full"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <category.icon 
                          className="h-12 w-12" 
                          style={{ color: category.color }}
                        />
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-center">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-center">
                      {category.description}
                    </p>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-[#4C93C3]" />
                        <p className="font-semibold">Horaires :</p>
                      </div>
                      <div className="space-y-2">
                        {category.schedule.map((slot, i) => (
                          <div 
                            key={i}
                            className="bg-background dark:bg-card p-3 rounded-lg"
                          >
                            <p className="font-medium">{slot.day}</p>
                            <p className="text-muted-foreground">{slot.time}</p>
                            <p className="text-muted-foreground">{slot.location}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#BFE6FF] dark:bg-[#4C93C3]/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 text-[#1F2A37] dark:text-white">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 text-[#1F2A37]/80 dark:text-white/80">
              Venez essayer gratuitement lors d'une séance d'entraînement !
            </p>
            <p className="text-lg text-[#1F2A37]/80 dark:text-white/80">
              Contactez-nous pour votre première séance et découvrir le tchoukball dans une ambiance conviviale.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
