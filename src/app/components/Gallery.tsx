import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Gallery() {
  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1663246544635-118c34cc488b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0Y2hvdWtiYWxsJTIwc3BvcnQlMjBhY3Rpb24lMjBnYW1lfGVufDF8fHx8MTc3MzU1Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Match de tchoukball",
    },
    {
      src: "https://images.unsplash.com/photo-1759787851041-0d45d2b2db84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3BvcnRzJTIwaW5kb29yJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczNTU3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Entraînement",
    },
    {
      src: "https://images.unsplash.com/photo-1772724317499-14aa7ee0d2d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB0ZWFtJTIwY2VsZWJyYXRpb24lMjB0b2dldGhlcnxlbnwxfHx8fDE3NzM1NTc5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Célébration d'équipe",
    },
    {
      src: "https://images.unsplash.com/photo-1739675176333-82ddf9790226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBoYW5kYmFsbCUyMHRyYWluaW5nJTIwc3BvcnRzfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Session en gymnase",
    },
    {
      src: "https://images.unsplash.com/photo-1705008199869-2e0bf9c6f3e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb2FjaCUyMHRlYW0lMjBhdGhsZXRlfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Coaching",
    },
    {
      src: "https://images.unsplash.com/photo-1765187948029-016dc0bd1804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZvbGxleWJhbGwlMjBwbGF5ZXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NzM1NTc5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Entraînement plage",
    },
  ];

  return (
    <section id="galerie" className="py-24 px-6 bg-muted/30 dark:bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4">Galerie</h2>
          <p className="text-xl text-muted-foreground">
            Moments forts de notre club
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl group cursor-pointer"
            >
              <ImageWithFallback
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#4C93C3]/0 group-hover:bg-[#4C93C3]/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
