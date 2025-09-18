// components/client/RelatedProducts.tsx - UTILISANT ProductCard
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

interface RelatedProductsProps {
  products: Product[];
  title: string;
  categorySlug?: string;
  currentProductId: string;
}

/**
 * Composant RelatedProducts - VERSION UTILISANT ProductCard
 * 
 * NOUVELLES OPTIMISATIONS :
 * ✅ Utilise le composant ProductCard existant pour la cohérence
 * ✅ Scroll horizontal optimisé pour mobile
 * ✅ Navigation adaptée aux écrans tactiles
 * ✅ Réutilisation du code existant
 * ✅ Design cohérent avec la grille de produits
 */
export default function RelatedProducts({ 
  products, 
  title, 
  categorySlug, 
  currentProductId 
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Filtrer le produit actuel et limiter à 8 produits
  const filteredProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 8);
  
  // Gérer l'état des boutons de navigation
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  // useEffect pour l'état initial
  useEffect(() => {
    if (filteredProducts.length > 0) {
      handleScroll();
    }
  }, [filteredProducts.length]);
  
  // Ne rien afficher si pas de produits
  if (filteredProducts.length === 0) {
    return null;
  }
  
  // Fonction de scroll adaptée mobile/desktop
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    // Scroll amount adaptatif selon l'écran
    const isMobile = window.innerWidth < 640;
    const scrollAmount = isMobile ? 180 : 280; // Adapté à la largeur des ProductCard
    
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* EN-TÊTE AVEC NAVIGATION */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          {title}
        </h3>
        
        {/* BOUTONS DE NAVIGATION - Plus gros sur mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              canScrollLeft 
                ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400' 
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Produits précédents"
          >
            <span className="text-base sm:text-lg leading-none">‹</span>
          </button>
          
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              canScrollRight 
                ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400' 
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Produits suivants"
          >
            <span className="text-base sm:text-lg leading-none">›</span>
          </button>
        </div>
      </div>
      
      {/* CARROUSEL DE PRODUITS UTILISANT ProductCard */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex space-x-3 sm:space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-44 sm:w-52 lg:w-60"
          >
            <ProductCard 
              product={product}
              priority={index < 4} // Prioriser les 4 premières images
            />
          </div>
        ))}
      </div>
      
      {/* INDICATEUR DE SCROLL MOBILE */}
      <div className="flex justify-center sm:hidden">
        <div className="flex space-x-1.5">
          {Array.from({ length: Math.ceil(filteredProducts.length / 2) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-300"
            ></div>
          ))}
        </div>
      </div>
      
      {/* LIEN VERS CATÉGORIE */}
      {categorySlug && (
        <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
          <Link
            href={`/categories/${categorySlug}`}
            className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-rose-50 text-sm sm:text-base"
          >
            <span>Voir tous les produits de cette catégorie</span>
            <span className="ml-1 sm:ml-2">→</span>
          </Link>
        </div>
      )}
      
      {/* Styles en ligne pour masquer la scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}