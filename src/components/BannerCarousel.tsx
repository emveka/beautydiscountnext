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
 * 📱 MOBILE OPTIMIZED BannerCarousel
 * ✅ Boutons plus petits et repositionnés sur mobile
 * 🎯 Meilleure accessibilité tactile et visuelle
 * 🔧 Indicateurs adaptés aux petits écrans
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
          max-w-[1499px]
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
                fetchPriority={index === 0 ? "high" : undefined}
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {/* 📱 FLÈCHES OPTIMISÉES MOBILE */}
        {/* Flèche gauche */}
        <button
          onClick={prevSlide}
          className="
            absolute 
            left-1 sm:left-4 
            top-1/2 -translate-y-1/2 
            w-6 h-6 sm:w-10 sm:h-10 
            bg-black/30 hover:bg-black/60 active:bg-black/80 
            text-white 
            rounded-full 
            transition-all duration-200 
            z-10 
            touch-manipulation
            flex items-center justify-center
            border border-white/20
            backdrop-blur-sm
          "
          aria-label="Slide précédent"
        >
          <svg 
            className="w-3 h-3 sm:w-5 sm:h-5" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        {/* Flèche droite */}
        <button
          onClick={nextSlide}
          className="
            absolute 
            right-1 sm:right-4 
            top-1/2 -translate-y-1/2 
            w-6 h-6 sm:w-10 sm:h-10 
            bg-black/30 hover:bg-black/60 active:bg-black/80 
            text-white 
            rounded-full 
            transition-all duration-200 
            z-10 
            touch-manipulation
            flex items-center justify-center
            border border-white/20
            backdrop-blur-sm
          "
          aria-label="Slide suivant"
        >
          <svg 
            className="w-3 h-3 sm:w-5 sm:h-5" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        {/* 📱 INDICATEURS OPTIMISÉS MOBILE */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  w-1.5 h-1.5 sm:w-3 sm:h-3 
                  rounded-full 
                  transition-all duration-200 
                  touch-manipulation
                  border border-white/20
                  ${
                    index === currentSlide 
                      ? "bg-white scale-125 shadow-lg" 
                      : "bg-white/40 hover:bg-white/70 active:bg-white/80"
                  }
                `}
                aria-label={`Aller au slide ${index + 1}`}
                style={{
                  minWidth: '12px', // Surface tactile minimum sur mobile
                  minHeight: '12px'
                }}
              />
            ))}
          </div>
        )}

        {/* 📱 OVERLAY MOBILE POUR AMÉLIORER LA VISIBILITÉ */}
        <div className="
          absolute 
          bottom-0 
          left-0 
          right-0 
          h-12 sm:h-16
          bg-gradient-to-t from-black/20 to-transparent 
          pointer-events-none
          sm:hidden
        " />
      </div>
    </div>
  );
}