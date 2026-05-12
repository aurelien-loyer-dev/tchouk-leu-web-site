import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { StellarGallery } from "../components/ui/stellar-gallery";
import { StellarGalleryFallback } from "../components/ui/stellar-gallery-fallback";
import { useTranslation } from "react-i18next";

class GalleryErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Gallery Error:", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function GalleryPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    { id: "all", label: t("gallery.all") },
    { id: "matches", label: t("gallery.matches") },
    { id: "training", label: t("gallery.trainings") },
    { id: "events", label: t("gallery.events") },
  ];

  useEffect(() => {
    loadGalleryPhotos()
      .then((photos) => { setGalleryImages(photos); setErrorMessage(""); })
      .catch((error) => {
        setGalleryImages([]);
        setErrorMessage(error instanceof Error ? error.message : "Impossible de charger la galerie.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredImages = selectedCategory === "all"
    ? galleryImages
    : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-28 pb-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1a26] to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-[#5B7D95]/10 blur-3xl rounded-full" />
        <div className="max-w-5xl mx-auto relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B7D95] mb-3">Photos</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-foreground">
              {t("gallery.title")}
            </h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">{t("gallery.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-white/[0.06]" />

      {/* Filters */}
      <section className="py-4 px-6 bg-background sticky top-14 z-40 border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#5B7D95] text-white shadow-lg shadow-[#5B7D95]/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery */}
      {isLoading ? (
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg bg-white/5" />
            ))}
          </div>
        </section>
      ) : filteredImages.length === 0 ? (
        <section className="py-24 px-6 text-center">
          {errorMessage
            ? <p className="text-red-400">{errorMessage}</p>
            : <p className="text-slate-500">{t("gallery.empty")}</p>
          }
        </section>
      ) : (
        <GalleryErrorBoundary
          fallback={<StellarGalleryFallback photos={filteredImages} />}
          onError={(error) => {
            console.error("StellarGallery R3F failed, using fallback:", error);
          }}
        >
          <StellarGallery photos={filteredImages} />
        </GalleryErrorBoundary>
      )}
    </div>
  );
}
