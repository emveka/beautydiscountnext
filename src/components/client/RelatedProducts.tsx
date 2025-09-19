// components/client/RelatedProducts.tsx - INTERFACE MISE À JOUR MULTI-CATÉGORIES
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product, Category, SubCategory } from '@/lib/types';

// ✅ INTERFACE MISE À JOUR POUR MULTI-CATÉGORIES
interface RelatedProductsProps {
  products: Product[];
  title: string;
  categorySlug?: string;
  currentProductId: string;
  
  // ✅ NOUVELLES PROPS MULTI-CATÉGORIES
  categories?: Category[];           // 🔄 Tableau de toutes les catégories
  subCategories?: SubCategory[];     // 🔄 Tableau de toutes les sous-catégories
  
  // 🆕 PROPS OPTIONNELLES POUR LA FLEXIBILITÉ
  primaryCategory?: Category | null;      // Catégorie principale pour liens
  showCategoryLink?: boolean;             // Afficher ou non le lien vers catégorie
  maxProducts?: number;                   // Nombre maximum de produits à afficher
}

/**
 * Composant RelatedProducts - VERSION MULTI-CATÉGORIES AVEC ProductCard
 * 
 * NOUVELLES OPTIMISATIONS :
 * ✅ Utilise le composant ProductCard existant pour la cohérence
 * ✅ Scroll horizontal optimisé pour mobile
 * ✅ Navigation adaptée aux écrans tactiles
 * ✅ Réutilisation du code existant
 * ✅ Design cohérent avec la grille de produits
 * ✅ Support multi-catégories intelligent
 */
export default function RelatedProducts({ 
  products, 
  title, 
  categorySlug, 
  currentProductId,
  categories = [],
  subCategories = [],
  primaryCategory = null,
  showCategoryLink = true,
  maxProducts = 8
}: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Filtrer le produit actuel et limiter les produits
  const filteredProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, maxProducts);
  
  // ✅ DÉTERMINATION INTELLIGENTE DE LA CATÉGORIE POUR LE LIEN
  const linkCategory = primaryCategory || categories[0] || null;
  const linkCategorySlug = categorySlug || linkCategory?.slug;
  
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
  
  // ✅ GÉNÉRATION INTELLIGENTE DE LA DESCRIPTION MULTI-CATÉGORIES
  const generateDescription = () => {
    if (subCategories.length > 1) {
      return `Découvrez d'autres produits dans les sous-catégories ${subCategories.map(s => s.name).join(', ')}`;
    }
    
    if (subCategories.length === 1) {
      return `Découvrez d'autres produits dans la sous-catégorie ${subCategories[0].name}`;
    }
    
    if (categories.length > 1) {
      return `Découvrez d'autres produits dans les catégories ${categories.map(c => c.name).join(', ')}`;
    }
    
    if (categories.length === 1) {
      return `Découvrez d'autres produits dans la catégorie ${categories[0].name}`;
    }
    
    return "Découvrez d'autres produits qui pourraient vous intéresser";
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* EN-TÊTE AVEC NAVIGATION */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            {title}
          </h3>
          
          {/* ✅ DESCRIPTION CONTEXTUELLE MULTI-CATÉGORIES */}
          <p className="text-sm text-gray-600">
            {generateDescription()}
          </p>
        </div>
        
        {/* BOUTONS DE NAVIGATION - Plus gros sur mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2 ml-4">
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
      
      {/* ✅ LIENS VERS CATÉGORIES INTELLIGENTS */}
      {showCategoryLink && (linkCategorySlug || categories.length > 0) && (
        <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
          {/* Lien principal vers la catégorie */}
          {linkCategorySlug && (
            <Link
              href={`/categories/${linkCategorySlug}`}
              className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-rose-50 text-sm sm:text-base mr-3"
            >
              <span>Voir tous les produits {linkCategory ? `en ${linkCategory.name}` : 'de cette catégorie'}</span>
              <span className="ml-1 sm:ml-2">→</span>
            </Link>
          )}
          
          {/* ✅ LIENS ADDITIONNELS POUR MULTI-CATÉGORIES */}
          {categories.length > 1 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-xs text-gray-500 w-full">Ou explorez par catégorie :</span>
              {categories.slice(0, 3).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              {categories.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{categories.length - 3} autres
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* ✅ STATISTIQUES MULTI-CATÉGORIES (optionnel) */}
      {(categories.length > 1 || subCategories.length > 1) && (
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-700">
            {categories.length > 1 && subCategories.length > 1 
              ? `Ce produit couvre ${categories.length} catégories et ${subCategories.length} sous-catégories`
              : categories.length > 1 
                ? `Ce produit appartient à ${categories.length} catégories différentes`
                : `Ce produit couvre ${subCategories.length} sous-catégories`
            }
          </p>
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