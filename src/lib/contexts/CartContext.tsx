// lib/contexts/CartContext.tsx
"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { Product } from '@/lib/types';

// Types pour le panier
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  lastAddedItem?: CartItem;
}

export interface CartSummary {
  itemsCount: number;
  subtotal: number;
  total: number;
  savings: number;
}

// Actions du panier
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE_CART'; payload: CartItem[] };

// État initial
const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: false,
};

// Reducer pour gérer les actions du panier
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1 } = action.payload;
      
      // Vérifier si le produit existe déjà 
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // Mettre à jour la quantité du produit existant
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          addedAt: new Date() // Mettre à jour la date d'ajout
        };
        
        return {
          ...state,
          items: updatedItems,
          lastAddedItem: updatedItems[existingItemIndex]
        };
      } else {
        // Ajouter un nouveau produit
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity,
          addedAt: new Date()
        };
        
        return {
          ...state,
          items: [...state.items, newItem],
          lastAddedItem: newItem
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.productId)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la quantité est 0 ou négative, supprimer l'article
        return {
          ...state,
          items: state.items.filter(item => item.id !== productId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: []
      };
    }
    
    case 'TOGGLE_CART': {
      return {
        ...state,
        isOpen: !state.isOpen
      };
    }
    
    case 'OPEN_CART': {
      return {
        ...state,
        isOpen: true
      };
    }
    
    case 'CLOSE_CART': {
      return {
        ...state,
        isOpen: false
      };
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      };
    }
    
    case 'HYDRATE_CART': {
      return {
        ...state,
        items: action.payload
      };
    }
    
    default:
      return state;
  }
}

// Interface du contexte
interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getCartSummary: () => CartSummary;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// Création du contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Clé pour le localStorage
const CART_STORAGE_KEY = 'beautydiscount-cart';

// Provider du contexte
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydratation depuis le localStorage au montage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        // Reconvertir les dates
        const hydratedCart = parsedCart.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        dispatch({ type: 'HYDRATE_CART', payload: hydratedCart });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      // En cas d'erreur, nettoyer le localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Sauvegarde dans le localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }, [state.items]);

  // Actions du panier
  const addItem = (product: Product, quantity = 1) => {
    // Vérifier si le produit est en stock
    if (product.stock === 'Rupture') {
      alert('Ce produit n\'est plus en stock');
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    if (state.items.length > 0) {
      const confirmed = window.confirm('Êtes-vous sûr de vouloir vider votre panier ?');
      if (confirmed) {
        dispatch({ type: 'CLEAR_CART' });
      }
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  // Calcul du résumé du panier
  const getCartSummary = (): CartSummary => {
    const itemsCount = state.items.reduce((total, item) => total + item.quantity, 0);
    
    const subtotal = state.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    
    const savings = state.items.reduce((total, item) => {
      if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
        const discount = item.product.originalPrice - item.product.price;
        return total + (discount * item.quantity);
      }
      return total;
    }, 0);
    
    // Pas de frais de livraison, le total = subtotal
    const total = subtotal;
    
    return {
      itemsCount,
      subtotal,
      total,
      savings
    };
  };

  // Vérifier si un produit est dans le panier
  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.id === productId);
  };

  // Obtenir la quantité d'un produit dans le panier
  const getItemQuantity = (productId: string): number => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const contextValue: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getCartSummary,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
}

// Hook pour obtenir uniquement le résumé (optimisé pour les performances)
export function useCartSummary() {
  const { getCartSummary } = useCart();
  return getCartSummary();
}