// components/CartSummary.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/contexts/CartContext';
import { formatPrice } from '@/lib/firebase-utils';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  className?: string;
}

export default function CartSummary({ 
  showCheckoutButton = true, 
  className = "" 
}: CartSummaryProps) {
  const router = useRouter();
  const { getCartSummary, closeCart } = useCart();
  const summary = getCartSummary();

  const handleContinueShopping = () => {
    closeCart();
  };

  const handleCheckout = () => {
    // Fermer le panier et rediriger vers checkout
    closeCart();
    router.push('/checkout');
  };

  return (
    <div className={`bg-gray-50 border-t border-gray-200 p-4 ${className}`}>
      {/* Résumé des totaux */}
      <div className="space-y-3 mb-6">
        {/* Nombre d'articles */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {summary.itemsCount} article{summary.itemsCount > 1 ? 's' : ''}
          </span>
        </div>

        {/* Sous-total */}
        <div className="flex justify-between text-base">
          <span className="text-gray-900">Sous-total</span>
          <span className="font-medium text-gray-900">
            {formatPrice(summary.subtotal)}
          </span>
        </div>

        {/* Économies totales si applicable */}
        {summary.savings > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Économies totales</span>
            <span className="font-medium text-green-600">
              -{formatPrice(summary.savings)}
            </span>
          </div>
        )}

        {/* Ligne de séparation */}
        <hr className="border-gray-200" />

        {/* Total final */}
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-900">Sous-total</span>
          <span className="text-rose-600">
            {formatPrice(summary.total)}
          </span>
        </div>

        {/* Note sur les frais de livraison */}
        <p className="text-xs text-gray-500 text-center">
          Frais de livraison calculés à l&apos;étape suivante
        </p>
      </div>

      {/* Boutons d'action */}
      {showCheckoutButton && (
        <div className="space-y-3">
          {/* Bouton Commander */}
          <button
            onClick={handleCheckout}
            disabled={summary.itemsCount === 0}
            className="w-full bg-rose-300 hover:bg-rose-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Passer commande
          </button>

          {/* Bouton Continuer les achats */}
          <button
            onClick={handleContinueShopping}
            className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-colors duration-200"
          >
            Continuer mes achats
          </button>
        </div>
      )}

      {/* Messages d'encouragement */}
      <div className="mt-4 space-y-2">
        {summary.itemsCount === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Votre panier est vide</p>
            <p className="text-gray-400 text-xs mt-1">
              Découvrez nos produits de beauté à prix discount
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-green-600 text-sm font-medium flex items-center justify-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Produits en stock - Expédition rapide
            </p>
          </div>
        )}
      </div>

      
    </div>
  );
}