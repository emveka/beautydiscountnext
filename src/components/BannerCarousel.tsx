"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

// Interface simplifiée pour les slides
interface BannerSlide {
  id: number;
  imageUrl: string;
  imageAlt: string;
}

// Interface pour les props du composant
interface BannerCarouselProps {
  slides?: BannerSlide[];
  autoplayInterval?: number;
  className?: string;
}

/**
 * Données par défaut du carousel - Images uniquement
 */
const defaultSlides: BannerSlide[] = [
  { id: 1, imageUrl: "/sss.png", imageAlt: "Banner 1" },
  { id: 2, imageUrl: "/BannerJ.webp", imageAlt: "Banner 2" },
];

/**
 * Composant BannerCarousel - Carousel d'images responsive avec défilement automatique
 * - Mobile: object-contain (on voit toute l'image en largeur)
 * - ≥ sm   : object-cover   (rendu hero plein écran)
 */
export default function BannerCarousel({
  slides = defaultSlides,
  autoplayInterval = 5000,
  className = "",
}: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Swipe (mobile)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    if (distance > 30) nextSlide();
    if (distance < -30) prevSlide();
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoplayInterval]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Conteneur principal - largeur 100%, hauteurs par breakpoint */}
      <div
        className="
          relative
          h-[200px]     /* Mobile très petit */
          xs:h-[250px]  /* Mobile standard */
          sm:h-[280px]  /* Tablette portrait */
          md:h-[280px]  /* Tablette paysage */
          lg:h-[500px]  /* Desktop */
          xl:h-[600px]  /* Grand écran */
          w-full
          max-w-[1700px]
          mx-auto
        "
      >
        {/* Slides */}
        <div className="relative h-full w-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0"
                  : index < currentSlide
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                draggable={false}
                // 🎯 Mobile: contain (toute l'image visible) | ≥ sm: cover (hero)
                className="object-contain sm:object-cover object-center"
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : undefined}   // ✅ ajout clé
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {/* Flèches */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 active:bg-black/80 text-white rounded-full transition-all duration-200 z-10 touch-manipulation"
          aria-label="Slide précédent"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 active:bg-black/80 text-white rounded-full transition-all duration-200 z-10 touch-manipulation"
          aria-label="Slide suivant"
        >
          <svg className="w-4 h-4 sm:w-6 sm:h-6 mx-auto" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        {/* Indicateurs */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation ${
                  index === currentSlide ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
