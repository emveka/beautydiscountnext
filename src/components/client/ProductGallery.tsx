// components/client/ProductGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

// Icônes SVG simples intégrées pour éviter les dépendances
const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ZoomIn = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface ProductGalleryProps {
  images: string[];
  imagePaths: string[];
  productName: string;
  priority?: boolean;
  /** Change cette valeur lorsque le produit est modifié (ex: updatedAt.getTime()). */
  cacheKey?: string | number;
}

/** Placeholder local pour éviter les 404 et garder un layout stable */
function createPlaceholderUrl(width: number = 600, height: number = 600): string {
  return `/api/placeholder/${width}/${height}`;
}

/**
 * Traite les URLs d'images avec priorité:
 * 1) URLs Firebase complètes
 * 2) Autres URLs absolues
 * 3) Chemins relatifs (imagePaths)
 * + cache-busting via ?v=cacheKey
 */
function processFirebaseImages(
  images: string[],
  imagePaths: string[],
  cacheKey?: string | number
): string[] {
  const addVersion = (url: string) => {
    if (!cacheKey) return url;
    return url.includes('?') ? `${url}&v=${cacheKey}` : `${url}?v=${cacheKey}`;
  };

  const processed: string[] = [];

  // 1) URLs Firebase complètes (priorité absolue)
  images.forEach((url) => {
    if (url?.trim()?.startsWith('https://firebasestorage.googleapis.com')) {
      processed.push(addVersion(url.trim()));
    }
  });

  // 2) Autres URLs absolues
  images.forEach((url) => {
    if (url && /^https?:\/\//.test(url) && !url.startsWith('https://firebasestorage.googleapis.com')) {
      const clean = url.trim();
      if (!processed.includes(clean)) processed.push(addVersion(clean));
    }
  });

  // 3) Fallback: imagePaths
  if (processed.length === 0) {
    imagePaths.forEach((p) => {
      if (p?.trim()) {
        const fullPath = p.startsWith('/') ? p : `/${p}`;
        processed.push(addVersion(fullPath));
      }
    });
  }

  return processed.length ? [...new Set(processed)] : [createPlaceholderUrl()];
}

/**
 * ProductGallery optimisée
 */
export default function ProductGallery({
  images,
  imagePaths,
  productName,
  priority = false,
  cacheKey, // ✅ on récupère la prop
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // ✅ on passe cacheKey à la fonction de traitement
  const displayImages = processFirebaseImages(images || [], imagePaths || [], cacheKey);

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  const goToImage = (index: number) => setActiveIndex(index);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsZoomed(false);
    else if (e.key === 'ArrowLeft') prevImage();
    else if (e.key === 'ArrowRight') nextImage();
  };

  const currentImage = displayImages[activeIndex];
  const isFirebaseUrl = currentImage?.startsWith('https://firebasestorage.googleapis.com');

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={currentImage}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          priority={priority && activeIndex === 0}
          quality={85}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          placeholder="blur"
          // Pour éviter l'optimiseur d'images de Vercel sur Firebase (réduit l'effet de cache)
          unoptimized={isFirebaseUrl}
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />

        {/* Bouton zoom */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Agrandir l'image"
        >
          <ZoomIn className="w-5 h-5 text-gray-700" />
        </button>

        {/* Navigation si plusieurs images */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Indicateur nombre d’images */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Miniatures */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === activeIndex ? 'border-rose-500 ring-2 ring-rose-200' : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                width={80}
                height={80}
                quality={75}
                className="w-full h-full object-cover"
                loading="lazy"
                placeholder="blur"
                unoptimized={image.startsWith('https://firebasestorage.googleapis.com')}
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </button>
          ))}
        </div>
      )}

      {/* Modal zoom */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Image agrandie"
        >
          <div className="relative max-w-5xl max-h-full">
            <Image
              src={currentImage}
              alt={`${productName} - Vue agrandie`}
              width={1000}
              height={1000}
              quality={90}
              className="max-w-full max-h-full object-contain"
              priority
              unoptimized={isFirebaseUrl}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />

            {/* Bouton fermer */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              aria-label="Fermer l'image agrandie"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation dans le modal */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Indicateur dans le modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {activeIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
