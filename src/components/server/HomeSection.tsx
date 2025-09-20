"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/client/ProductCard';
import { 
  getCategoryProductsWithBrands, 
  getCategoryBySlug,
  getSubCategoryProductsWithBrands,
  getSubCategoryBySlug 
} from '@/lib/firebase-utils';
import type { Product, Category, SubCategory } from '@/lib/types';

interface HomeSectionProps {
  categorySlug?: string;
  subCategorySlug?: string;
  title?: string;
  maxProducts?: number;
  showViewMore?: boolean;
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
 * HomeSection optimisé pour mobile avec gestion d'erreurs ESLint corrigée
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

  // Utilisation de useCallback pour stabiliser la fonction loadData
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (subCategorySlug) {
        const subCategory = categorySlug 
          ? await getSubCategoryBySlug(subCategorySlug, categorySlug)
          : await getSubCategoryBySlug(subCategorySlug);
        
        if (!subCategory) {
          throw new Error(`Sous-catégorie "${subCategorySlug}" introuvable`);
        }

        const products = await getSubCategoryProductsWithBrands(subCategory.id);
        
        let parentCategory = null;
        if (categorySlug) {
          parentCategory = await getCategoryBySlug(categorySlug);
        }

        const limitedProducts = products.slice(0, maxProducts);

        setState({
          products: limitedProducts,
          category: parentCategory,
          subCategory,
          loading: false,
          error: null
        });
        
      } else if (categorySlug) {
        const category = await getCategoryBySlug(categorySlug);
        
        if (!category) {
          throw new Error(`Catégorie "${categorySlug}" introuvable`);
        }

        const products = await getCategoryProductsWithBrands(category.id);

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
        
      } else {
        throw new Error('categorySlug ou subCategorySlug est requis');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur de chargement'
      }));
    }
  }, [categorySlug, subCategorySlug, maxProducts]); // Dépendances stables

  useEffect(() => {
    if (categorySlug || subCategorySlug) {
      loadData();
    }
  }, [categorySlug, subCategorySlug, loadData]); // Maintenant loadData est inclus

  const handleViewMore = () => {
    if (state.subCategory && state.category) {
      window.location.href = `/categories/${state.category.slug}/${state.subCategory.slug}`;
    } else if (state.category) {
      window.location.href = `/categories/${state.category.slug}`;
    }
  };

  const getDisplayTitle = (): string => {
    if (title) return title;
    if (state.subCategory) return state.subCategory.name;
    if (state.category) return state.category.name;
    return 'Nos Produits';
  };

  const getDisplayDescription = (): string | null => {
    if (state.subCategory?.description) return state.subCategory.description;
    if (state.category?.description) return state.category.description;
    return null;
  };

  // Loading state avec skeleton optimisé
  if (state.loading) {
    return (
      <section className={`py-6 sm:py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center mb-4 sm:mb-8">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-48 sm:w-64 animate-pulse"></div>
              
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6">
            {[...Array(maxProducts)].map((_, index) => (
              <div key={index} className="bg-white rounded border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-2 sm:h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (state.error) {
    return (
      <section className={`py-6 sm:py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-400 mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{state.error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-rose-500 text-white font-semibold rounded hover:bg-rose-600 transition-colors text-sm sm:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (state.products.length === 0) {
    return (
      <section className={`py-6 sm:py-12 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {getDisplayTitle()}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Aucun produit disponible dans cette {state.subCategory ? 'sous-catégorie' : 'catégorie'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Main render
  return (
    <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
        
        {/* Header section */}
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {getDisplayTitle()}
            </h2>
            
            {getDisplayDescription() && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {getDisplayDescription()}
              </p>
            )}
            
            {state.subCategory && state.category && (
              <div className="mt-2 sm:mt-3">
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-rose-100 text-rose-700 rounded">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {state.category.name}
                </span>
              </div>
            )}
          </div>

          {showViewMore && (state.category || state.subCategory) && (
            <div className="flex-shrink-0 ml-3 sm:ml-6">
              <button
                onClick={handleViewMore}
                className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors group"
                aria-label={`Voir tous les produits ${getDisplayTitle()}`}
              >
                <span className="hidden sm:inline">Voir plus</span>
                <span className="sm:hidden">Plus</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3">
          {state.products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product}
              priority={index < 6}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default HomeSection;