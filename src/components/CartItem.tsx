// components/CartItem.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem as CartItemType, useCart } from '@/lib/contexts/CartContext';
import { getProductImageUrl, formatPrice, calculateDiscount } from '@/lib/firebase-utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { product, quantity } = item;
  const imageUrl = getProductImageUrl(product);
  const subtotal = product.price * quantity;
  const discount = calculateDiscount(product.price, product.originalPrice);

  // Gestion de la mise à jour de quantité
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      updateQuantity(product.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  // Gestion de la suppression
  const handleRemove = async () => {
    const confirmed = window.confirm(`Supprimer "${product.name}" du panier ?`);
    if (!confirmed) return;
    
    setIsRemoving(true);
    try {
      removeItem(product.id);
    } finally {
      setIsRemoving(false);
    }
  };

  // Obtenir le nom de marque avec fallback
  const getBrandDisplayName = () => {
    if (product.brandName) return product.brandName;
    if (product.brandId) return product.brandId;
    return null;
  };

  const brandDisplayName = getBrandDisplayName();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-300 ${
      isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
    }`}>
      <div className="flex gap-4">
        {/* Image du produit */}
        <Link 
          href={`/products/${product.slug}`}
          className="flex-shrink-0 group"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              width={80}
              height={80}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        </Link>

        {/* Informations du produit */}
        <div className="flex-1 min-w-0">
          {/* Marque et badge promotion */}
          <div className="flex items-center justify-between gap-2 mb-1">
            {brandDisplayName && (
              <span className="text-xs text-rose-600 font-semibold uppercase tracking-wide truncate">
                {brandDisplayName}
              </span>
            )}
            {discount && discount > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 text-xs font-bold rounded">
                -{discount}%
              </span>
            )}
          </div>

          {/* Nom du produit */}
          <Link 
            href={`/products/${product.slug}`}
            className="block hover:text-rose-600 transition-colors"
          >
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Contenance si disponible */}
          {product.contenance && (
            <div className="text-xs text-gray-500 mb-2">
              {product.contenance}
            </div>
          )}

          {/* Prix et contrôles quantité */}
          <div className="flex items-center justify-between">
            {/* Prix */}
            <div className="flex flex-col">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-rose-600 font-bold text-lg">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Contrôles quantité */}
            <div className="flex items-center gap-2">
              {/* Bouton diminuer */}
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isUpdating}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                aria-label="Diminuer la quantité"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>

              {/* Affichage quantité */}
              <span className="w-8 text-center font-medium text-gray-900">
                {isUpdating ? '...' : quantity}
              </span>

              {/* Bouton augmenter */}
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
                aria-label="Augmenter la quantité"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Sous-total et bouton supprimer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <div className="text-sm">
              <span className="text-gray-600">Sous-total: </span>
              <span className="font-bold text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>

            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded transition-colors"
              aria-label="Supprimer du panier"
            >
              {isRemoving ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Affichage des économies si applicable */}
      {product.originalPrice && product.originalPrice > product.price && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
          <span className="text-green-700 text-xs font-medium">
            Vous économisez {formatPrice((product.originalPrice - product.price) * quantity)} sur cet article
          </span>
        </div>
      )}
    </div>
  );
}