// components/CartSidebar.tsx
"use client";

import React, { useEffect } from 'react';
import { useCart } from '@/lib/contexts/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { formatPrice } from '@/lib/firebase-utils';
import { useRouter } from 'next/navigation';

/**
 * 📱 MOBILE OPTIMIZED CartSidebar
 * ✅ Résumé ultra-compact pour maximiser l'espace des produits
 * 🎯 Meilleure répartition de l'espace écran mobile
 */
export default function CartSidebar() {
  const { state, closeCart, clearCart } = useCart();
  const { isOpen, items } = state;

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand le panier est ouvert
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  // Gestion du clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  // Gestion du bouton vider le panier
  const handleClearCart = () => {
    clearCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay pour desktop et mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={handleOverlayClick}
        aria-label="Fermer le panier"
      >
        {/* Sidebar Desktop (≥1024px) */}
        <div className="hidden lg:block">
          <div
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header du panier Desktop */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <h2 className="text-lg font-bold text-gray-900">Mon Panier</h2>
                  {items.length > 0 && (
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 text-xs font-bold rounded-full">
                      {items.length}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Bouton vider le panier */}
                  {items.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      title="Vider le panier"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
                      </svg>
                    </button>
                  )}
                  
                  {/* Bouton fermer */}
                  <button
                    onClick={closeCart}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                    aria-label="Fermer le panier"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenu du panier Desktop */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {items.length === 0 ? (
                  /* Panier vide Desktop */
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="text-gray-300 mb-4">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                      <p className="text-gray-500 text-sm mb-4">Découvrez nos produits de beauté à prix discount</p>
                      <button
                        onClick={closeCart}
                        className="bg-rose-300 hover:bg-rose-400 text-black font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        Commencer mes achats
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Liste des articles Desktop */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>

                    {/* Résumé et actions Desktop */}
                    <CartSummary />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 📱 MODAL MOBILE ULTRA-OPTIMISÉE (<1024px) */}
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out translate-y-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 📱 HEADER MOBILE COMPACTÉ */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-1.5">
                {/* 📱 Icône panier plus petite */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600 flex-shrink-0">
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                {/* 📱 Titre plus petit */}
                <h2 className="text-base font-bold text-gray-900 truncate">Mon Panier</h2>
                {items.length > 0 && (
                  <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 text-xs font-bold rounded-full flex-shrink-0">
                    {items.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {/* 📱 Bouton vider le panier mobile compacté */}
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors"
                    title="Vider le panier"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
                    </svg>
                  </button>
                )}
                
                {/* 📱 Bouton fermer mobile compacté */}
                <button
                  onClick={closeCart}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded transition-colors"
                  aria-label="Fermer le panier"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 📱 CONTENU MOBILE AVEC RÉPARTITION OPTIMISÉE */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {items.length === 0 ? (
                /* 📱 Panier vide mobile compacté */
                <div className="flex-1 flex items-center justify-center px-4 py-8">
                  <div className="text-center max-w-xs">
                    <div className="text-gray-300 mb-3">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                    {/* 📱 Titre plus petit */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Votre panier est vide</h3>
                    {/* 📱 Description plus courte */}
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">Découvrez nos produits beauté à prix discount</p>
                    {/* 📱 Bouton plus compact */}
                    <button
                      onClick={closeCart}
                      className="bg-rose-300 hover:bg-rose-400 text-black font-medium px-6 py-2.5 rounded-lg transition-colors text-sm"
                    >
                      Commencer mes achats
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 📱 ZONE PRODUITS MAXIMISÉE (70% de l'espace disponible) */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-3">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                    {/* 📱 Padding bas pour éviter que le dernier produit soit collé au résumé */}
                    <div className="pb-2"></div>
                  </div>

                  {/* 📱 RÉSUMÉ ULTRA-COMPACT - Version mobile spéciale */}
                  <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
                    <MobileCompactSummary />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 📱 COMPOSANT RÉSUMÉ MOBILE ULTRA-COMPACT
 * Optimisé pour prendre le minimum d'espace possible
 */
function MobileCompactSummary() {
  const { getCartSummary, closeCart } = useCart();
  const summary = getCartSummary();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    closeCart();
  };

  return (
    <div className="p-3">
      {/* 📱 RÉSUMÉ EN UNE LIGNE COMPACTE */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-sm">
          {/* Nombre d'articles */}
          <span className="text-gray-600">
            {summary.itemsCount} article{summary.itemsCount > 1 ? 's' : ''}
          </span>
          
          {/* Économies si applicable */}
          {summary.savings > 0 && (
            <span className="text-green-600 font-medium text-xs bg-green-50 px-2 py-1 rounded">
              -{formatPrice(summary.savings)} économisé
            </span>
          )}
        </div>

        {/* Total principal */}
        <div className="text-right">
          <div className="text-lg font-bold text-rose-600">
            {formatPrice(summary.total)}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            + frais de port
          </div>
        </div>
      </div>

      {/* 📱 BOUTONS COMPACTS EN LIGNE */}
      <div className="flex gap-2">
        {/* Bouton Commander - Priorité */}
        <button
          onClick={handleCheckout}
          disabled={summary.itemsCount === 0}
          className="flex-1 bg-rose-300 hover:bg-rose-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          Commander
        </button>

        {/* Bouton Continuer - Secondaire compact */}
        <button
          onClick={handleContinueShopping}
          className="flex-shrink-0 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2.5 px-3 rounded-lg transition-colors duration-200 text-sm"
          title="Continuer mes achats"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
          </svg>
        </button>
      </div>

      {/* 📱 MESSAGE ENCOURAGEANT ULTRA-COMPACT */}
      {summary.itemsCount > 0 && (
        <div className="mt-2 text-center">
          <p className="text-green-600 text-xs font-medium flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            En stock - Expédition rapide
          </p>
        </div>
      )}
    </div>
  );
}