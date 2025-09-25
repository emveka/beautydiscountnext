// components/client/ProductGallery.tsx - VERSION OPTIMISÉE FIREBASE TEMPS RÉEL
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Icônes SVG intégrées
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
 * 🔥 FONCTION OPTIMISÉE POUR FIREBASE STORAGE
 * Priorité absolue aux URLs Firebase complètes
 */
function processFirebaseImages(images: string[], imagePaths: string[]): string[] {
  console.log('🖼️ [ProductGallery] Traitement des images:', {
    imagesCount: images?.length || 0,
    imagePathsCount: imagePaths?.length || 0,
    firstImage: images?.[0]?.substring(0, 50) + '...',
  });

  const processedImages: string[] = [];
  
  // 1. PRIORITÉ ABSOLUE : URLs complètes Firebase Storage
  if (images && Array.isArray(images)) {
    images.forEach(imageUrl => {
      if (imageUrl && 
          typeof imageUrl === 'string' && 
          imageUrl.trim() && 
          imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
        
        const cleanUrl = imageUrl.trim();
        if (!processedImages.includes(cleanUrl)) {
          processedImages.push(cleanUrl);
          console.log('✅ [ProductGallery] Image Firebase ajoutée:', cleanUrl.substring(0, 50) + '...');
        }
      }
    });
  }
  
  // 2. Autres URLs complètes (backup)
  if (processedImages.length === 0 && images && Array.isArray(images)) {
    images.forEach(imageUrl => {
      if (imageUrl && 
          typeof imageUrl === 'string' && 
          imageUrl.trim() && 
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
        
        const cleanUrl = imageUrl.trim();
        if (!processedImages.includes(cleanUrl)) {
          processedImages.push(cleanUrl);
          console.log('⚠️ [ProductGallery] Image externe ajoutée:', cleanUrl.substring(0, 50) + '...');
        }
      }
    });
  }
  
  // 3. Chemins relatifs (dernier recours)
  if (processedImages.length === 0 && imagePaths && Array.isArray(imagePaths)) {
    imagePaths.forEach(imagePath => {
      if (imagePath && 
          typeof imagePath === 'string' && 
          imagePath.trim()) {
        const cleanPath = imagePath.trim();
        const fullPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        processedImages.push(fullPath);
        console.log('⚠️ [ProductGallery] Chemin relatif ajouté:', fullPath);
      }
    });
  }
  
  // 4. Placeholder si aucune image valide
  if (processedImages.length === 0) {
    const placeholderUrl = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&crop=center';
    processedImages.push(placeholderUrl);
    console.log('🔄 [ProductGallery] Placeholder ajouté');
  }
  
  console.log('🎯 [ProductGallery] Images finales:', {
    count: processedImages.length,
    urls: processedImages.map(url => url.substring(0, 50) + '...')
  });
  
  return [...new Set(processedImages)]; // Supprimer doublons
}

/**
 * 🎯 PRODUCT GALLERY OPTIMISÉ TEMPS RÉEL
 * 
 * NOUVELLES FONCTIONNALITÉS :
 * ✅ Réinitialisation automatique lors changement d'images
 * ✅ Gestion d'erreurs Firebase robuste
 * ✅ Logs détaillés pour debug
 * ✅ Optimisations Next.js Image
 * ✅ Priorité Firebase Storage
 */
