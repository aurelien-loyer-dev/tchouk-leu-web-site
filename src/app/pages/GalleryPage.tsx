import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { loadGalleryPhotos, type GalleryPhoto, type GalleryCategory } from "../data/gallery";

const FILTERS: Array<{ value: GalleryCategory | "all"; labelKey: string }> = [
  { value: "all", labelKey: "gallery.all" },
  { value: "matches", labelKey: "gallery.matches" },
  { value: "training", labelKey: "gallery.trainings" },
  { value: "events", labelKey: "gallery.events" },
];

async function downloadPhoto(src: string, filename: string) {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.open(src, "_blank");
  }
}

export function GalleryPage() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    loadGalleryPhotos()
      .then((p) => { setPhotos(p); setErrorMessage(""); })
      .catch((e) => { setErrorMessage(e instanceof Error ? e.message : "Impossible de charger la galerie."); })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => i !== null ? Math.min(i + 1, filtered.length - 1) : null);
      if (e.key === "ArrowLeft") setLightbox((i) => i !== null ? Math.max(i - 1, 0) : null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === "all" ? photos : photos.filter((p) => p.category === filter);
  const current = lightbox !== null ? filtered[lightbox] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-10 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a26] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#5B7D95]/10 blur-3xl rounded-full" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">Photos</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">{t("gallery.title")}</h1>
            <p className="text-slate-400">{t("gallery.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Filters */}
      <section className="px-6 py-3 sticky top-14 z-30 bg-background border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {FILTERS.map(({ value, labelKey }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === value
                  ? "bg-[#5B7D95] text-white"
                  : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
          {!isLoading && filtered.length > 0 && (
            <span className="ml-auto text-xs text-slate-600 self-center">{filtered.length} photo{filtered.length > 1 ? "s" : ""}</span>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-xl bg-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-slate-500">{errorMessage || t("gallery.empty")}</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {filtered.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25) }}
                  className="break-inside-avoid group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer"
                  onClick={() => setLightbox(index)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
                    {photo.albumTitle && (
                      <span className="text-xs text-white/80 font-medium truncate">{photo.albumTitle}</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); void downloadPhoto(photo.src, photo.alt || `photo-${photo.id}`); }}
                      className="ml-auto flex-shrink-0 p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-white transition-colors"
                      aria-label={t("gallery.download")}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {current && lightbox !== null && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Controls */}
            <button
              type="button"
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={() => setLightbox(null)}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute top-4 right-16 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); void downloadPhoto(current.src, current.alt || `photo-${current.id}`); }}
              aria-label={t("gallery.download")}
            >
              <Download className="h-5 w-5" />
            </button>

            {lightbox > 0 && (
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {lightbox < filtered.length - 1 && (
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                aria-label="Suivant"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            <motion.img
              key={current.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              src={current.src}
              alt={current.alt}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40">
              {lightbox + 1} / {filtered.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
