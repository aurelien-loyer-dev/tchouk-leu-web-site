import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadGalleryPhotos, type GalleryPhoto } from "../data/gallery";
import KineticScrollGallery from "../components/ui/kinetic-scroll-gallery";
import { Skeleton } from "../components/ui/skeleton";

export function GalleryPage() {
  const { t } = useTranslation();
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  const gallerySources = galleryImages.map((photo) => photo.src);

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <section className="min-h-screen px-6 py-24 flex items-center justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-lg bg-white/5" />
            ))}
          </div>
        </section>
      ) : gallerySources.length === 0 ? (
        <section className="py-24 px-6 text-center">
          <p className="text-slate-500">{errorMessage || t("gallery.empty")}</p>
        </section>
      ) : (
        <KineticScrollGallery images={gallerySources} title={t("gallery.title")} description={t("gallery.subtitle")} />
      )}
    </div>
  );
}