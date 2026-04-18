import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export function Gallery() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGalleryPhotos()
      .then((all) => setPhotos(all.slice(0, 6)))
      .catch(() => setPhotos([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && photos.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-muted/20 dark:bg-muted/5 border-t border-border/40">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-2">{t("gallery.title")}</h2>
          <p className="text-muted-foreground">{t("gallery.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            : photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="relative overflow-hidden rounded-xl group aspect-square"
                >
                  <ImageWithFallback
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button asChild variant="outline" className="border-[#5B7D95] text-[#5B7D95] hover:bg-[#5B7D95]/10">
            <Link to="/galerie">{t("gallery.title")} →</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
