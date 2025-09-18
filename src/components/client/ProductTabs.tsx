// components/client/ProductTabs.tsx
'use client';

import { useState } from 'react';
import type { Product, Category, SubCategory } from '@/lib/types';

interface ProductTabsProps {
  product: Product;
  category: Category | null;
  subCategory: SubCategory | null;
}

/**
 * Composant ProductTabs - Onglets d'informations produit
 * 
 * Fonctionnalités :
 * ✅ Onglet Description avec contenu riche
 * ✅ Onglet Caractéristiques avec tableau
 * ✅ Navigation clavier accessible
 * ✅ Animations fluides
 * ✅ Sans icônes - Design épuré
 * ✅ Hiérarchie H3-H4 appropriée pour le SEO
 */
export default function ProductTabs({ product, category, subCategory }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  
  // Configuration des onglets sans icônes
  const tabs = [
    { 
      id: 'description', 
      label: 'Description'
    },
    { 
      id: 'specs', 
      label: 'Caractéristiques'
    },
  ] as const;
  
  // Gestion de la navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent, tabId: typeof activeTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Navigation des onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-3 sm:px-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="p-3 sm:p-6">
        {/* Onglet Description */}
        {activeTab === 'description' && (
          <div id="panel-description" role="tabpanel" className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* H3 principal pour l'onglet (masqué visuellement) */}
            <h3 className="sr-only">Description détaillée du produit</h3>
            
            {/* Contenu principal de la description */}
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.description || "Aucune description disponible pour ce produit."}
              </div>
            </div>
            
            {/* Informations contextuelles */}
            {(category || subCategory) && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  À propos de cette catégorie
                </h4>
                <div className="text-gray-600 text-sm space-y-3">
                  {subCategory?.description && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <p><strong className="text-blue-700">{subCategory.name}:</strong> {subCategory.description}</p>
                    </div>
                  )}
                  {category?.description && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p><strong className="text-gray-700">{category.name}:</strong> {category.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Conseils d'utilisation */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Conseils d&apos;utilisation
              </h4>
              <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600">•</span>
                    Lisez attentivement les instructions avant utilisation
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600">•</span>
                    Effectuez un test de sensibilité avant la première utilisation
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600">•</span>
                    Conservez dans un endroit frais et sec
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600">•</span>
                    Tenez hors de portée des enfants
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Onglet Caractéristiques */}
        {activeTab === 'specs' && (
          <div id="panel-specs" role="tabpanel" className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* H3 principal pour l'onglet (masqué visuellement) */}
            <h3 className="sr-only">Caractéristiques techniques du produit</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
              <div className="space-y-4">
                {/* Informations produit */}
                <h4 className="font-semibold text-gray-900">
                  Informations produit
                </h4>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700">
                        Marque
                      </dt>
                      <dd className="text-gray-600 font-medium text-right">{product.brandName || 'Non spécifiée'}</dd>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700">
                        Référence
                      </dt>
                      <dd className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </dd>
                    </div>
                    
                    {product.contenance && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <dt className="font-medium text-gray-700">
                          Contenance
                        </dt>
                        <dd className="text-gray-600 font-medium text-right">{product.contenance}</dd>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700">
                        Catégorie
                      </dt>
                      <dd className="text-gray-600 text-right">
                        {subCategory?.name || category?.name || 'Non classé'}
                      </dd>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <dt className="font-medium text-gray-700">
                        Disponibilité
                      </dt>
                      <dd className={`font-medium ${
                        product.stock === 'En Stock' 
                          ? 'text-green-600' 
                          : product.stock === 'Sur Commande'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}>
                        {product.stock}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}