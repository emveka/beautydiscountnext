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
  priority?: boolean; // Pour les images above the fold
}

/**
 * Composant ProductCard utilisant la vraie structure Product
 * Affiche un produit avec toutes ses informations formatées correctement
 * ✅ Utilise uniquement les badges personnalisés depuis Firebase (badgeText + badgeColor)
 * ✅ Badge de réduction séparé à droite
 * ✅ Layout compacté avec stock sur la même ligne que les prix
 * ✅ Container avec hauteur fixe pour éviter le déséquilibre des boutons
 * ✅ NOUVEAU : Intégration complète avec le système de panier
 * ✅ CORRIGÉ : Hiérarchie des titres appropriée pour les cartes produits
 */
export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // ✅ NOUVEAU : Utilisation du contexte panier
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
  // Image de fallback si erreur
  const finalImageUrl = imageError && product.images.length > 1 
    ? product.images[1] || product.imagePaths[1] || '/api/placeholder/300/300'
    : imageError 
    ? '/api/placeholder/300/300'
    : imageUrl;
    
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isOnSale = isProductOnSale(product);
  const productUrl = `/products/${product.slug}`;

  // ✅ NOUVEAU : État du panier pour ce produit
  const productInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);

  // ✅ Obtenir le nom de la marque avec fallback
  const getBrandDisplayName = () => {
    if (product.brandName) return product.brandName;
    if (product.brandId) return product.brandId;
    return null;
  };

  const brandDisplayName = getBrandDisplayName();

  /**
   * ✅ Fonction pour obtenir les styles du badge personnalisé
   */
  const getBadgeStyles = (badgeColor?: string) => {
    if (!badgeColor) {
      // Couleur par défaut si aucune couleur spécifiée
      return 'bg-blue-500 text-white';
    }

    // Si c'est une couleur Tailwind prédéfinie
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

    // Vérifier si c'est une couleur Tailwind prédéfinie
    if (tailwindColors[badgeColor.toLowerCase()]) {
      return tailwindColors[badgeColor.toLowerCase()];
    }

    // Si c'est un code couleur hexadécimal ou CSS personnalisé
    return 'text-white'; // Classe de base, la couleur sera appliquée via style inline
  };

  /**
   * 🆕 Fonction pour calculer la date de livraison (prochain jour ouvrable)
   * Exclut les dimanches (jour 0)
   */
  const getDeliveryDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Si demain est dimanche (jour 0), on ajoute un jour de plus pour avoir lundi
    if (tomorrow.getDay() === 0) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    
    // Formatage de la date en français (ex: "17 sep.")
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short'
    };
    
    return tomorrow.toLocaleDateString('fr-FR', options).replace('.', '.');
  };

  /**
   * ✅ NOUVEAU : Gestionnaire d'ajout au panier amélioré
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
      // Ajouter le produit au panier
      addItem(product, 1);
      
      // Feedback visuel de succès
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
      
      // Optionnel : Afficher une notification ou ouvrir le panier
      // openCart(); // Décommentez pour ouvrir automatiquement le panier
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setIsAddingToCart(false);
      alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    }
  };

  /**
   * ✅ NOUVEAU : Gestionnaire pour voir le panier
   */
  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCart();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Ajout du produit ${product.id} aux favoris`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Aperçu rapide du produit ${product.id}`);
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Produit ${product.id} ajouté à la comparaison`);
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      
      {/* ✅ Badges repositionnés - gauche et droite avec badge personnalisé */}
      <div className="absolute top-2 left-0 right-0 z-10 flex justify-between items-start px-2">
        {/* Badges à gauche */}
        <div className="flex flex-col gap-1">
          {/* ✅ Badge personnalisé depuis Firebase - PRIORITÉ ABSOLUE */}
          {product.badgeText && (
            <span 
              className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${getBadgeStyles(product.badgeColor)}`}
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
            <span className="bg-gray-500 text-white px-2 py-1 text-xs font-bold rounded shadow-sm">
              Épuisé
            </span>
          )}

          {/* ✅ NOUVEAU : Badge "Dans le panier" */}
          {productInCart && (
            <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded shadow-sm flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              Dans le panier ({quantityInCart})
            </span>
          )}
        </div>

        {/* Badges à droite */}
        <div className="flex flex-col gap-1">
          {/* Badge de réduction */}
          {discount && discount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded shadow-sm">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Lien vers la page produit */}
      <Link href={productUrl} className="block flex-1 flex flex-col">
        
        {/* Image du produit */}
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-300 rounded-full animate-spin"></div>
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

        {/* Informations du produit - flex-1 pour prendre l'espace disponible */}
        <div className="p-4 flex-1 flex flex-col">
          
          {/* Marque et contenance - Marque à gauche, contenance à droite avec protection débordement */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Nom de la marque à gauche avec limitation */}
            {brandDisplayName && (
              <span className="text-xs text-rose-600 font-semibold uppercase tracking-wide truncate flex-1 min-w-0">
                {brandDisplayName}
              </span>
            )}
            
            {/* Contenance à droite avec largeur fixe */}
            {product.contenance && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                {product.contenance}
              </span>
            )}
          </div>

          {/* ✅ CORRIGÉ : Nom du produit sans balise de titre (juste un div stylisé) */}
          {/* Les cartes produits dans une grille ne doivent pas avoir de H3/H4 */}
          {/* Car elles ne représentent pas une section de contenu mais des éléments de liste */}
          <div className="font-medium text-gray-900 mb-3 line-clamp-2 leading-tight text-sm group-hover:text-rose-600 transition-colors min-h-[2.5rem]">
            {product.name}
          </div>

          {/* 🆕 CONTAINER AVEC HAUTEUR FIXE pour équilibrer tous les produits */}
          <div className="h-16 flex flex-col justify-end space-y-1">
            {/* Prix original et économies (si en promo) - Container avec hauteur minimale */}
            <div className="min-h-[1.25rem]">
              {product.originalPrice && isOnSale && (
                <div className="flex items-center justify-between">
                  <span className="text-green-600 text-xs font-medium">
                    Économisez {formatPrice(product.originalPrice - product.price)}
                  </span>
                  <span className="text-gray-400 line-through text-sm">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Stock à gauche et prix actuel à droite - Toujours en bas du container */}
            <div className="flex items-center justify-between">
              {/* Statut du stock compacté à gauche */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStockStatusClasses(product.stock)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current/60" />
                <span>{product.stock}</span>
              </div>
              
              <span className="text-red-600 font-bold text-lg">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* ✅ NOUVEAU : Boutons d'action améliorés avec gestion du panier */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex gap-2">
          {productInCart ? (
            /* Si le produit est déjà dans le panier */
            <div className="flex gap-2 w-full">
              <button 
                onClick={handleViewCart}
                className="flex-1 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                aria-label={`Voir le panier contenant ${quantityInCart} ${product.name}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Voir le panier ({quantityInCart})
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === "Rupture" || isAddingToCart}
                className="bg-rose-300 hover:bg-rose-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-medium py-2 px-3 rounded-md transition-colors text-sm"
                title="Ajouter une autre unité"
                aria-label={`Ajouter une autre unité de ${product.name} au panier`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          ) : (
            /* Si le produit n'est pas dans le panier */
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === "Rupture" || isAddingToCart}
              className={`flex-1 font-medium py-2 px-4 rounded-md transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
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
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Ajout...</span>
                </>
              ) : product.stock === "Rupture" ? (
                'Non disponible'
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span>Ajouter au panier</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Indicateur de livraison - Container avec hauteur fixe pour éviter déséquilibre */}
        <div className="h-6 flex items-center mt-2">
          {product.stock === "En Stock" && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Livraison le {getDeliveryDate()}</span>
            </div>
          )}
        </div>

        {/* ✅ NOUVEAU : Message de confirmation d'ajout */}
        {isAddingToCart && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-center" role="status" aria-live="polite">
            <span className="text-green-700 text-xs font-medium">
              ✅ Produit ajouté au panier avec succès !
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