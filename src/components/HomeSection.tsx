"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/client/ProductCard';
import { 
  getCategoryProductsWithBrands, 
  getCategoryBySlug,
  getSubCategoryProductsWithBrands,
  getSubCategoryBySlug 
} from '@/lib/firebase-utils';
import type { Product, Category, SubCategory } from '@/lib/types';

interface HomeSectionProps {
  /** Slug de la catégorie à afficher (optionnel si subCategorySlug est fourni) */
  categorySlug?: string;
  /** Slug de la sous-catégorie à afficher (prioritaire sur categorySlug) */
  subCategorySlug?: string;
  /** Titre de la section (optionnel, sinon utilise le nom de la catégorie/sous-catégorie) */
  title?: string;
  /** Nombre maximum de produits à afficher (défaut: 5) */
  maxProducts?: number;
  /** Afficher le bouton "Voir plus" */
  showViewMore?: boolean;
  /** Classes CSS supplémentaires */
  containerClass?: string;
}

interface HomeSectionState {
  products: Product[];
  category: Category | null;
  subCategory: SubCategory | null;
  loading: boolean;
  error: string | null;
}

/**
 * Composant HomeSection - Affiche des produits d'une catégorie OU d'une sous-catégorie spécifique
 * 🆕 Supporte maintenant l'affichage d'une sous-catégorie uniquement
 * ✅ CORRIGÉ : Ajout du H2 obligatoire pour la hiérarchie SEO
 */
