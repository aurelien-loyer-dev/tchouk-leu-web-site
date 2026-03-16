import { Heart, Shield, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function SpiritSection() {
  const values = [
    { icon: Heart, label: "Fair-play", color: "#4C93C3" },
    { icon: Users, label: "Esprit d'équipe", color: "#4C93C3" },
    { icon: Shield, label: "Respect", color: "#4C93C3" },
    { icon: Zap, label: "Énergie", color: "#4C93C3" },
  ];

  return (
    <section id="club" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6">L'esprit de Tchouk'Leu</h2>
            <p className="text-xl mb-8 text-muted-foreground leading-relaxed">
              Tchouk'Leu est un club de tchoukball basé à Saint-Leu sur l'île de la Réunion.
              Inspiré par l'énergie de l'océan et l'esprit de fair-play, le club rassemble des joueurs
              passionnés par le travail d'équipe et le sport.
            </p>

            {/* Values Grid */}
            <div className="grid grid-cols-2 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-[#DDF4FF]/30 dark:bg-[#4C93C3]/10 border border-[#BFE6FF]/50 dark:border-[#4C93C3]/20"
                >
                  <value.icon className="h-6 w-6 flex-shrink-0" style={{ color: value.color }} />
                  <span className="font-medium">{value.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <ImageWithFallback
                src="images/tchoukleu.jpg"
                alt="Action de tchoukball"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4C93C3]/20 to-transparent dark:from-[#4C93C3]/40" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
