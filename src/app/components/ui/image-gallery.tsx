import React from 'react';
import { cn } from '@/lib/utils';
import { useInView } from 'motion/react';
import { AspectRatio } from './aspect-ratio';
import type { GalleryPhoto } from '../../data/gallery';

interface ImageGalleryProps {
  photos: GalleryPhoto[];
  onPhotoClick?: (photo: GalleryPhoto) => void;
}

export function ImageGallery({ photos, onPhotoClick }: ImageGalleryProps) {
  const columns: GalleryPhoto[][] = [[], [], []];
  photos.forEach((photo, i) => columns[i % 3].push(photo));

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="grid gap-4">
            {col.map((photo) => (
              <AnimatedImage
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                onClick={onPhotoClick ? () => onPhotoClick(photo) : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  className?: string;
  onClick?: () => void;
}

function AnimatedImage({ alt, src, className, onClick }: AnimatedImageProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(wrapperRef, { once: true, margin: "100px" });

  return (
    <div ref={wrapperRef}>
      <AspectRatio
        ratio={4 / 3}
        className={cn(
          'relative size-full overflow-hidden rounded-lg border border-white/[0.06] bg-white/5',
          onClick && 'cursor-pointer group',
          className
        )}
        onClick={onClick}
      >
        <img
          alt={alt}
          src={src}
          className={cn(
            'size-full object-cover transition-opacity duration-700 ease-in-out',
            isInView ? 'opacity-100' : 'opacity-0',
            onClick && 'group-hover:scale-105 transition-transform duration-500'
          )}
          loading="lazy"
          decoding="async"
        />
        {onClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        )}
      </AspectRatio>
    </div>
  );
}