export default function ProductGallery({ 
  images, 
  imagePaths, 
  productName, 
  priority = false 
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  // Traitement intelligent des images Firebase
  const displayImages = processFirebaseImages(images || [], imagePaths || []);
  
  // 🔥 RÉINITIALISATION LORS DU CHANGEMENT D'IMAGES
  useEffect(() => {
    // Reset de l'index actif si les images changent
    if (activeIndex >= displayImages.length) {
      setActiveIndex(0);
      console.log('🔄 [ProductGallery] Index réinitialisé après changement d\'images');
    }
    
    // Reset des erreurs d'images
    setImageErrors(new Set());
    
    // Fermer le zoom si ouvert
    if (isZoomed) {
      setIsZoomed(false);
    }
    
  }, [images, imagePaths, displayImages.length]);
  
  // Navigation vers l'image suivante
  const nextImage = () => {
    setActiveIndex((prev) => {
      const newIndex = (prev + 1) % displayImages.length;
      console.log('➡️ [ProductGallery] Navigation suivante:', newIndex);
      return newIndex;
    });
  };
  
  // Navigation vers l'image précédente
  const prevImage = () => {
    setActiveIndex((prev) => {
      const newIndex = (prev - 1 + displayImages.length) % displayImages.length;
      console.log('⬅️ [ProductGallery] Navigation précédente:', newIndex);
      return newIndex;
    });
  };
  
  // Aller directement à une image
  const goToImage = (index: number) => {
    if (index >= 0 && index < displayImages.length) {
      setActiveIndex(index);
      console.log('🎯 [ProductGallery] Navigation directe vers:', index);
    }
  };
  
  // Gestion des erreurs d'images avec retry
  const handleImageError = (imageIndex: number) => {
    console.error('❌ [ProductGallery] Erreur image index:', imageIndex, displayImages[imageIndex]);
    
    setImageErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.add(imageIndex);
      return newErrors;
    });
  };
  
  // Vérifier si une image a une erreur
  const hasImageError = (index: number) => imageErrors.has(index);
  
  // Obtenir l'URL de fallback
  const getFallbackUrl = () => {
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop&crop=center';
  };
  
  // Gestion des touches clavier dans le modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Escape') {
      setIsZoomed(false);
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  };
  
  const currentImage = displayImages[activeIndex];
  const currentImageHasError = hasImageError(activeIndex);
  const finalCurrentImage = currentImageHasError ? getFallbackUrl() : currentImage;
  
  return (
    <div className="space-y-4">
      {/* 🎯 IMAGE PRINCIPALE OPTIMISÉE */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <Image
          src={finalCurrentImage}
          alt={`${productName} - Image ${activeIndex + 1}`}
          fill
          priority={priority && activeIndex === 0}
          quality={85}
          className={`object-cover transition-all duration-300 ${
            currentImageHasError ? 'opacity-75' : 'group-hover:scale-105'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onError={() => handleImageError(activeIndex)}
          key={`main-${activeIndex}-${displayImages.length}`} // Force reload on change
        />
        
        {/* Badge erreur image */}
        {currentImageHasError && (
          <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-2 py-1 rounded-md text-xs font-medium">
            Image de remplacement
          </div>
        )}
        
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
        
        {/* 🔥 INDICATEUR DE DERNIÈRE MISE À JOUR (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute bottom-4 right-4 bg-green-600/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100">
            Images: {displayImages.length}
          </div>
        )}
      </div>
      
      {/* 🎯 MINIATURES OPTIMISÉES */}
      {displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((image, index) => {
            const thumbnailHasError = hasImageError(index);
            const finalThumbnailImage = thumbnailHasError ? getFallbackUrl() : image;
            
            return (
              <button
                key={`thumb-${index}-${image}`}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                  index === activeIndex 
                    ? 'border-rose-500 ring-2 ring-rose-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`Voir l'image ${index + 1}`}
              >
                <Image
                  src={finalThumbnailImage}
                  alt={`${productName} - Miniature ${index + 1}`}
                  width={80}
                  height={80}
                  quality={75}
                  className={`w-full h-full object-cover ${
                    thumbnailHasError ? 'opacity-75' : ''
                  }`}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  onError={() => handleImageError(index)}
                />
                
                {/* Badge erreur miniature */}
                {thumbnailHasError && (
                  <div className="absolute inset-0 bg-yellow-100/80 flex items-center justify-center">
                    <span className="text-yellow-600 text-xs">!</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {/* 🎯 MODAL ZOOM OPTIMISÉ */}
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
          <div className="relative max-w-5xl max-h-full" onClick={e => e.stopPropagation()}>
            <Image
              src={finalCurrentImage}
              alt={`${productName} - Vue agrandie`}
              width={1200}
              height={1200}
              quality={90}
              className="max-w-full max-h-full object-contain"
              priority
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              key={`modal-${activeIndex}-${finalCurrentImage}`}
            />
            
            {/* Badge erreur dans modal */}
            {currentImageHasError && (
              <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium">
                ⚠️ Image de remplacement utilisée
              </div>
            )}
            
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