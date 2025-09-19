// components/client/PromotionsSkeleton.tsx - SKELETON LOADING PROMOTIONS
"use client";

import React from 'react';

/**
 * Composant Skeleton pour la page promotions
 * Affichage pendant le chargement des données
 */
export default function PromotionsSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6">
      
      {/* SKELETON HEADER */}
      <div className="text-center mb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
        </div>
      </div>

      {/* SKELETON FILTRES */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          
          {/* Filtres de gauche */}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 h-10 w-24 rounded-lg"
              ></div>
            ))}
          </div>

          {/* Tri à droite */}
          <div className="animate-pulse bg-gray-200 h-10 w-32 rounded-lg"></div>
        </div>
      </div>

      {/* SKELETON GRID PRODUITS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Répéter 24 cartes skeleton */}
        {Array.from({ length: 24 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-gray-200"></div>
            
            {/* Contenu skeleton */}
            <div className="p-3 space-y-2">
              
              {/* Badge promo skeleton */}
              <div className="h-4 bg-red-200 rounded w-16"></div>
              
              {/* Titre skeleton */}
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
              
              {/* Marque skeleton */}
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              
              {/* Prix skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-300 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-10"></div>
              </div>
              
              {/* Bouton skeleton */}
              <div className="h-8 bg-gray-200 rounded w-full mt-3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* SKELETON PAGINATION */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 h-10 w-10 rounded-lg"
            ></div>
          ))}
        </div>
      </div>

      {/* SKELETON INFO SECTION */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 rounded-lg p-6"
          >
            <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composant Skeleton pour une carte produit promo individuelle
 */
export function PromotionProductSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
      
      {/* Badge promo skeleton */}
      <div className="relative">
        <div className="aspect-square bg-gray-200"></div>
        <div className="absolute top-2 left-2 h-6 w-12 bg-red-200 rounded"></div>
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
        
        {/* Prix et remise skeleton */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-300 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-3 bg-green-200 rounded w-20"></div>
        </div>
        
        {/* Boutons skeleton */}
        <div className="flex gap-1 mt-3">
          <div className="flex-1 h-8 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant Skeleton pour les statistiques de promotion
 */
export function PromotionStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/50"
        >
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
          <div className="h-3 bg-gray-100 rounded w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}