"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

interface BannerSlide {
  id: number;
  imageUrl: string;
  imageAlt: string;
}

interface BannerCarouselProps {
  slides?: BannerSlide[];
  autoplayInterval?: number;
  className?: string;
}

const defaultSlides: BannerSlide[] = [
  { id: 1, imageUrl: "/sss.png", imageAlt: "Banner 1" },
  { id: 2, imageUrl: "/BannerJ.webp", imageAlt: "Banner 2" },
];

export default function BannerCarousel({
  slides = defaultSlides,
  autoplayInterval = 5000,
  className = "",
}: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);

  // Autoplay: uniquement côté client car useEffect n’exécute pas côté serveur
  useEffect(() => {
    if (!autoplayInterval) return;
    const id = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(id);
  }, [nextSlide, autoplayInterval]);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      // Optionnel si tu reintroduis un rendu différent SSR/CSR :
      // suppressHydrationWarning
      onTouchStart={(e) => (touchStart = e.targetTouches[0].clientX)}
      onTouchMove={(e) => (touchEnd = e.targetTouches[0].clientX)}
      onTouchEnd={() => {
        if (touchStart == null || touchEnd == null) return;
        const distance = touchStart - touchEnd;
        if (distance > 30) nextSlide();
        if (distance < -30) prevSlide();
        touchStart = null;
        touchEnd = null;
      }}
    >
      <div className="
        relative
        h-[200px]
        sm:h-[280px]
        md:h-[280px]
        lg:h-[500px]
        xl:h-[600px]
        w-full
        max-w-[1499px]
        mx-auto
      ">
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
                className="object-contain sm:object-cover object-center"
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : undefined}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          ))}
        </div>

        {/* Flèches */}
        <button
          onClick={prevSlide}
          className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/30 hover:bg-black/60 active:bg-black/80 text-white rounded-full transition-all duration-200 z-10 touch-manipulation flex items-center justify-center border border-white/20 backdrop-blur-sm"
          aria-label="Slide précédent"
        >
          <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 bg-black/30 hover:bg-black/60 active:bg-black/80 text-white rounded-full transition-all duration-200 z-10 touch-manipulation flex items-center justify-center border border-white/20 backdrop-blur-sm"
          aria-label="Slide suivant"
        >
          <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        {/* Indicateurs */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation border border-white/20 ${
                  index === currentSlide ? "bg-white scale-125 shadow-lg" : "bg-white/40 hover:bg-white/70 active:bg-white/80"
                }`}
                aria-label={`Aller au slide ${index + 1}`}
                style={{ minWidth: "12px", minHeight: "12px" }}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none sm:hidden" />
      </div>
    </div>
  );
}

// Variables swipe (scopées module plutôt qu'état pour éviter re-renders)
let touchStart: number | null = null;
let touchEnd: number | null = null;
