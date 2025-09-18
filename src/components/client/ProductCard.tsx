"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/contexts/CartContext';
import { 
  calculateDiscount, 
  formatPrice, 
  getProductImageUrl, 
  getStockStatusClasses,
  isProductOnSale 
} from '@/lib/firebase-utils';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/**
 * ✅ MOBILE OPTIMIZED ProductCard
 * 📱 Textes, prix et boutons adaptés aux petits écrans
 * 🎯 Padding réduit, tailles responsive, meilleure lisibilité
 * 🔧 NOUVEAU: Hauteur des boutons mobile réduite de 40%
 */
export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { addItem, isInCart, getItemQuantity, openCart } = useCart();

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  // Calculs dérivés
  const imageUrl = getProductImageUrl(product);
  const finalImageUrl = imageError && product.images.length > 1 
    ? product.images[1] || product.imagePaths[1] || '/api/placeholder/300/300'
    : imageError 
    ? '/api/placeholder/300/300'
    : imageUrl;
    
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isOnSale = isProductOnSale(product);
  const productUrl = `/products/${product.slug}`;

  const productInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);

  const getBrandDisplayName = () => {
    if (product.brandName) return product.brandName;
    if (product.brandId) return product.brandId;
    return null;
  };

  const brandDisplayName = getBrandDisplayName();

  /**
   * 📱 MOBILE: Styles de badges plus compacts
   */
  const getBadgeStyles = (badgeColor?: string) => {
    if (!badgeColor) {
      return 'bg-blue-500 text-white';
    }

    const tailwindColors: Record<string, string> = {
      'red': 'bg-red-500 text-white',
      'blue': 'bg-blue-500 text-white',
      'green': 'bg-green-500 text-white',
      'yellow': 'bg-yellow-500 text-black',
      'purple': 'bg-purple-500 text-white',
      'pink': 'bg-pink-500 text-white',
      'indigo': 'bg-indigo-500 text-white',
      'orange': 'bg-orange-500 text-white',
      'teal': 'bg-teal-500 text-white',
      'cyan': 'bg-cyan-500 text-white',
      'gray': 'bg-gray-500 text-white',
      'slate': 'bg-slate-500 text-white',
    };

    if (tailwindColors[badgeColor.toLowerCase()]) {
      return tailwindColors[badgeColor.toLowerCase()];
    }

    return 'text-white';
  };

  /**
   * 📱 MOBILE: Date de livraison plus compacte
   */
  const getDeliveryDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };
    
    return tomorrow.toLocaleDateString('fr-FR', options).replace('.', '.');
  };

  /**
   * 📱 MOBILE: Gestionnaire d'ajout au panier optimisé
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === "Rupture") {
      alert('Ce produit n\'est plus en stock');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      addItem(product, 1);
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setIsAddingToCart(false);
      alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    }
  };

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  return (
    <article className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      
      {/* 📱 MOBILE: Badges repositionnés plus compacts */}
      <div className="absolute top-1 sm:top-2 left-0 right-0 z-10 flex justify-between items-start px-1 sm:px-2">
        {/* Badges à gauche */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          {/* Badge personnalisé depuis Firebase */}
          {product.badgeText && (
            <span 
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm ${getBadgeStyles(product.badgeColor)}`}
              style={
                product.badgeColor && 
                !['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'teal', 'cyan', 'gray', 'slate'].includes(product.badgeColor.toLowerCase())
                  ? { backgroundColor: product.badgeColor }
                  : undefined
              }
            >
              {product.badgeText}
            </span>
          )}
          
          {/* Badge stock épuisé */}
          {product.stock === "Rupture" && (
            <span className="bg-gray-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm">
              Épuisé
            </span>
          )}

          {/* Badge "Dans le panier" */}
          {productInCart && (
            <span className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1">
              <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span className="hidden sm:inline">Dans le panier</span>
              <span className="sm:hidden">✓</span>
              ({quantityInCart})
            </span>
          )}
        </div>

        {/* Badges à droite */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          {/* Badge de réduction */}
          {discount && discount > 0 && (
            <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Lien vers la page produit */}
      <Link href={productUrl} className="block flex-1 flex-col">
        
        {/* Image du produit */}
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-gray-300 border-t-rose-300 animate-spin"></div>
            </div>
          )}
          
          <Image
            src={finalImageUrl}
            alt={product.name}
            width={300}
            height={300}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* 📱 MOBILE: Informations du produit avec padding réduit */}
        <div className="p-2 sm:p-4 flex-1 flex flex-col">
          
          {/* 📱 MOBILE: Marque et contenance plus compactes */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
            {/* Nom de la marque */}
            {brandDisplayName && (
              <span className="text-[10px] sm:text-xs text-rose-600 font-semibold uppercase tracking-wide truncate flex-1 min-w-0">
                {brandDisplayName}
              </span>
            )}
            
            {/* Contenance */}
            {product.contenance && (
              <span className="text-[9px] sm:text-xs text-gray-500 bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap flex-shrink-0">
                {product.contenance}
              </span>
            )}
          </div>

          {/* 📱 MOBILE: Nom du produit avec taille de texte réduite */}
          <div className="font-medium text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight text-xs sm:text-sm group-hover:text-rose-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </div>

          {/* 📱 MOBILE: Container avec hauteur adaptée */}
          <div className="h-12 sm:h-16 flex flex-col justify-end space-y-0.5 sm:space-y-1">
            {/* Prix original et économies */}
            <div className="min-h-[1rem] sm:min-h-[1.25rem]">
              {product.originalPrice && isOnSale && (
                <div className="flex items-center justify-between">
                  <span className="text-green-600 text-[10px] sm:text-xs font-medium">
                    <span className="hidden sm:inline">Économisez </span>
                    <span className="sm:hidden">-</span>
                    {formatPrice(product.originalPrice - product.price)}
                  </span>
                  <span className="text-gray-400 line-through text-[10px] sm:text-sm">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
              )}
            </div>
            
            {/* 📱 MOBILE: Stock et prix compactés */}
            <div className="flex items-center justify-between">
              {/* Statut du stock */}
              <div className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs ${getStockStatusClasses(product.stock)}`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current/60" />
                <span>{product.stock}</span>
              </div>
              
              {/* 📱 MOBILE: Prix avec taille réduite */}
              <span className="text-red-600 font-bold text-sm sm:text-lg">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* 🎯 MOBILE: Boutons d'action avec hauteur réduite de 40% */}
      <div className="px-2 sm:px-4 pb-2 sm:pb-4 mt-auto">
        <div className="flex gap-1 sm:gap-2">
          {productInCart ? (
            /* Si le produit est déjà dans le panier */
            <div className="flex gap-1 sm:gap-2 w-full">
              <button 
                onClick={handleViewCart}
                className="flex-1 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 font-medium py-1 sm:py-2 px-2 sm:px-4 transition-colors text-[10px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2"
                aria-label={`Voir le panier contenant ${quantityInCart} ${product.name}`}
              >
                <svg width="10" height="10" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="hidden sm:inline">Voir le panier ({quantityInCart})</span>
                <span className="sm:hidden">Panier ({quantityInCart})</span>
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === "Rupture" || isAddingToCart}
                className="bg-rose-300 hover:bg-rose-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-medium py-1 sm:py-2 px-2 sm:px-3 transition-colors text-[10px] sm:text-sm"
                title="Ajouter une autre unité"
                aria-label={`Ajouter une autre unité de ${product.name} au panier`}
              >
                <svg width="10" height="10" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          ) : (
            /* 🎯 MOBILE: Bouton d'ajout au panier avec hauteur réduite de 40% */
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === "Rupture" || isAddingToCart}
              className={`flex-1 font-medium py-1 sm:py-2 px-2 sm:px-4 transition-all duration-200 text-[11px] sm:text-sm flex items-center justify-center gap-1 sm:gap-2 ${
                product.stock === "Rupture"
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isAddingToCart
                  ? 'bg-rose-400 text-black scale-95'
                  : 'bg-rose-300 hover:bg-rose-400 text-black hover:scale-105'
              }`}
              aria-label={
                product.stock === "Rupture" 
                  ? `${product.name} non disponible`
                  : `Ajouter ${product.name} au panier`
              }
            >
              {isAddingToCart ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black border-t-transparent animate-spin" aria-hidden="true" />
                  <span className="hidden sm:inline">Ajout...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : product.stock === "Rupture" ? (
                <>
                  <span className="hidden sm:inline">Non disponible</span>
                  <span className="sm:hidden">Épuisé</span>
                </>
              ) : (
                <>
                  <svg width="10" height="10" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span className="hidden sm:inline">Ajouter au panier</span>
                  <span className="sm:hidden">Ajouter</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 📱 MOBILE: Indicateur de livraison plus petit */}
        <div className="h-4 sm:h-6 flex items-center mt-1 sm:mt-2">
          {product.stock === "En Stock" && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-green-600 text-[9px] sm:text-xs">
              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Livraison le {getDeliveryDate()}</span>
              <span className="sm:hidden">Livraison le {getDeliveryDate()}</span>
            </div>
          )}
        </div>

        {/* Message de confirmation d'ajout */}
        {isAddingToCart && (
          <div className="mt-1 sm:mt-2 p-1 sm:p-2 bg-green-50 border border-green-200 text-center" role="status" aria-live="polite">
            <span className="text-green-700 text-[9px] sm:text-xs font-medium">
              ✅ <span className="hidden sm:inline">Produit ajouté au panier avec succès !</span>
              <span className="sm:hidden">Ajouté !</span>
            </span>
          </div>
        )}
      </div>

      {/* Structured data JSON-LD pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "description": product.shortDescription || product.description,
            "sku": product.sku,
            "brand": brandDisplayName ? {
              "@type": "Brand",
              "name": brandDisplayName
            } : undefined,
            "image": finalImageUrl.startsWith('http') ? finalImageUrl : `https://beautydiscount.ma${finalImageUrl}`,
            "offers": {
              "@type": "Offer",
              "url": `https://beautydiscount.ma${productUrl}`,
              "priceCurrency": "MAD",
              "price": product.price,
              "availability": product.stock === "En Stock" 
                ? "https://schema.org/InStock" 
                : product.stock === "Sur Commande"
                ? "https://schema.org/BackOrder"
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "BeautyDiscount"
              }
            }
          })
        }}
      />
    </article>
  );
}