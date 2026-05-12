import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

/* Gallery Context */
interface GalleryContextType {
  selectedPhoto: GalleryPhoto | null;
  setSelectedPhoto: (photo: GalleryPhoto | null) => void;
  allPhotos: GalleryPhoto[];
}

const GalleryContext = React.createContext<GalleryContextType | undefined>(undefined);

function useGalleryContext() {
  const ctx = React.useContext(GalleryContext);
  if (!ctx) throw new Error("useGalleryContext must be within GalleryPage");
  return ctx;
}

/* Gallery Item Component */
function GalleryItem({ photo, index }: { photo: GalleryPhoto; index: number }) {
  const { setSelectedPhoto } = useGalleryContext();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => setSelectedPhoto(photo)}
      className="relative group overflow-hidden rounded-lg aspect-[4/3] cursor-pointer"
    >
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
        <p className="text-white text-xs font-medium line-clamp-2">{photo.alt}</p>
      </div>
    </motion.button>
  );
}

/* Gallery Modal */
function GalleryModal() {
  const { selectedPhoto, setSelectedPhoto, allPhotos } = useGalleryContext();

  if (!selectedPhoto) return null;

  const currentIndex = allPhotos.findIndex((p) => p.id === selectedPhoto.id);
  const fileName = (selectedPhoto.alt || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + ".jpg";

  const handlePrev = () => {
    if (currentIndex > 0) setSelectedPhoto(allPhotos[currentIndex - 1]);
  };

  const handleNext = () => {
    if (currentIndex < allPhotos.length - 1) setSelectedPhoto(allPhotos[currentIndex + 1]);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        onClick={() => setSelectedPhoto(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="bg-[#0d1520] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
            <div className="relative w-full bg-black" style={{ aspectRatio: "4/3" }}>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{selectedPhoto.alt}</h3>
                <p className="text-sm text-slate-400">{selectedPhoto.category}</p>
              </div>

              <div className="flex gap-3">
                <a
                  href={selectedPhoto.src}
                  download={fileName}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5B7D95] hover:bg-[#4E6C83] text-white text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </a>

                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-3 py-2.5 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === allPhotos.length - 1}
                  className="px-3 py-2.5 rounded-lg border border-white/[0.06] hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* Main GalleryPage Component */
export function GalleryPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  const categories = [
    { id: "all", label: t("gallery.all") },
    { id: "matches", label: t("gallery.matches") },
    { id: "training", label: t("gallery.trainings") },
    { id: "events", label: t("gallery.events") },
  ];

  useEffect(() => {
    loadGalleryPhotos()
      .then((photos) => {
        setGalleryImages(photos);
        setErrorMessage("");
      })
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
    <GalleryContext.Provider value={{ selectedPhoto, setSelectedPhoto, allPhotos: filteredImages }}>
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
          <section className="py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredImages.map((photo, i) => (
                  <GalleryItem key={photo.id} photo={photo} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        <GalleryModal />
      </div>
    </GalleryContext.Provider>
  );
}