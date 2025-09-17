// components/client/RelatedProducts.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/contexts/CartContext';
import { formatPrice, calculateDiscount, getProductImageUrl } from '@/lib/firebase-utils';
import type { Product } from '@/lib/types';

interface RelatedProductsProps {
  products: Product[];
  title: string;
  categorySlug?: string;
  currentProductId: string;
}

/**
 * Composant RelatedProducts - Carrousel de produits similaires
 * 
 * Fonctionnalités :
 * ✅ Carrousel horizontal avec scroll fluide
 * ✅ Navigation avec boutons fléchés (CSS pur)
 * ✅ Cards produits responsives
 * ✅ Badges promotions et personnalisés
 * ✅ NOUVEAU : Boutons d'ajout au panier intégrés
 * ✅ Lien vers catégorie complète
 * ✅ Gestion du scroll automatique
 * ✅ Icônes CSS simples sans dépendances
 * ✅ Fix du hook useEffect conditionnel
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
  
  // ✅ NOUVEAU : Utilisation du contexte panier
  const { addItem, isInCart, getItemQuantity } = useCart();
  
  // États pour les boutons d'ajout au panier
  const [addingToCart, setAddingToCart] = useState<{ [key: string]: boolean }>({});
  
  // Filtrer le produit actuel et limiter à 8 produits
  const filteredProducts = products
    .filter(product => product.id !== currentProductId)
    .slice(0, 8);
  
  // ✅ FIX: Gérer l'état des boutons de navigation (fonction déplacée avant useEffect)
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };
  
  // ✅ FIX: useEffect maintenant toujours appelé (pas conditionnel)
  useEffect(() => {
    // Vérifier l'état initial au montage seulement si on a des produits
    if (filteredProducts.length > 0) {
      handleScroll();
    }
  }, [filteredProducts.length]); // Dépendance sur la longueur au lieu de l'array complet
  
  // Ne rien afficher si pas de produits
  if (filteredProducts.length === 0) {
    return null;
  }
  
  // Fonction de scroll
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 320; // Largeur d'une carte + gap
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // ✅ NOUVEAU : Gestionnaire d'ajout au panier pour les produits similaires
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la navigation vers la page produit
    e.stopPropagation();
    
    if (product.stock === 'Rupture') {
      alert('Ce produit n\'est plus en stock');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      addItem(product, 1);
      
      // Feedback visuel de succès
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [product.id]: false }));
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
      alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
        <span className="mr-3">🔗</span>
        {title}
      </h3>
        
        {/* Boutons de navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              canScrollLeft 
                ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400' 
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Produits précédents"
          >
            <span className="text-lg leading-none">‹</span>
          </button>
          
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              canScrollRight 
                ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400' 
                : 'border-gray-200 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="Produits suivants"
          >
            <span className="text-lg leading-none">›</span>
          </button>
        </div>
      </div>
      
      {/* Carrousel de produits */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {filteredProducts.map((product) => {
          const discount = calculateDiscount(product.price, product.originalPrice);
          const isOnSale = !!(product.originalPrice && product.originalPrice > product.price);
          const productInCart = isInCart(product.id);
          const quantityInCart = getItemQuantity(product.id);
          const isAddingThisProduct = addingToCart[product.id] || false;
          
          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-72 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
            >
              <Link href={`/products/${product.slug}`} className="block">
                {/* Image du produit */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Image
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="288px"
                  />
                  
                  {/* Badge promotion */}
                  {isOnSale && discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center">
                      <span className="mr-1">🔥</span>
                      -{discount}%
                    </div>
                  )}
                  
                  {/* Badge personnalisé */}
                  {product.badgeText && (
                    <div 
                      className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: product.badgeColor || '#ef4444' }}
                    >
                      {product.badgeText}
                    </div>
                  )}

                  {/* ✅ NOUVEAU : Badge "Dans le panier" */}
                  {productInCart && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center">
                      <span className="mr-1">✓</span>
                      Dans le panier ({quantityInCart})
                    </div>
                  )}
                  
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                
                {/* Informations produit */}
                <div className="p-4 space-y-3">
                  {/* Marque */}
                  {product.brandName && (
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      {product.brandName}
                    </p>
                  )}
                  
                  {/* Nom du produit */}
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Contenance */}
                  {product.contenance && (
                    <p className="text-sm text-gray-600">{product.contenance}</p>
                  )}
                  
                  {/* Prix */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      
                      {isOnSale && product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    
                    {/* Économies */}
                    {isOnSale && product.originalPrice && (
                      <p className="text-xs text-green-600 font-medium flex items-center">
                        <span className="mr-1">💰</span>
                        Économisez {formatPrice(product.originalPrice - product.price)}
                      </p>
                    )}
                  </div>
                  
                  {/* Statut stock */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                      product.stock === 'En Stock' 
                        ? 'bg-green-100 text-green-700' 
                        : product.stock === 'Sur Commande'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className="mr-1">
                        {product.stock === 'En Stock' ? '✅' : 
                         product.stock === 'Sur Commande' ? '⏳' : '❌'}
                      </span>
                      {product.stock}
                    </div>
                    
                    {/* Indicateur de lien */}
                    <div className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* ✅ NOUVEAU : Bouton d'ajout au panier */}
              <div className="px-4 pb-4">
                {product.stock === 'Rupture' ? (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed text-sm"
                  >
                    Non disponible
                  </button>
                ) : productInCart ? (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isAddingThisProduct}
                    className="w-full bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {isAddingThisProduct ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                        Ajouter (+{quantityInCart})
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isAddingThisProduct}
                    className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {isAddingThisProduct ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ajout...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        Ajouter au panier
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Indicateur de scroll pour mobile */}
      <div className="flex justify-center md:hidden">
        <div className="flex space-x-2">
                        {Array.from({ length: Math.ceil(filteredProducts.length / 2) }, (_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-300"
            ></div>
          ))}
        </div>
      </div>
      
      {/* Lien vers la catégorie complète */}
      {categorySlug && (
        <div className="text-center pt-4 border-t border-gray-100">
          <Link
            href={`/categories/${categorySlug}`}
            className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium transition-colors px-6 py-3 rounded-lg hover:bg-rose-50"
          >
            <span className="mr-2">👀</span>
            Voir tous les produits de cette catégorie
            <span className="ml-2">→</span>
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