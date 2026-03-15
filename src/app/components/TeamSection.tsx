import { motion } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function TeamSection() {
  const teamMembers = [
    {
      name: "Marie Lebon",
      role: "Entraîneuse",
      image: "https://images.unsplash.com/photo-1705008199869-2e0bf9c6f3e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb2FjaCUyMHRlYW0lMjBhdGhsZXRlfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Lucas Payet",
      role: "Joueur",
      image: "https://images.unsplash.com/photo-1759787851041-0d45d2b2db84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3BvcnRzJTIwaW5kb29yJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczNTU3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Sophie Grondin",
      role: "Joueuse",
      image: "https://images.unsplash.com/photo-1765187948029-016dc0bd1804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZvbGxleWJhbGwlMjBwbGF5ZXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NzM1NTc5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
    {
      name: "Alexandre Turpin",
      role: "Joueur",
      image: "https://images.unsplash.com/photo-1739675176333-82ddf9790226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBoYW5kYmFsbCUyMHRyYWluaW5nJTIwc3BvcnRzfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Notre équipe</h2>
          <p className="text-xl text-muted-foreground">
            Rencontrez les passionnés qui font vivre TchoukLeu
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-[#4C93C3]">
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-6 text-center -mt-20 relative z-10">
                  <div className="bg-white dark:bg-card rounded-xl p-4 shadow-lg">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#4C93C3] font-medium">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
