// components/client/PromotionsHero.tsx - HERO SECTION PROMOTIONS
"use client";

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/firebase-utils';

interface PromotionsHeroProps {
  totalProducts: number;
  averageDiscount: number;
  totalSavings: number;
  biggestDiscount: number;
}

/**
 * Composant Hero pour la page promotions
 * 
 * FONCTIONNALITÉS :
 * ✅ Affichage des statistiques en temps réel
 * ✅ Animation des compteurs
 * ✅ Design responsive et attractif
 * ✅ Call-to-action optimisé
 */
export default function PromotionsHero({
  totalProducts,
  averageDiscount,
  totalSavings,
  biggestDiscount
}: PromotionsHeroProps) {
  // ✅ ANIMATION DES COMPTEURS
  const [animatedStats, setAnimatedStats] = useState({
    products: 0,
    discount: 0,
    savings: 0,
    biggest: 0
  });

  useEffect(() => {
    const duration = 2000; // 2 secondes d'animation
    const steps = 60; // 60 étapes pour une animation fluide
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Animation avec easing (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        products: Math.floor(totalProducts * easedProgress),
        discount: Math.floor(averageDiscount * easedProgress),
        savings: Math.floor(totalSavings * easedProgress),
        biggest: Math.floor(biggestDiscount * easedProgress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        // S'assurer que les valeurs finales sont exactes
        setAnimatedStats({
          products: totalProducts,
          discount: averageDiscount,
          savings: totalSavings,
          biggest: biggestDiscount
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [totalProducts, averageDiscount, totalSavings, biggestDiscount]);

  return (
    <div className="relative overflow-hidden">
      {/* BACKGROUND GRADIENT ANIMÉ */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 animate-gradient-x"></div>
      
      {/* MOTIFS DÉCORATIFS */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-rose-200 rounded-full opacity-20 -translate-x-16 -translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-300 rounded-full opacity-30 translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-red-200 rounded-full opacity-15 translate-x-20 translate-y-20"></div>

      {/* CONTENU PRINCIPAL */}
      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-3 sm:px-4">
        {/* EN-TÊTE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="animate-pulse">🔥</span>
            <span>Promotions Exceptionnelles</span>
            <span className="animate-pulse">🔥</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Jusqu&apos;à <span className="text-red-600">{animatedStats.biggest}%</span> de Réduction
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Profitez de nos <strong>offres flash</strong> sur une sélection exceptionnelle de produits de beauté. 
            Des <strong>économies garanties</strong> sur vos marques préférées !
          </p>
        </div>

        {/* STATISTIQUES ANIMÉES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* NOMBRE DE PRODUITS */}
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-rose-600 mb-1">
              {animatedStats.products.toLocaleString()}+
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Produits en Promo
            </div>
            <div className="text-xs text-gray-500 mt-1">
              🎁 Sélection premium
            </div>
          </div>

          {/* REMISE MOYENNE */}
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 mb-1">
              {animatedStats.discount}%
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Remise Moyenne
            </div>
            <div className="text-xs text-gray-500 mt-1">
              💰 Prix imbattables
            </div>
          </div>

          {/* ÉCONOMIES TOTALES */}
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-1">
              {formatPrice(animatedStats.savings)}
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Économies Possibles
            </div>
            <div className="text-xs text-gray-500 mt-1">
              💸 Votre portefeuille dit merci
            </div>
          </div>

          {/* PLUS GROSSE REMISE */}
          <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 col-span-2 lg:col-span-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-1">
              -{animatedStats.biggest}%
            </div>
            <div className="text-sm sm:text-base text-gray-700 font-medium">
              Plus Grosse Remise
            </div>
            <div className="text-xs text-gray-500 mt-1">
              🎯 Affaire exceptionnelle
            </div>
          </div>
        </div>

        {/* CALL TO ACTION */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            
            {/* BOUTON PRINCIPAL */}
            <button
              onClick={() => {
                // Scroll vers les produits
                const productsSection = document.querySelector('[data-products-grid]');
                if (productsSection) {
                  productsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }
              }}
              className="group bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
            >
              <span>Voir Toutes les Promos</span>
              <div className="flex">
                <span className="animate-bounce delay-0">🛍️</span>
                <span className="animate-bounce delay-100">✨</span>
                <span className="animate-bounce delay-200">🎉</span>
              </div>
            </button>

            {/* INFO LIVRAISON */}
            <div className="flex items-center gap-2 text-gray-700 bg-white/60 px-4 py-3 rounded-lg border border-white/50">
              <span className="text-green-600">📦</span>
              <span className="font-medium text-sm">
                Livraison <strong>GRATUITE</strong> dès 300 DH
              </span>
            </div>
          </div>

          {/* TAGS PROMOTIONNELS */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
              ⏰ Quantités limitées
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
              🚀 Livraison express
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
              ✅ Paiement à la livraison
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
              🛡️ Produits authentiques
            </span>
          </div>
        </div>
      </div>

      {/* ANIMATION CSS POUR LE GRADIENT */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </div>
  );
}