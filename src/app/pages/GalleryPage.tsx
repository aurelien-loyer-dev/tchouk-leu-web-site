import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";

export function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    { id: "all", label: "Tout" },
    { id: "matches", label: "Matchs" },
    { id: "training", label: "Entraînements" },
    { id: "events", label: "Événements" },
  ];

  useEffect(() => {
    const initializeGallery = async () => {
      try {
        const photos = await loadGalleryPhotos();
        setGalleryImages(photos);
        setErrorMessage("");
      } catch (error) {
        setGalleryImages([]);

        if (error instanceof Error && error.message) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Impossible de charger la galerie pour le moment.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void initializeGallery();
  }, []);

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

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
                    {image.albumTitle ? <p className="text-white/85 text-sm mt-1">Album: {image.albumTitle}</p> : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              {isLoading ? (
                <p className="text-xl text-muted-foreground">Chargement des photos...</p>
              ) : errorMessage ? (
                <p className="text-xl text-red-600">{errorMessage}</p>
              ) : (
                <p className="text-xl text-muted-foreground">Aucune photo dans cette catégorie pour le moment.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
