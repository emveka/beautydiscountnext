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
}

/**
 * Fonction pour créer une URL de placeholder
 */
function createPlaceholderUrl(width: number = 600, height: number = 600): string {
  return `/api/placeholder/${width}/${height}`;
}

/**
 * Fonction pour gérer les erreurs d'images
 */
function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement>, 
  imageUrl: string, 
  fallbackWidth: number = 600, 
  fallbackHeight: number = 600
) {
  console.error('Erreur de chargement image:', imageUrl);
  
  const target = e.target as HTMLImageElement;
  const fallbackUrl = createPlaceholderUrl(fallbackWidth, fallbackHeight);
  
  // Éviter les boucles infinies de fallback
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}

/**
 * Fonction pour traiter les URLs d'images Firebase
 * PRIORITÉ : URLs complètes Firebase > Chemins relatifs > Placeholder
 */
function processFirebaseImages(images: string[], imagePaths: string[]): string[] {
  const processedImages: string[] = [];
  
  // 1. PRIORITÉ ABSOLUE : URLs complètes Firebase Storage
  images.forEach(imageUrl => {
    if (imageUrl && 
        typeof imageUrl === 'string' && 
        imageUrl.trim() && 
        imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
      processedImages.push(imageUrl.trim());
    }
  });
  
  // 2. Si pas assez d'URLs complètes, ajouter les autres URLs complètes
  images.forEach(imageUrl => {
    if (imageUrl && 
        typeof imageUrl === 'string' && 
        imageUrl.trim() && 
        (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) &&
        !imageUrl.startsWith('https://firebasestorage.googleapis.com') &&
        !processedImages.includes(imageUrl.trim())) {
      processedImages.push(imageUrl.trim());
    }
  });
  
  // 3. UNIQUEMENT en dernier recours : Ignorer imagePaths car ils ne fonctionnent pas
  // Les imagePaths sont des chemins relatifs qui ne pointent vers aucun serveur d'images
  
  // 4. Si aucune image valide, retourner placeholder
  if (processedImages.length === 0) {
    processedImages.push(createPlaceholderUrl());
  }
  
  // Supprimer les doublons
  return [...new Set(processedImages)];
}

/**
 * Composant ProductGallery - Version CORRIGÉE pour Firebase
 * 
 * Fonctionnalités :
 * ✅ Priorité aux URLs complètes Firebase Storage
 * ✅ Ignore les imagePaths (chemins relatifs non fonctionnels)
 * ✅ Navigation avec flèches gauche/droite
 * ✅ Miniatures cliquables en bas
 * ✅ Modal zoom en plein écran
 * ✅ Responsive mobile/desktop
 * ✅ Gestion d'erreurs robuste
 */
export default function ProductGallery({ 
  images, 
  imagePaths, 
  productName, 
  priority = false 
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Traitement intelligent des images Firebase
  const displayImages = processFirebaseImages(images || [], imagePaths || []);
  
  // Debug pour comprendre ce qui se passe
  console.log('🔍 ProductGallery Debug:', {
    'images (URLs complètes)': images,
    'imagePaths (chemins relatifs - ignorés)': imagePaths,
    'displayImages (résultat final)': displayImages
  });
  
  // Navigation vers l'image suivante
  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };
  
  // Navigation vers l'image précédente
  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };
  
  // Aller directement à une image
  const goToImage = (index: number) => {
    setActiveIndex(index);
  };
  
  // Gérer les touches clavier dans le modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsZoomed(false);
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };
  
  const currentImage = displayImages[activeIndex];
  
  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={currentImage}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          priority={priority && activeIndex === 0}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          onError={(e) => handleImageError(e, currentImage)}
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
        
        {/* Indicateur nombre d'images */}
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
                index === activeIndex 
                  ? 'border-rose-500 ring-2 ring-rose-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} - Miniature ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, image, 80, 80)}
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Modal zoom */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
              className="max-w-full max-h-full object-contain"
              priority
              onError={(e) => handleImageError(e, currentImage, 1000, 1000)}
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