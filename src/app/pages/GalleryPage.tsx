import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "Tout" },
    { id: "matches", label: "Matchs" },
    { id: "training", label: "Entraînements" },
    { id: "events", label: "Événements" },
  ];

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1663246544635-118c34cc488b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0Y2hvdWtiYWxsJTIwc3BvcnQlMjBhY3Rpb24lMjBnYW1lfGVufDF8fHx8MTc3MzU1Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Match de tchoukball",
      category: "matches",
    },
    {
      src: "https://images.unsplash.com/photo-1759787851041-0d45d2b2db84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3BvcnRzJTIwaW5kb29yJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczNTU3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Entraînement en salle",
      category: "training",
    },
    {
      src: "https://images.unsplash.com/photo-1772724317499-14aa7ee0d2d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB0ZWFtJTIwY2VsZWJyYXRpb24lMjB0b2dldGhlcnxlbnwxfHx8fDE3NzM1NTc5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Célébration d'équipe",
      category: "events",
    },
    {
      src: "https://images.unsplash.com/photo-1739675176333-82ddf9790226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBoYW5kYmFsbCUyMHRyYWluaW5nJTIwc3BvcnRzfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Session en gymnase",
      category: "training",
    },
    {
      src: "https://images.unsplash.com/photo-1705008199869-2e0bf9c6f3e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjb2FjaCUyMHRlYW0lMjBhdGhsZXRlfGVufDF8fHx8MTc3MzU1Nzk0OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Coaching",
      category: "training",
    },
    {
      src: "https://images.unsplash.com/photo-1765187948029-016dc0bd1804?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHZvbGxleWJhbGwlMjBwbGF5ZXIlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NzM1NTc5NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Entraînement plage",
      category: "events",
    },
    {
      src: "https://images.unsplash.com/photo-1663246544635-118c34cc488b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0Y2hvdWtiYWxsJTIwc3BvcnQlMjBhY3Rpb24lMjBnYW1lfGVufDF8fHx8MTc3MzU1Nzk0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Action de jeu",
      category: "matches",
    },
    {
      src: "https://images.unsplash.com/photo-1759787851041-0d45d2b2db84?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3BvcnRzJTIwaW5kb29yJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzczNTU3OTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Équipe au complet",
      category: "events",
    },
    {
      src: "https://images.unsplash.com/photo-1772724317499-14aa7ee0d2d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB0ZWFtJTIwY2VsZWJyYXRpb24lMjB0b2dldGhlcnxlbnwxfHx8fDE3NzM1NTc5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Moment de célébration",
      category: "matches",
    },
  ];

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#DDF4FF] to-background dark:from-[#1a3a4a] dark:to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-6">Galerie</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revivez les moments forts de notre club à travers nos photos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6 bg-background sticky top-20 z-40 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-4 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-[#4C93C3] text-white"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer aspect-square"
              >
                <ImageWithFallback
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-lg">{image.alt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                Aucune photo dans cette catégorie pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
