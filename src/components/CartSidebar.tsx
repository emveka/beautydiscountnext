// components/CartSidebar.tsx
"use client";

import React, { useEffect } from 'react';
import { useCart } from '@/lib/contexts/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

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
        className="fixed inset-0 bg-opacity-50 z-50 transition-opacity duration-300"
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
              {/* Header du panier */}
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

              {/* Contenu du panier */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {items.length === 0 ? (
                  /* Panier vide */
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
                    {/* Liste des articles */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>

                    {/* Résumé et actions */}
                    <CartSummary />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Mobile (<1024px) */}
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out translate-y-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header mobile */}
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
                {/* Bouton vider le panier mobile */}
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-gray-400 hover:text-red-500 p-2 rounded transition-colors"
                    title="Vider le panier"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
                    </svg>
                  </button>
                )}
                
                {/* Bouton fermer mobile */}
                <button
                  onClick={closeCart}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded transition-colors"
                  aria-label="Fermer le panier"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu mobile */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {items.length === 0 ? (
                /* Panier vide mobile */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-gray-300 mb-4">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">Votre panier est vide</h3>
                    <p className="text-gray-500 mb-6">Découvrez nos produits de beauté à prix discount</p>
                    <button
                      onClick={closeCart}
                      className="bg-rose-300 hover:bg-rose-400 text-black font-bold px-8 py-3 rounded-lg transition-colors"
                    >
                      Commencer mes achats
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Liste des articles mobile */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Résumé mobile */}
                  <div className="border-t border-gray-200">
                    <CartSummary />
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