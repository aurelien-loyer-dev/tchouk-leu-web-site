import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect, useState } from "react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

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
    <section className="py-24 px-6 border-t border-white/[0.06] bg-[#0a0f18]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-2">Photos</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{t("gallery.title")}</h2>
          </div>
          <Link
            to="/galerie"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-[#7BAEC8] transition-colors"
          >
            {t("gallery.title")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl bg-white/5" />
              ))
            : photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  className="relative overflow-hidden rounded-xl group aspect-square border border-white/[0.05]"
                >
                  <ImageWithFallback
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center sm:hidden"
        >
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#5B7D95]/30 text-[#7BAEC8] text-sm font-medium hover:bg-[#5B7D95]/10 transition-colors"
          >
            {t("gallery.title")} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
