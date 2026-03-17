import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

function toDownloadFileName(image: GalleryPhoto) {
  const normalizedBaseName = (image.alt || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${normalizedBaseName || "photo"}.jpg`;
}

export function GalleryPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);

  const categories = [
    { id: "all", label: t("gallery.all") },
    { id: "matches", label: t("gallery.matches") },
    { id: "training", label: t("gallery.trainings") },
    { id: "events", label: t("gallery.events") },
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
            <h1 className="text-6xl font-bold mb-6">{t("gallery.title")}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("gallery.subtitle")}
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
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative overflow-hidden rounded-xl group cursor-pointer aspect-square"
                onClick={() => setSelectedImage(image)}
              >
                <ImageWithFallback
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              {isLoading ? (
                <p className="text-xl text-muted-foreground">{t("gallery.loading")}</p>
              ) : errorMessage ? (
                <p className="text-xl text-red-600">{errorMessage}</p>
              ) : (
                <p className="text-xl text-muted-foreground">{t("gallery.empty")}</p>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={Boolean(selectedImage)} onOpenChange={(isOpen) => (!isOpen ? setSelectedImage(null) : null)}>
        <DialogContent className="max-w-5xl p-3 sm:p-4">
          <DialogTitle className="sr-only">{t("gallery.photoPreview")}</DialogTitle>
          {selectedImage ? (
            <div className="space-y-3">
              <div className="max-h-[75vh] overflow-hidden rounded-md bg-black/5 flex items-center justify-center">
                <ImageWithFallback
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-h-[75vh] w-auto max-w-full object-contain"
                />
              </div>
              <div className="flex justify-end">
                <Button asChild className="bg-[#4C93C3] text-white hover:bg-[#3a7ba8]">
                  <a href={selectedImage.src} download={toDownloadFileName(selectedImage)}>
                    <Download className="h-4 w-4" />
                    {t("gallery.download")}
                    Télécharger
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
