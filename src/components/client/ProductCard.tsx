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
  showPromotionBadge?: boolean;
  showCategoryTags?: boolean;
}

/**
 * ✅ MOBILE OPTIMIZED ProductCard with Promotions Support
 * 📱 Textes, prix et boutons adaptés aux petits écrans
 * 🎯 Padding réduit, tailles responsive, meilleure lisibilité
 * 🔧 NOUVEAU: Support complet des badges promotions
 * 💰 NOUVEAU: Affichage des économies et prix barrés
 * 🔍 SEO: Mots d'interface masqués avec aria-hidden
 * 🛠️ FIX: Éviter les retours à la ligne pour statut et prix
 */
export default function ProductCard({ 
  product, 
  priority = false,
  showPromotionBadge = false,
  showCategoryTags = false
}: ProductCardProps) {
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

  // ✅ NOUVEAUX CALCULS PROMOTIONS
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const isHotDeal = discount && discount >= 30;

  const productInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);

  const getBrandDisplayName = () => {
    if (product.brandName) return product.brandName;
    if (product.brandId) return product.brandId;
    return null;
  };

  const brandDisplayName = getBrandDisplayName();

  /**
   * 🛠️ FONCTION UTILITAIRE: Raccourcir le texte du statut stock
   */
  const getCompactStockText = (stock: string) => {
    const stockMappings: Record<string, { mobile: string; desktop: string }> = {
      'En Stock': { mobile: 'En Stock', desktop: 'En Stock' },
      'Sur Commande': { mobile: 'Sur Commande', desktop: 'Sur Commande' },
      'Rupture': { mobile: 'Épuisé', desktop: 'Rupture' },
      'Disponible': { mobile: 'Disponible', desktop: 'Disponible' },
      'Bientôt disponible': { mobile: 'Bientôt', desktop: 'Bientôt' }
    };
    
    return stockMappings[stock] || { mobile: stock, desktop: stock };
  };

  /**
   * 🛠️ FONCTION UTILITAIRE: Formater le prix de manière compacte
   */
  const getCompactPrice = (price: number) => {
    const formatted = formatPrice(price);
    // Si le prix fait plus de 7 caractères (ex: "1 234 DH"), on le compacte
    if (formatted.length > 7) {
      // Enlever les espaces pour les grands nombres
      return formatted.replace(/\s/g, '');
    }
    return formatted;
  };

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
      
      // ✅ TRACKING SPÉCIAL PROMOTIONS
      if (showPromotionBadge && isOnSale) {
        console.log('🔥 Produit en promotion ajouté au panier:', {
          productName: product.name,
          discount: discount,
          savings: savings,
          isHotDeal: isHotDeal
        });
      }
      
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

  // 🛠️ CALCULS POUR AFFICHAGE COMPACT
  const stockDisplayText = getCompactStockText(product.stock);
  const compactPrice = getCompactPrice(product.price);

  return (
    <article className="bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      
      {/* ✅ Contenu SEO thématique invisible */}
      <div className="sr-only">
        Produit capillaire {product.name} cosmétique beauté professionnelle. 
        {brandDisplayName && `Marque ${brandDisplayName}.`}
        {isOnSale && `En promotion avec ${discount}% de réduction.`}
        Cosmétique qualité salon disponible chez BeautyDiscount Maroc.
      </div>

      {/* ✅ BADGES REPOSITIONNÉS AVEC SUPPORT PROMOTIONS */}
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
              aria-hidden="true"
            >
              {product.badgeText}
            </span>
          )}
          
          {/* Badge stock épuisé */}
          {product.stock === "Rupture" && (
            <span className="bg-gray-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm" aria-hidden="true">
              Épuisé
            </span>
          )}

          {/* Badge "Dans le panier" */}
          {productInCart && (
            <span className="bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5 sm:gap-1" aria-hidden="true">
              <svg width="10" height="10" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span className="hidden sm:inline">Dans le panier</span>
              <span className="sm:hidden">✓</span>
              ({quantityInCart})
            </span>
          )}
        </div>

        {/* ✅ BADGES PROMOTIONS À DROITE */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          {/* Badge de réduction amélioré */}
          {showPromotionBadge && discount && discount > 0 && (
            <>
              {isHotDeal ? (
                // Badge Hot Deal
                <span className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5" aria-hidden="true">
                  <span>🔥</span>
                  <span>-{discount}%</span>
                </span>
              ) : (
                // Badge promo standard
                <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm" aria-hidden="true">
                  -{discount}%
                </span>
              )}
            </>
          )}

          {/* ✅ BADGE BEST DEAL pour très grosses remises */}
          {showPromotionBadge && discount && discount >= 50 && (
            <span className="bg-yellow-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-0.5" aria-hidden="true">
              <span>⭐</span>
              <span className="hidden sm:inline">BEST</span>
            </span>
          )}

          {/* Badge de réduction standard (si pas de showPromotionBadge) */}
          {!showPromotionBadge && discount && discount > 0 && (
            <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold shadow-sm" aria-hidden="true">
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse" aria-hidden="true">
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
        <div className="p-1 sm:p-1 flex-1 flex flex-col">
          
          {/* 📱 MOBILE: Marque et contenance plus compactes */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
            {/* Nom de la marque */}
            {brandDisplayName && (
              <span className="text-[10px] sm:text-xs text-rose-500 font-semibold uppercase tracking-wide truncate flex-1 min-w-0">
                {brandDisplayName}
              </span>
            )}
            
            {/* Contenance */}
            {product.contenance && (
              <span className="text-[9px] sm:text-xs text-gray-500 bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap flex-shrink-0" aria-hidden="true">
                {product.contenance}
              </span>
            )}
          </div>

          {/* 📱 MOBILE: Nom du produit avec taille de texte réduite */}
          <div className="font-medium text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight text-xs sm:text-sm group-hover:text-rose-600 transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </div>

          {/* ✅ TAGS CATÉGORIES (SI ACTIVÉS) */}
          {showCategoryTags && (product.categoryIds?.length > 0 || product.subCategoryIds?.length > 0) && (
            <div className="flex flex-wrap gap-1 mb-2" aria-hidden="true">
              {/* Affichage des catégories principales */}
              {product.categoryIds?.slice(0, 2).map((categoryId, index) => (
                <span
                  key={categoryId}
                  className="bg-blue-100 text-blue-600 px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full"
                >
                  Cat {index + 1}
                </span>
              ))}
              {/* Affichage des sous-catégories */}
              {product.subCategoryIds?.slice(0, 1).map((subCategoryId) => (
                <span
                  key={subCategoryId}
                  className="bg-green-100 text-green-600 px-1.5 py-0.5 text-[9px] sm:text-xs rounded-full"
                >
                  Sub
                </span>
              ))}
            </div>
          )}

          {/* ✅ PRIX ET ÉCONOMIES AMÉLIORÉS POUR PROMOTIONS */}
          <div className="h-12 sm:h-16 flex flex-col justify-end space-y-0.5 sm:space-y-1">
            {/* Prix original et économies */}
            <div className="min-h-[1rem] sm:min-h-[1.25rem]">
              {product.originalPrice && isOnSale && (
                <div className="flex items-center justify-between">
                  {/* ✅ ÉCONOMIES AMÉLIORÉES POUR PROMOTIONS */}
                  <span className={`text-[10px] sm:text-xs font-medium ${
                    showPromotionBadge ? 'text-red-600' : 'text-green-600'
                  }`} aria-hidden="true">
                    {showPromotionBadge ? (
                      <>
                        <span className="hidden sm:inline">💰 Économisez </span>
                        <span className="sm:hidden">💰 -</span>
                        {getCompactPrice(savings)}
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Économisez </span>
                        <span className="sm:hidden">-</span>
                        {getCompactPrice(savings)}
                      </>
                    )}
                  </span>
                  <span className="text-gray-400 line-through text-[10px] sm:text-sm" aria-hidden="true">
                    {getCompactPrice(product.originalPrice)}
                  </span>
                </div>
              )}
            </div>
            
            {/* 🛠️ SECTION STOCK ET PRIX OPTIMISÉE - SOLUTION PRINCIPALE */}
            <div className="flex items-center justify-between gap-1">
              {/* Statut du stock - COMPACT ET SANS RETOUR À LA LIGNE */}
              <div className={`inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[10px] font-medium whitespace-nowrap flex-shrink-0 ${getStockStatusClasses(product.stock)}`} aria-hidden="true">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-current/60 flex-shrink-0" />
                <span className="leading-none">
                  {/* Affichage responsive du statut - MAINTENANT IDENTIQUE */}
                  <span className="sm:hidden">{stockDisplayText.mobile}</span>
                  <span className="hidden sm:inline">{stockDisplayText.desktop}</span>
                </span>
              </div>
              
              {/* ✅ PRIX COMPACT ET PLUS GRAND - SANS RETOUR À LA LIGNE */}
              <span className={`font-bold text-[18px] sm:text-lg leading-none whitespace-nowrap flex-shrink-0 ${
                showPromotionBadge && isOnSale ? 'text-red-600' : 'text-red-600'
              }`}>
                {compactPrice}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* 🎯 SECTION DES BOUTONS D'ACTION OPTIMISÉE */}
      <div className="px-1 sm:px-1 pb-1 sm:pb-2">
        <div className="flex gap-1 sm:gap-2">
          {productInCart ? (
            /* Si le produit est déjà dans le panier */
            <div className="flex gap-1 sm:gap-2 w-full">
              <button 
                onClick={handleViewCart}
                className="flex-1 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 font-medium h-6 sm:h-9 px-2 sm:px-4 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 min-w-0"
                aria-label={`Voir le panier contenant ${quantityInCart} ${product.name}`}
              >
                <svg width="12" height="12" className="sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span className="hidden sm:inline truncate" aria-hidden="true">Voir le panier ({quantityInCart})</span>
                <span className="sm:hidden truncate" aria-hidden="true">Panier ({quantityInCart})</span>
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === "Rupture" || isAddingToCart}
                className="bg-rose-300 hover:bg-rose-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-medium h-6 sm:h-9 w-7 sm:w-11 transition-colors text-xs sm:text-sm flex items-center justify-center flex-shrink-0"
                title="Ajouter une autre unité"
                aria-label={`Ajouter une autre unité de ${product.name} au panier`}
              >
                <svg width="12" height="12" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          ) : (
            /* ✅ BOUTON D'AJOUT AU PANIER AVEC STYLE PROMOTION */
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === "Rupture" || isAddingToCart}
              className={`flex-1 font-medium h-6 sm:h-9 px-2 sm:px-4 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 sm:gap-2 min-w-0 ${
                product.stock === "Rupture"
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : isAddingToCart
                  ? (showPromotionBadge && isOnSale 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white scale-95'
                    : 'bg-rose-400 text-black scale-95')
                  : (showPromotionBadge && isOnSale
                    ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white hover:scale-105'
                    : 'bg-rose-300 hover:bg-rose-400 text-black hover:scale-105')
              }`}
              aria-label={
                product.stock === "Rupture" 
                  ? `${product.name} non disponible`
                  : `Ajouter ${product.name} au panier`
              }
            >
              {isAddingToCart ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent animate-spin flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline truncate" aria-hidden="true">Ajout...</span>
                  <span className="sm:hidden" aria-hidden="true">...</span>
                </>
              ) : product.stock === "Rupture" ? (
                <>
                  <span className="hidden sm:inline truncate" aria-hidden="true">Non disponible</span>
                  <span className="sm:hidden truncate" aria-hidden="true">Épuisé</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" className="sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {/* ✅ TEXTE BOUTON ORIGINAL - JUSTE MASQUÉ DU SEO */}
                  {showPromotionBadge && isOnSale ? (
                    <>
                      <span className="hidden sm:inline truncate" aria-hidden="true">Profiter !</span>
                      <span className="sm:hidden truncate" aria-hidden="true">Profiter</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline truncate" aria-hidden="true">Ajouter au panier</span>
                      <span className="sm:hidden truncate" aria-hidden="true">Ajouter</span>
                    </>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        {/* 📱 MOBILE: Indicateur de livraison plus compact */}
        <div className="h-3 sm:h-5 flex items-center mt-0.5 sm:mt-1">
          {product.stock === "En Stock" && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-green-600 text-[9px] sm:text-xs" aria-hidden="true">
              <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Livraison le {getDeliveryDate()}</span>
              <span className="sm:hidden">Livraison le {getDeliveryDate()}</span>
            </div>
          )}
        </div>

        {/* Message de confirmation d'ajout - Plus compact */}
        {isAddingToCart && (
          <div className="mt-0.5 sm:mt-1 p-1 sm:p-2 bg-green-50 border border-green-200 text-center" role="status" aria-live="polite">
            <span className="text-green-700 text-[9px] sm:text-xs font-medium" aria-hidden="true">
              ✅ <span className="hidden sm:inline">Produit ajouté au panier avec succès !</span>
              <span className="sm:hidden">Ajouté !</span>
            </span>
          </div>
        )}
      </div>

      {/* ✅ STRUCTURED DATA AMÉLIORÉ AVEC PROMOTIONS */}
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
              // ✅ PRIX ORIGINAL POUR PROMOTIONS
              ...(product.originalPrice && isOnSale && {
                "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 jours
              }),
              "availability": product.stock === "En Stock" 
                ? "https://schema.org/InStock" 
                : product.stock === "Sur Commande"
                ? "https://schema.org/BackOrder"
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "BeautyDiscount"
              }
            },
            // ✅ AJOUT INFO PROMOTIONS
            ...(showPromotionBadge && isOnSale && {
              "additionalProperty": [
                {
                  "@type": "PropertyValue",
                  "name": "Discount",
                  "value": `${discount}%`
                },
                {
                  "@type": "PropertyValue", 
                  "name": "Savings",
                  "value": `${savings} MAD`
                }
              ]
            })
          })
        }}
      />
    </article>
  );
}