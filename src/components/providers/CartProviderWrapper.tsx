// components/providers/CartProviderWrapper.tsx
"use client";

import { CartProvider } from '@/lib/contexts/CartContext';

interface CartProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper client pour le CartProvider
 * Nécessaire pour éviter l'erreur "client-only" dans layout.tsx
 */
export default function CartProviderWrapper({ children }: CartProviderWrapperProps) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}