// app/order-success/page.tsx - VERSION CORRIGÉE AVEC SUSPENSE
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/contexts/CartContext';

// Composant séparé qui utilise useSearchParams
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Récupérer les paramètres depuis l'URL (support des deux formats)
  useEffect(() => {
    // Nouveau format avec orderNumber et orderId
    const orderNumberParam = searchParams.get('orderNumber');
    const orderIdParam = searchParams.get('orderId');
    
    // Ancien format avec order seulement
    const orderParam = searchParams.get('order');
    
    if (orderNumberParam) {
      setOrderNumber(orderNumberParam);
      if (orderIdParam) {
        setOrderId(orderIdParam);
      }
    } else if (orderParam) {
      setOrderNumber(orderParam);
    }
    
    console.log("📦 Paramètres de commande reçus:", {
      orderNumber: orderNumberParam || orderParam,
      orderId: orderIdParam
    });
  }, [searchParams]);

  // Vider le panier après confirmation de commande (seulement si pas déjà fait)
  useEffect(() => {
    if (orderNumber) {
      // Délai pour s'assurer que l'utilisateur voit la confirmation
      const timer = setTimeout(() => {
        clearCart();
        console.log("🗑️ Panier vidé après confirmation de commande");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [orderNumber, clearCart]);

  // Debug des paramètres URL en développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 DEBUG - Tous les paramètres URL:", {
        orderNumber: searchParams.get('orderNumber'),
        orderId: searchParams.get('orderId'),
        order: searchParams.get('order'),
        allParams: Object.fromEntries(searchParams.entries())
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        
        {/* Animation de succès */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Commande confirmée !
          </h1>
          
          {orderNumber ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <p className="text-lg text-gray-600 mb-2">
                Votre numéro de commande :
              </p>
              <p className="text-2xl font-bold text-rose-600 font-mono tracking-wider">
                {orderNumber}
              </p>
              {orderId && (
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  ID: {orderId}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Conservez ce numéro pour le suivi de votre commande
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ Numéro de commande non trouvé dans l&apos;URL
              </p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-yellow-600 mt-2">
                  Paramètres disponibles: {Object.entries(Object.fromEntries(searchParams.entries())).map(([key, value]) => `${key}=${value}`).join(', ')}
                </p>
              )}
            </div>
          )}
          
          <p className="text-lg text-gray-600 mb-8">
            Merci pour votre commande. Vous recevrez un SMS de confirmation dans quelques minutes.
          </p>
        </div>

        {/* Informations de la commande */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Que se passe-t-il maintenant ?
          </h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Commande enregistrée</h3>
                <p className="text-sm text-gray-600">Votre commande a été enregistrée dans notre système avec le statut &quot;Commande Reçue&quot;</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Confirmation SMS</h3>
                <p className="text-sm text-gray-600">Vous recevrez un SMS avec les détails de votre commande</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Préparation</h3>
                <p className="text-sm text-gray-600">Nous préparons votre commande avec soin (statut: &quot;Commande Confirmée&quot;)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Expédition</h3>
                <p className="text-sm text-gray-600">Votre commande est expédiée (statut: &quot;Commande Expédiée&quot;)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-sm">5</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Livraison & Paiement</h3>
                <p className="text-sm text-gray-600">Livraison sous 24-48h + paiement à la réception (statut: &quot;Commande Livrée&quot;)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-rose-900 mb-3 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            Une question ? Besoin de suivre votre commande ?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <a 
                href="tel:+212771515771"
                className="text-rose-700 hover:text-rose-800 font-medium"
              >
                📞 +212 771 515 771
              </a>
              <p className="text-rose-600 text-xs mt-1">Lun-Sam 9h-19h</p>
            </div>
            
            <div className="text-center">
              <a 
                href="https://wa.me/212771515771"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-700 hover:text-rose-800 font-medium"
              >
                💬 WhatsApp
              </a>
              <p className="text-rose-600 text-xs mt-1">Réponse rapide</p>
            </div>
          </div>
          
          {orderNumber && (
            <div className="mt-4 p-3 bg-white rounded border border-rose-200">
              <p className="text-rose-800 text-sm font-medium">
                💡 Conseil : Mentionnez le numéro <span className="font-mono font-bold">{orderNumber}</span> lors de votre contact pour un suivi rapide
              </p>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-rose-300 hover:bg-rose-400 text-black font-bold py-3 px-8 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm6 16H8a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h2v1a1 1 0 0 0 2 0V9h2v12a1 1 0 0 1-1 1z"/>
            </svg>
            Continuer mes achats
          </Link>
          
          <p className="text-sm text-gray-500">
            Découvrez nos autres produits de beauté à prix discount
          </p>
        </div>

        {/* Section suivi de commande */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Suivi de votre commande
          </h3>
          <div className="text-gray-600 text-sm space-y-2">
            <p>
              <strong>Statuts de commande :</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Commande Reçue</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Commande Confirmée</span>
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded">Commande Expédiée</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Commande Livrée</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Commande Retournée</span>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Commande Annulée</span>
            </div>
          </div>
        </div>

        {/* Message de remerciement */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Merci de votre confiance !
          </h3>
          <p className="text-gray-600 text-sm">
            Votre satisfaction est notre priorité. N&apos;hésitez pas à nous laisser un avis après réception de votre commande.
          </p>
        </div>
      </div>
    </div>
  );
}

// Composant de fallback pour le Suspense
function OrderSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
        </div>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoading />}>
      <OrderSuccessContent />
    </Suspense>
  );
}