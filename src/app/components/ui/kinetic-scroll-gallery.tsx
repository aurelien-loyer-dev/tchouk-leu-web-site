import React from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

const fallbackImages = [
  "https://images.pexels.com/photos/1010648/pexels-photo-1010648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2087391/pexels-photo-2087391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/3244513/pexels-photo-3244513.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/8665530/pexels-photo-8665530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/2440061/pexels-photo-2440061.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];

type KineticScrollGalleryProps = {
  images?: string[];
  title?: string;
  description?: string;
};

function KineticGridItem({ image, scrollVelocity }: { image: string; scrollVelocity: MotionValue<number> }) {
  const smoothedVelocity = useSpring(scrollVelocity, {
    mass: 0.1,
    stiffness: 80,
    damping: 40,
  });

  const skew = useTransform(smoothedVelocity, [-1500, 0, 1500], [-15, 0, 15]);

  return (
    <motion.div
      className="relative h-80 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-900"
      style={{ skewX: skew }}
    >
      <img
        src={image}
        alt="Gallery image"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scale(1.15)" }}
        loading="lazy"
      />
    </motion.div>
  );
}

export default function KineticScrollGallery({
  images = fallbackImages,
  title = "Galerie",
  description = "Faites défiler la page pour faire vivre les images.",
}: KineticScrollGalleryProps) {
  const { scrollYProgress } = useScroll();

  const scrollVelocity = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 1000],
    { clamp: false },
  );

  const galleryImages = images.length > 0 ? images : fallbackImages;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-4 text-lg text-neutral-300">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, index) => (
            <KineticGridItem key={`${img}-${index}`} image={img} scrollVelocity={scrollVelocity} />
          ))}
        </div>
      </div>
    </div>
  );
}