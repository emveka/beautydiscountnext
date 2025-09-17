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
 * ✅ Onglet Avis avec système de notation
 * ✅ Icônes CSS simples (pas de dépendances)
 * ✅ Navigation clavier accessible
 * ✅ Animations fluides
 * ✅ CORRIGÉ : Hiérarchie H3-H4 appropriée pour le SEO
 */
export default function ProductTabs({ product, category, subCategory }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  
  // Données factices pour les avis (à remplacer par de vraies données)
  const mockReviews = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "15 Sept 2025",
      comment: "Excellent produit ! Très satisfaite de mon achat. La qualité est au rendez-vous.",
      verified: true
    },
    {
      id: 2,
      author: "Amina K.",
      rating: 4,
      date: "10 Sept 2025",
      comment: "Bon produit, conforme à mes attentes. Livraison rapide.",
      verified: true
    },
    {
      id: 3,
      author: "Fatima L.",
      rating: 5,
      date: "5 Sept 2025",
      comment: "Je recommande vivement ! Résultats visibles dès les premières utilisations.",
      verified: false
    }
  ];
  
  const averageRating = mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length;
  
  // Configuration des onglets avec icônes CSS
  const tabs = [
    { 
      id: 'description', 
      label: 'Description', 
      icon: '📝' // Emoji comme icône
    },
    { 
      id: 'specs', 
      label: 'Caractéristiques', 
      icon: '⚙️'
    },
    { 
      id: 'reviews', 
      label: `Avis (${mockReviews.length})`, 
      icon: '💬'
    }
  ] as const;
  
  // Fonction pour afficher les étoiles
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'text-sm' : 'text-lg';
    return (
      <div className={`flex items-center space-x-1 ${sizeClass}`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
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
        <nav className="flex space-x-8 px-6" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Contenu des onglets */}
      <div className="p-6">
        {/* ✅ CORRIGÉ : Onglet Description avec hiérarchie H3 > H4 */}
        {activeTab === 'description' && (
          <div id="panel-description" role="tabpanel" className="space-y-6 animate-fadeIn">
            {/* H3 principal pour l'onglet (masqué visuellement) */}
            <h3 className="sr-only">Description détaillée du produit</h3>
            
            {/* Contenu principal de la description */}
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed text-base">
                {product.description || "Aucune description disponible pour ce produit."}
              </div>
            </div>
            
            {/* ✅ CORRIGÉ : Informations contextuelles en H4 */}
            {(category || subCategory) && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2" aria-hidden="true">ℹ️</span>
                  À propos de cette catégorie
                </h4>
                <div className="text-gray-600 text-sm space-y-3">
                  {subCategory?.description && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p><strong className="text-blue-700">{subCategory.name}:</strong> {subCategory.description}</p>
                    </div>
                  )}
                  {category?.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong className="text-gray-700">{category.name}:</strong> {category.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* ✅ CORRIGÉ : Conseils d'utilisation en H4 */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2" aria-hidden="true">💡</span>
                Conseils d&apos;utilisation
              </h4>
              <div className="bg-amber-50 p-4 rounded-lg">
                <ul className="text-sm text-amber-800 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600" aria-hidden="true">•</span>
                    Lisez attentivement les instructions avant utilisation
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600" aria-hidden="true">•</span>
                    Effectuez un test de sensibilité avant la première utilisation
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600" aria-hidden="true">•</span>
                    Conservez dans un endroit frais et sec
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-amber-600" aria-hidden="true">•</span>
                    Tenez hors de portée des enfants
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* ✅ CORRIGÉ : Onglet Caractéristiques avec hiérarchie H3 > H4 */}
        {activeTab === 'specs' && (
          <div id="panel-specs" role="tabpanel" className="space-y-6 animate-fadeIn">
            {/* H3 principal pour l'onglet (masqué visuellement) */}
            <h3 className="sr-only">Caractéristiques techniques du produit</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* ✅ CORRIGÉ : H4 pour les sous-sections */}
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2" aria-hidden="true">📋</span>
                  Informations produit
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700 flex items-center">
                        <span className="mr-2" aria-hidden="true">🏷️</span>
                        Marque
                      </dt>
                      <dd className="text-gray-600 font-medium">{product.brandName || 'Non spécifiée'}</dd>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700 flex items-center">
                        <span className="mr-2" aria-hidden="true">🔢</span>
                        Référence
                      </dt>
                      <dd className="text-gray-600 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {product.sku}
                      </dd>
                    </div>
                    
                    {product.contenance && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <dt className="font-medium text-gray-700 flex items-center">
                          <span className="mr-2" aria-hidden="true">📏</span>
                          Contenance
                        </dt>
                        <dd className="text-gray-600 font-medium">{product.contenance}</dd>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <dt className="font-medium text-gray-700 flex items-center">
                        <span className="mr-2" aria-hidden="true">📂</span>
                        Catégorie
                      </dt>
                      <dd className="text-gray-600">
                        {subCategory?.name || category?.name || 'Non classé'}
                      </dd>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <dt className="font-medium text-gray-700 flex items-center">
                        <span className="mr-2" aria-hidden="true">📦</span>
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
              
              <div className="space-y-4">
                {/* ✅ CORRIGÉ : H4 pour les sous-sections */}
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <span className="mr-2" aria-hidden="true">🛡️</span>
                  Sécurité &amp; Qualité
                </h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <span className="mr-2" aria-hidden="true">✅</span>
                      <span className="font-medium text-green-700">Produit authentique</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Garantie d&apos;authenticité sur tous nos produits
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <span className="mr-2" aria-hidden="true">🧪</span>
                      <span className="font-medium text-blue-700">Testé dermatologiquement</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Convient à tous types de peau
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <span className="mr-2" aria-hidden="true">🌿</span>
                      <span className="font-medium text-purple-700">Ingrédients naturels</span>
                    </div>
                    <p className="text-sm text-purple-600">
                      Formulation respectueuse de l&apos;environnement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* ✅ CORRIGÉ : Onglet Avis avec hiérarchie H3 > H4 */}
        {activeTab === 'reviews' && (
          <div id="panel-reviews" role="tabpanel" className="space-y-6 animate-fadeIn">
            {/* H3 principal pour l'onglet (masqué visuellement) */}
            <h3 className="sr-only">Avis et évaluations clients</h3>
            
            {/* Résumé des avis */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating), 'md')}
                  </div>
                  <p className="text-gray-600">
                    Basé sur {mockReviews.length} avis
                  </p>
                </div>
                
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = mockReviews.filter(r => r.rating === rating).length;
                    const percentage = (count / mockReviews.length) * 100;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 w-8 flex items-center">
                          {rating}<span className="ml-1" aria-hidden="true">★</span>
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                            role="progressbar"
                            aria-valuenow={percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${count} avis ${rating} étoiles`}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* ✅ CORRIGÉ : Liste des avis avec H4 */}
            <div className="space-y-6">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <span className="mr-2" aria-hidden="true">💭</span>
                Commentaires détaillés
              </h4>
              
              {mockReviews.map((review) => (
                <article key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900">{review.author}</h5>
                        {review.verified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                            <span className="mr-1" aria-hidden="true">✓</span>
                            Achat vérifié
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderStars(review.rating)}
                        <time className="text-sm text-gray-500" dateTime={review.date}>
                          {review.date}
                        </time>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </article>
              ))}
            </div>
            
            {/* Bouton pour laisser un avis */}
            <div className="border-t border-gray-200 pt-6">
              <button 
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                type="button"
              >
                <span className="mr-2" aria-hidden="true">✏️</span>
                Laisser un avis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}