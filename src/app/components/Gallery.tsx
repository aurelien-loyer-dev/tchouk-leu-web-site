import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Skeleton } from "./ui/skeleton";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { CircularGallery, type GalleryItem } from "./ui/circular-gallery";

function toGalleryItems(photos: GalleryPhoto[]): GalleryItem[] {
  return photos.map((p) => ({
    common: p.alt || "Photo",
    binomial: "",
    photo: { url: p.src, text: p.alt || "Photo", by: "" },
  }));
}

export function Gallery() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGalleryPhotos()
      .then((all) => setPhotos(all.slice(0, 10)))
      .catch(() => setPhotos([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && photos.length === 0) return null;

  return (
    <section className="py-20 px-6 border-t border-white/[0.06] bg-[#070b12] overflow-hidden">
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
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <Skeleton className="w-full h-[500px] rounded-xl bg-white/5" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full h-[500px]"
          >
            <CircularGallery
              items={toGalleryItems(photos)}
              radius={520}
              autoRotateSpeed={0.025}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex justify-center sm:hidden"
        >
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#5B7D95]/30 text-[#7BAEC8] text-sm font-medium hover:bg-[#5B7D95]/10 transition-colors"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
