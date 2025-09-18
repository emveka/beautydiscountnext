// components/client/ProductInfo.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/contexts/CartContext';
import { formatPrice, getStockStatusClasses } from '@/lib/firebase-utils';
import type { Product, Category, SubCategory } from '@/lib/types';

// Types détaillés pour Google Analytics
interface GAEventParams {
  currency?: string;
  value?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity: number;
    price: number;
  }>;
}

interface GACommand {
  (command: 'event', eventName: string, params?: GAEventParams): void;
  (command: string, ...args: unknown[]): void;
}

declare global {
  interface Window {
    gtag?: GACommand;
  }
}

// Icônes SVG intégrées
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4" />
  </svg>
);


const CreditCard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

interface ProductInfoProps {
  product: Product;
  category: Category | null;
  subCategory: SubCategory | null;
  discount: number | null;
  isOnSale: boolean;
}

export default function ProductInfo({ 
  product, 
  category, 
  subCategory, 
  discount, 
  isOnSale 
}: ProductInfoProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const [cartSuccess, setCartSuccess] = useState(false);
  
  // Utilisation du contexte panier
  const { addItem, isInCart, getItemQuantity, openCart } = useCart();
  
  const productInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);
  
  
  // Gestionnaire d'ajout au panier avec le contexte
  const handleAddToCart = async () => {
    if (product.stock === 'Rupture') return;
    
    setIsAddingToCart(true);
    
    try {
      addItem(product, quantity);
      
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
      
      // Analytics - Track add to cart
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'MAD',
          value: product.price * quantity,
          items: [{
            item_id: product.sku,
            item_name: product.name,
            category: category?.name,
            quantity: quantity,
            price: product.price
          }]
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Gestionnaire d'achat direct avec redirection checkout
  const handleBuyNow = async () => {
    if (product.stock === 'Rupture') return;
    
    setIsBuying(true);
    
    try {
      addItem(product, quantity);
      
      setTimeout(() => {
        setIsBuying(false);
        router.push('/checkout');
      }, 800);
      
      // Analytics - Track purchase intent
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
          currency: 'MAD',
          value: product.price * quantity,
          items: [{
            item_id: product.sku,
            item_name: product.name,
            category: category?.name,
            quantity: quantity,
            price: product.price
          }]
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      alert('Erreur lors de l\'achat. Veuillez réessayer.');
      setIsBuying(false);
    }
  };

  // Gestionnaire pour voir le panier
  const handleViewCart = () => {
    openCart();
  };
  
  // Gérer la quantité
  const updateQuantity = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(99, newQuantity));
    setQuantity(validQuantity);
  };
  
  // Icône de statut de stock
  const getStockIcon = () => {
    switch (product.stock) {
      case 'En Stock':
        return <Check className="w-4 h-4" />;
      case 'Sur Commande':
        return <Clock className="w-4 h-4" />;
      case 'Rupture':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };
  
  // Calculer les économies
  const savings = isOnSale && product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
  return (
    <>
      {/* 🎯 CONTENEUR PRINCIPAL AVEC PADDING BOTTOM POUR LE STICKY */}
      <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
        {/* En-tête produit */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-2">
              {/* Marque */}
              {product.brandName && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 uppercase tracking-wide">
                  {product.brandName}
                </p>
              )}
              
              {/* Nom du produit - Responsive */}
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>
              
              {/* Contenance */}
              {product.contenance && (
                <p className="text-sm sm:text-lg text-gray-600 font-medium">
                  {product.contenance}
                </p>
              )}
            </div>
            
            
          </div>
          
          {/* Contexte catégorie */}
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
            {category && (
              <>
                <span className="hover:text-rose-600 cursor-pointer">{category.name}</span>
                {subCategory && (
                  <>
                    <span>•</span>
                    <span className="hover:text-rose-600 cursor-pointer">{subCategory.name}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Prix et promotions - Optimisé mobile */}
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gray-50 ">
          {/* Badge personnalisé */}
          {product.badgeText && (
            <div className="inline-block">
              <span 
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white "
                style={{ backgroundColor: product.badgeColor || '#ef4444' }}
              >
                {product.badgeText}
              </span>
            </div>
          )}

          <div className="flex items-baseline space-x-2 sm:space-x-3">
            <span className="text-2xl sm:text-3xl font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            
            {isOnSale && product.originalPrice && (
              <>
                <span className="text-lg sm:text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                {discount && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{discount}%
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* Économies */}
          {savings > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-sm sm:text-base text-green-600 font-semibold">
                Vous économisez {formatPrice(savings)}
              </div>
            </div>
          )}
        </div>
        
        {/* Description courte - Compacte sur mobile */}
        {product.shortDescription && (
          <div className="prose prose-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="mb-0 text-sm sm:text-base">{product.shortDescription}</p>
          </div>
        )}
        
        {/* Informations produit - Taille mobile optimisée */}
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Référence:</span>
            <span className="text-gray-600 font-mono text-xs">{product.sku}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700">Catégorie:</span>
            <span className="text-gray-600 text-right">
              {subCategory?.name || category?.name || 'Non classé'}
            </span>
          </div>
        </div>
        
        {/* Statut du stock - Responsive */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium ${getStockStatusClasses(product.stock)}`}>
            {getStockIcon()}
            <span>{product.stock}</span>
          </div>
          
          {/* Badge "Dans le panier" si le produit y est */}
          {productInCart && (
            <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-700">
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Dans le panier ({quantityInCart})</span>
            </div>
          )}
        </div>
        
        {/* Sélection quantité et actions - Desktop uniquement */}
        {product.stock !== 'Rupture' && (
          <div className="hidden sm:block space-y-4">
            {/* Sélecteur de quantité */}
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium text-gray-700">
                Quantité:
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Diminuer la quantité"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-3 text-center border-0 focus:ring-0 focus:outline-none"
                />
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={quantity >= 99}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* BOUTONS D'ACTION - Version Desktop */}
            <div className="flex gap-3">
              {productInCart ? (
                /* Si le produit est déjà dans le panier */
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={handleViewCart}
                    className="flex-1 bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Voir le panier ({quantityInCart})</span>
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isBuying}
                    className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    title="Ajouter une autre unité"
                  >
                    {isAddingToCart ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>+{quantity}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Si le produit n'est pas dans le panier */
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || cartSuccess || isBuying}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Ajout en cours...</span>
                      </>
                    ) : cartSuccess ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleBuyNow}
                    disabled={isBuying || isAddingToCart}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    {isBuying ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Achat en cours...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Acheter maintenant</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Message si rupture */}
        {product.stock === 'Rupture' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Produit temporairement indisponible</span>
            </div>
            <p className="text-red-600 text-xs sm:text-sm mt-2">
              Ce produit sera bientôt de nouveau en stock. Ajoutez-le à vos favoris pour être notifié.
            </p>
          </div>
        )}
        
        {/* Informations de confiance - Compactes sur mobile */}
        <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Pourquoi choisir BeautyDiscount ?</h3>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-3 text-xs sm:text-sm">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Livraison rapide</p>
                <p className="text-gray-600">24-48h ouvrés, après confirmation commande</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-xs sm:text-sm">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Paiement à la livraison</p>
                <p className="text-gray-600">Payez en espèces à la réception de votre colis</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-xs sm:text-sm">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Produits authentiques</p>
                <p className="text-gray-600">Garantie d&apos;authenticité sur tous nos produits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 BOTTOM STICKY MOBILE - TOTALEMENT REFAIT ET CORRIGÉ */}
      {product.stock !== 'Rupture' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
          {/* Container avec safe area pour les iPhone avec encoche */}
          <div className="pb-safe-bottom">
            <div className="p-3">
              <div className="flex items-center gap-2">
                
                {/* 🎯 SÉLECTEUR DE QUANTITÉ ULTRA COMPACT */}
                <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <div className="w-10 h-8 flex items-center justify-center bg-white border-x border-gray-300 text-xs font-bold">
                    {quantity}
                  </div>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={quantity >= 99}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>

                {/* 🎯 BOUTONS D'ACTION OPTIMISÉS */}
                {productInCart ? (
                  /* Version avec panier - Actions compactes */
                  <>
                    <button
                      onClick={handleViewCart}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs min-h-[40px]"
                    >
                      <Check className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">Panier ({quantityInCart})</span>
                    </button>
                    
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-xs min-h-[40px] min-w-[60px]"
                      title={`Ajouter ${quantity} de plus`}
                    >
                      {isAddingToCart ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3" />
                          <span className="ml-1">+{quantity}</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* Version sans panier - Deux boutons principaux */
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || cartSuccess || isBuying}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs min-h-[40px]"
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Ajout...</span>
                        </>
                      ) : cartSuccess ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Ajouté!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Panier</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={isBuying || isAddingToCart}
                      className="flex-1 bg-black hover:bg-black disabled:bg-gray-400 text-white py-2.5 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs min-h-[40px]"
                    >
                      {isBuying ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Achat...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">Acheter</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}