const HomeSection: React.FC<HomeSectionProps> = ({
  categorySlug,
  subCategorySlug,
  title,
  maxProducts = 5,
  showViewMore = true,
  containerClass = ""
}) => {
  const [state, setState] = useState<HomeSectionState>({
    products: [],
    category: null,
    subCategory: null,
    loading: true,
    error: null
  });

  /**
   * Charge les données selon si c'est une catégorie ou sous-catégorie
   */
  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 🆕 PRIORITÉ : Si subCategorySlug est fourni, on affiche SEULEMENT cette sous-catégorie
      if (subCategorySlug) {
        console.log(`🎯 Chargement sous-catégorie: ${subCategorySlug}`);
        
        // ✅ CORRIGÉ : Recherche avec categorySlug parent si fourni
        const subCategory = categorySlug 
          ? await getSubCategoryBySlug(subCategorySlug, categorySlug)
          : await getSubCategoryBySlug(subCategorySlug);
        
        if (!subCategory) {
          throw new Error(`Sous-catégorie "${subCategorySlug}" introuvable`);
        }

        // Récupérer les produits de cette sous-catégorie uniquement
        const products = await getSubCategoryProductsWithBrands(subCategory.id);
        
        // ✅ CORRIGÉ : Récupérer aussi la catégorie parente pour le lien "Voir plus"
        let parentCategory = null;
        if (categorySlug) {
          parentCategory = await getCategoryBySlug(categorySlug);
        } else if (subCategory.categoryId) {
          // Fallback : chercher par ID si pas de slug fourni
          const categories = await getCategoryProductsWithBrands(subCategory.categoryId);
          // Cette logique pourrait nécessiter une fonction getCategoryById
        }

        // Limiter le nombre de produits (déjà triés par score dans la fonction)
        const limitedProducts = products.slice(0, maxProducts);

        setState({
          products: limitedProducts,
          category: parentCategory,
          subCategory,
          loading: false,
          error: null
        });

        console.log(`✅ Sous-catégorie "${subCategory.name}": ${limitedProducts.length}/${products.length} produits chargés`);
        
      } else if (categorySlug) {
        // Comportement normal pour catégorie principale
        console.log(`📦 Chargement catégorie: ${categorySlug}`);
        
        const category = await getCategoryBySlug(categorySlug);
        
        if (!category) {
          throw new Error(`Catégorie "${categorySlug}" introuvable`);
        }

        const products = await getCategoryProductsWithBrands(category.id);

        // Limiter le nombre de produits et les trier par score
        const limitedProducts = products
          .sort((a, b) => b.score - a.score)
          .slice(0, maxProducts);

        setState({
          products: limitedProducts,
          category,
          subCategory: null,
          loading: false,
          error: null
        });

        console.log(`✅ Catégorie "${category.name}": ${limitedProducts.length}/${products.length} produits chargés`);
        
      } else {
        throw new Error('categorySlug ou subCategorySlug est requis');
      }

    } catch (error) {
      console.error('Erreur lors du chargement de la section:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de chargement'
      }));
    }
  };

  /**
   * Chargement initial
   */
  useEffect(() => {
    if (categorySlug || subCategorySlug) {
      loadData();
    }
  }, [categorySlug, subCategorySlug, maxProducts]);

  /**
   * ✅ CORRIGÉ : Gestion du clic "Voir plus" avec navigation appropriée
   */
  const handleViewMore = () => {
    if (state.subCategory && state.category) {
      // Si c'est une sous-catégorie, aller vers la page de la sous-catégorie
      window.location.href = `/categories/${state.category.slug}/${state.subCategory.slug}`;
    } else if (state.category) {
      // Si c'est une catégorie, aller vers la page de la catégorie
      window.location.href = `/categories/${state.category.slug}`;
    }
  };

  /**
   * ✅ NOUVEAU : Obtenir le titre à afficher avec priorité au prop title
   */
  const getDisplayTitle = (): string => {
    if (title) return title;
    if (state.subCategory) return state.subCategory.name;
    if (state.category) return state.category.name;
    return 'Nos Produits';
  };

  /**
   * ✅ NOUVEAU : Obtenir la description contextuelle si disponible
   */
  const getDisplayDescription = (): string | null => {
    if (state.subCategory?.description) return state.subCategory.description;
    if (state.category?.description) return state.category.description;
    return null;
  };

  /**
   * Affichage du loading
   */
  if (state.loading) {
    return (
      <section className={`py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1700px] mx-auto px-4">
          {/* Header avec skeleton */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          
          {/* Skeleton des produits */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(maxProducts)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /**
   * Affichage d'erreur
   */
  if (state.error) {
    return (
      <section className={`py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1700px] mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            {/* ✅ CORRIGÉ : Titre d'erreur en H3 (respecte la hiérarchie) */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-6">{state.error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center px-6 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  /**
   * Pas de produits
   */
  if (state.products.length === 0) {
    return (
      <section className={`py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1700px] mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* ✅ CORRIGÉ : État vide en H3 (respecte la hiérarchie) */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {getDisplayTitle()}
            </h3>
            <p className="text-gray-500">
              Aucun produit disponible dans cette {state.subCategory ? 'sous-catégorie' : 'catégorie'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  /**
   * ✅ CORRIGÉ : Affichage principal avec H2 obligatoire et structure améliorée
   */
  return (
    <section className={`py-10 bg-white ${containerClass}`}>
      <div className="max-w-[1700px] mx-auto px-4">
        
        {/* ✅ CORRECTION PRINCIPALE : Header avec H2 obligatoire pour SEO */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {/* ✅ H2 OBLIGATOIRE pour chaque section de la page d'accueil */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {getDisplayTitle()}
            </h2>
            
            {/* ✅ NOUVEAU : Description contextuelle si disponible */}
            {getDisplayDescription() && (
              <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                {getDisplayDescription()}
              </p>
            )}
            
            {/* ✅ NOUVEAU : Badge contextuel pour sous-catégories */}
            {state.subCategory && state.category && (
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 text-sm bg-rose-100 text-rose-700 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {state.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Lien "Voir plus" optimisé */}
          {showViewMore && (state.category || state.subCategory) && (
            <div className="flex-shrink-0 ml-6">
              <button
                onClick={handleViewMore}
                className="inline-flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors group"
                aria-label={`Voir tous les produits ${getDisplayTitle()}`}
              >
                <span>Voir plus</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ✅ AMÉLIORÉ : Grille des produits avec ProductCard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {state.products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product}
              priority={index < 6} // Les 6 premiers en priorité pour le LCP
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomeSection;