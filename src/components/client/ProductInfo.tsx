// components/client/ProductInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/contexts/CartContext';
import { formatPrice, getStockStatusClasses } from '@/lib/firebase-utils';
import type { Product, Category, SubCategory } from '@/lib/types';

// ✅ CORRECTION : Types détaillés pour Google Analytics au lieu de 'any'
// Ces types définissent précisément la structure des événements GA4
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

// Interface pour les commandes Google Analytics
interface GACommand {
  (command: 'event', eventName: string, params?: GAEventParams): void;
  (command: string, ...args: unknown[]): void;
}

// Déclarations globales pour TypeScript avec types précis
declare global {
  interface Window {
    gtag?: GACommand; // ✅ Type précis au lieu de 'any'
  }
}

// Icônes SVG intégrées pour éviter les dépendances
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4" />
  </svg>
);

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  
  // ✅ NOUVEAU : Utilisation du contexte panier
  const { addItem, isInCart, getItemQuantity, openCart } = useCart();
  
  const productInCart = isInCart(product.id);
  const quantityInCart = getItemQuantity(product.id);
  
  // Charger l'état des favoris depuis localStorage
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(product.id));
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  }, [product.id]);
  
  // ✅ NOUVEAU : Gestionnaire d'ajout au panier avec le contexte
  const handleAddToCart = async () => {
    if (product.stock === 'Rupture') return;
    
    setIsAddingToCart(true);
    
    try {
      // Utiliser la fonction addItem du contexte
      addItem(product, quantity);
      
      // Feedback de succès
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

  // ✅ NOUVEAU : Gestionnaire d'achat direct avec redirection checkout
  const handleBuyNow = async () => {
    if (product.stock === 'Rupture') return;
    
    setIsBuying(true);
    
    try {
      // Ajouter au panier puis rediriger vers checkout
      addItem(product, quantity);
      
      // Petit délai pour le feedback visuel
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

  // ✅ NOUVEAU : Gestionnaire pour voir le panier
  const handleViewCart = () => {
    openCart();
  };
  
  // Gérer les favoris
  const handleFavoriteToggle = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter((id: string) => id !== product.id);
      } else {
        newFavorites = [...favorites, product.id];
      }
      
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
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
    <div className="space-y-6">
      {/* En-tête produit */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {/* Marque */}
            {product.brandName && (
              <p className="text-sm text-gray-600 font-medium mb-1 uppercase tracking-wide">
                {product.brandName}
              </p>
            )}
            
            {/* Nom du produit */}
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {product.name}
            </h1>
            
            {/* Contenance */}
            {product.contenance && (
              <p className="text-lg text-gray-600 font-medium">
                {product.contenance}
              </p>
            )}
          </div>
          
          {/* Bouton favoris */}
          <button
            onClick={handleFavoriteToggle}
            className={`p-3 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-rose-600'
            }`}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        {/* Contexte catégorie */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
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
      
      {/* Prix et promotions */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        {/* Badge personnalisé */}
        {product.badgeText && (
          <div className="inline-block">
            <span 
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-white rounded-full"
              style={{ backgroundColor: product.badgeColor || '#ef4444' }}
            >
              {product.badgeText}
            </span>
          </div>
        )}

        <div className="flex items-baseline space-x-3">
          <span className="text-3xl font-bold text-red-600">
            {formatPrice(product.price)}
          </span>
          
          {isOnSale && product.originalPrice && (
            <>
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              {discount && (
                <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                  -{discount}%
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Économies */}
        {savings > 0 && (
          <div className="flex items-center space-x-2">
            <div className="text-green-600 font-semibold">
              Vous économisez {formatPrice(savings)}
            </div>
          </div>
        )}
      </div>
      
      {/* Description courte */}
      {product.shortDescription && (
        <div className="prose prose-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="mb-0">{product.shortDescription}</p>
        </div>
      )}
      
      {/* Informations produit */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Référence:</span>
          <span className="text-gray-600 font-mono">{product.sku}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="font-medium text-gray-700">Catégorie:</span>
          <span className="text-gray-600">
            {subCategory?.name || category?.name || 'Non classé'}
          </span>
        </div>
      </div>
      
      {/* Statut du stock */}
      <div className="flex items-center space-x-2">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${getStockStatusClasses(product.stock)}`}>
          {getStockIcon()}
          <span>{product.stock}</span>
        </div>
        
        {/* ✅ NOUVEAU : Badge "Dans le panier" si le produit y est */}
        {productInCart && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <Check className="w-4 h-4" />
            <span>Dans le panier ({quantityInCart})</span>
          </div>
        )}
      </div>
      
      {/* Sélection quantité et actions */}
      {product.stock !== 'Rupture' && (
        <div className="space-y-4">
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
          
          {/* ✅ BOUTONS D'ACTION AMÉLIORÉS - Version Desktop */}
          <div className="hidden sm:flex gap-3">
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

      {/* ✅ BOTTOM STICKY MOBILE - Version améliorée avec panier */}
      {product.stock !== 'Rupture' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 shadow-lg">
          <div className="flex items-center gap-2 max-w-full mx-auto px-2">
            
            {/* Quantité compacte */}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="px-2 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
              >
                −
              </button>
              <div className="px-2 py-2 text-xs font-bold text-center bg-white min-w-[1.5rem] border-x border-gray-300">
                {quantity}
              </div>
              <button
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= 99}
                className="px-2 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
              >
                +
              </button>
            </div>

            {productInCart ? (
              /* Version mobile avec panier */
              <>
                <button
                  onClick={handleViewCart}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  <Check className="w-3 h-3" />
                  <span>Panier ({quantityInCart})</span>
                </button>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-3 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  {isAddingToCart ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3" />
                      <span>+{quantity}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Version mobile sans panier */
              <>
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || cartSuccess || isBuying}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white px-3 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>Ajout...</span>
                    </>
                  ) : cartSuccess ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Ajouté!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3" />
                      <span>Panier</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={isBuying || isAddingToCart}
                  className="flex-1 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-3 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1 text-xs"
                >
                  {isBuying ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>Achat...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3" />
                      <span>Acheter</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Padding bottom pour éviter le chevauchement mobile */}
      <div className="sm:hidden h-20"></div>
      
      {/* Message si rupture */}
      {product.stock === 'Rupture' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Produit temporairement indisponible</span>
          </div>
          <p className="text-red-600 text-sm mt-2">
            Ce produit sera bientôt de nouveau en stock. Ajoutez-le à vos favoris pour être notifié.
          </p>
        </div>
      )}
      
      {/* Informations de confiance */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-3">Pourquoi choisir BeautyDiscount ?</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <Clock className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Livraison rapide</p>
              <p className="text-gray-600">24-48h ouvrés, après confirmation commande</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
              <CreditCard className="w-3 h-3 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Paiement à la livraison</p>
              <p className="text-gray-600">Payez en espèces à la réception de votre colis</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
              <Shield className="w-3 h-3 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Produits authentiques</p>
              <p className="text-gray-600">Garantie d&apos;authenticité sur tous nos produits</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}