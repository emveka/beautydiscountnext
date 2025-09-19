// components/client/PromotionsSkeleton.tsx - SKELETON LOADING PROMOTIONS CORRIGÉ
"use client";

import React from 'react';

/**
 * Composant Skeleton pour la page promotions SIMPLIFIÉ
 * Affichage pendant le chargement des données
 * 
 * ✅ CORRIGÉ : Support 1500px largeur
 * ✅ CORRIGÉ : Grid conforme au ProductGrid (xl:grid-cols-5)
 * ✅ CORRIGÉ : Suppression des sections qui n'existent plus
 * ✅ CORRIGÉ : Structure identique au ProductGrid réel
 */
export default function PromotionsSkeleton() {
  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 py-8">
      
      {/* SKELETON FILTRES PROMOTIONS */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-red-200 rounded w-48 mb-4"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SKELETON HEADER AVEC TITRE ET CONTRÔLES */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="animate-pulse">
            {/* Titre H1 */}
            <div className="h-8 lg:h-10 bg-gray-200 rounded-lg w-64 mb-2"></div>
            {/* Stats */}
            <div className="h-5 bg-gray-200 rounded w-48"></div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Bouton filtres mobile */}
          <div className="lg:hidden animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
          {/* Sélecteur de tri */}
          <div className="animate-pulse bg-gray-200 h-10 w-36 rounded-lg"></div>
        </div>
      </div>

      <div className="flex gap-2">
        
        {/* SKELETON SIDEBAR FILTRES (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                {/* Header filtres */}
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>

                {/* Sections de filtres */}
                {[1, 2, 3, 4, 5].map((section) => (
                  <div key={section} className="mb-6">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-200 rounded"></div>
                            <div className="ml-2 h-4 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-6"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* SKELETON MAIN CONTENT */}
        <main className="flex-1">
          
          {/* SKELETON TAGS FILTRES ACTIFS */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-rose-100 h-7 w-20 rounded-full"
              ></div>
            ))}
          </div>

          {/* SKELETON GRID PRODUITS - ✅ CORRIGÉ : Correspond au ProductGrid réel */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-2 mb-8">
            
            {/* Répéter 20 cartes skeleton (une page) */}
            {Array.from({ length: 20 }, (_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Image skeleton avec badges promotions */}
                <div className="relative">
                  <div className="aspect-square bg-gray-200"></div>
                  {/* Badge promo skeleton */}
                  <div className="absolute top-2 left-2 h-5 w-12 bg-red-200 rounded"></div>
                  {/* Bouton favori skeleton */}
                  <div className="absolute top-2 right-2 h-6 w-6 bg-gray-300 rounded-full"></div>
                </div>
                
                {/* Contenu skeleton */}
                <div className="p-3 space-y-2">
                  
                  {/* Titre skeleton */}
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  
                  {/* Marque skeleton */}
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  
                  {/* Prix et remise skeleton */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-300 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-10 line-through"></div>
                    </div>
                    <div className="h-3 bg-green-200 rounded w-20"></div>
                  </div>
                  
                  {/* Bouton skeleton */}
                  <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
                </div>
              </div>
            ))}
          </div>

          {/* SKELETON PAGINATION */}
          <div className="flex items-center justify-center mt-12 space-x-2">
            <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-lg"></div>
            
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-10 w-10 rounded-lg"
              ></div>
            ))}
            
            <div className="animate-pulse bg-gray-200 h-10 w-16 rounded-lg"></div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Composant Skeleton pour une carte produit promo individuelle
 * ✅ OPTIMISÉ pour les promotions avec badges
 */
export function PromotionProductSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
      
      {/* Image avec badges promotion */}
      <div className="relative">
        <div className="aspect-square bg-gray-200"></div>
        {/* Badge pourcentage promo */}
        <div className="absolute top-2 left-2 h-5 w-12 bg-red-200 rounded"></div>
        {/* Badge "Hot Deal" ou "Best Deal" */}
        <div className="absolute top-8 left-2 h-4 w-16 bg-orange-200 rounded"></div>
        {/* Bouton favori */}
        <div className="absolute top-2 right-2 h-6 w-6 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Contenu skeleton */}
      <div className="p-3 space-y-2">
        
        {/* Titre skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Marque skeleton */}
        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
        
        {/* Contenance skeleton */}
        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
        
        {/* Prix et économies skeleton */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12 opacity-60"></div>
          </div>
          <div className="h-3 bg-green-200 rounded w-24"></div>
          <div className="h-3 bg-blue-200 rounded w-20"></div>
        </div>
        
        {/* Boutons skeleton */}
        <div className="flex gap-1 mt-3">
          <div className="flex-1 h-8 bg-rose-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * ❌ SUPPRIMÉ : PromotionStatsSkeleton
 * Plus utilisé car le Hero Section n'existe plus
 */

/* ✅ CORRECTIONS APPLIQUÉES :
 *
 * 1. max-w-7xl → max-w-[1500px] (Support 1500px)
 * 2. Grid : xl:grid-cols-6 → xl:grid-cols-5 (Conforme au ProductGrid)
 * 3. SUPPRIMÉ : "SKELETON INFO SECTION" (n'existe plus)
 * 4. AJOUTÉ : Filtres promotions en haut
 * 5. AJOUTÉ : Sidebar avec filtres détaillés
 * 6. AJOUTÉ : Tags filtres actifs
 * 7. AMÉLIORÉ : Badges promotions sur les cartes
 * 8. OPTIMISÉ : Structure identique au ProductGrid réel
 *
 * RÉSULTAT : Skeleton parfaitement aligné sur votre nouvelle page simplifiée
 */