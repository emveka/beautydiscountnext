// components/client/ProductGrid.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Product, SubCategory } from '@/lib/types';
import { isProductOnSale } from '@/lib/firebase-utils';

interface ProductGridProps {
  products: Product[];
  categorySlug?: string;
  categoryName?: string;
  subCategories?: SubCategory[];
  currentSubCategoryId?: string;
    showPageTitle?: boolean; // ✅ NOUVEAU : Contrôle l'affichage du H1
}

type SortOption = 'score' | 'price-low' | 'price-high' | 'newest' | 'name' | 'discount';

interface Filters {
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  subCategories: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

interface BrandWithCount {
  id: string;
  name: string;
  count: number;
}

interface SubCategoryWithCount {
  id: string;
  name: string;
  slug: string;
  count: number;
}

/**
 * Composant ProductGridSkeleton intégré
 */
function ProductGridSkeleton() {
  return (
    <div className="px-4 py-8">
      {/* Header skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="lg:hidden h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            {[1, 2, 3, 4].map((filter) => (
              <div key={filter} className="mb-6">
                <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((option) => (
                    <div key={option} className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="ml-2 h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 mb-8">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                  <div className="space-y-1 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16 mb-3 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProductGrid({ 
  products, 
  categorySlug, 
  categoryName, 
  subCategories = [],
  currentSubCategoryId,
  showPageTitle = true // ✅ NOUVEAU : Par défaut true pour la rétrocompatibilité 
}: ProductGridProps) {
  // États
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    inStock: false,
    onSale: false,
    brands: [],
    subCategories: [],
    priceRange: { min: 0, max: 0 }
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // État de chargement initial
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Calcul des valeurs min/max pour les prix
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }, [products]);

  // Initialisation et gestion du loading
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: priceRange
    }));
    
    // Marquer comme chargé après un court délai pour permettre le rendu
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [priceRange, products]);

  // Extraction des marques avec noms et comptage
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, BrandWithCount>();
    
    products.forEach(product => {
      if (product.brandId) {
        const existingBrand = brandMap.get(product.brandId);
        
        if (existingBrand) {
          existingBrand.count++;
        } else {
          const displayName = product.brandName || product.brandId;
          
          brandMap.set(product.brandId, {
            id: product.brandId,
            name: displayName,
            count: 1
          });
        }
      }
    });
    
    return Array.from(brandMap.values())
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Extraction des sous-catégories adaptée
  const availableSubCategories = useMemo(() => {
    if (currentSubCategoryId) {
      return subCategories
        .filter(subCat => subCat.id !== currentSubCategoryId)
        .map(subCat => ({
          id: subCat.id,
          name: subCat.name,
          slug: subCat.slug,
          count: subCat.productCount || 0
        }))
        .sort((a, b) => b.count - a.count);
    }
    
    const subCategoryMap = new Map<string, SubCategoryWithCount>();
    
    products.forEach(product => {
      if (product.subCategoryId) {
        const existingSubCat = subCategoryMap.get(product.subCategoryId);
        
        if (existingSubCat) {
          existingSubCat.count++;
        } else {
          const subCatData = subCategories.find(sc => sc.id === product.subCategoryId);
          const displayName = subCatData?.name || product.subCategoryId;
          const slug = subCatData?.slug || product.subCategoryId;
          
          subCategoryMap.set(product.subCategoryId, {
            id: product.subCategoryId,
            name: displayName,
            slug: slug,
            count: 1
          });
        }
      }
    });
    
    return Array.from(subCategoryMap.values())
      .sort((a, b) => b.count - a.count);
  }, [products, subCategories, currentSubCategoryId]);

  // Fonctions utilitaires
  const getBrandDisplayName = (brandId: string): string => {
    const brand = availableBrands.find(b => b.id === brandId);
    return brand?.name || brandId;
  };

  const getSubCategoryDisplayName = (subCategoryId: string): string => {
    const subCat = availableSubCategories.find(sc => sc.id === subCategoryId);
    return subCat?.name || subCategoryId;
  };

  // Tri et filtrage
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock === "En Stock");
    }
    
    if (filters.onSale) {
      filtered = filtered.filter(p => isProductOnSale(p));
    }
    
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => p.brandId && filters.brands.includes(p.brandId));
    }
    
    if (filters.subCategories.length > 0 && !currentSubCategoryId) {
      filtered = filtered.filter(p => p.subCategoryId && filters.subCategories.includes(p.subCategoryId));
    }
    
    if (filters.priceRange.min > priceRange.min || filters.priceRange.max < priceRange.max) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }

    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
        return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr', { numeric: true }));
      case 'discount':
        return filtered.sort((a, b) => {
          const aDiscount = isProductOnSale(a) ? ((a.originalPrice! - a.price) / a.originalPrice!) * 100 : 0;
          const bDiscount = isProductOnSale(b) ? ((b.originalPrice! - b.price) / b.originalPrice!) * 100 : 0;
          return bDiscount - aDiscount;
        });
      case 'score':
      default:
        return filtered.sort((a, b) => b.score - a.score);
    }
  }, [products, sortBy, filters, priceRange.min, priceRange.max, currentSubCategoryId]);

  // Pagination
  const itemsPerPage = 24;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleBrandToggle = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter(b => b !== brandId)
      : [...filters.brands, brandId];
    
    handleFilterChange({ brands: newBrands });
  };

  const handleSubCategoryToggle = (subCategoryId: string) => {
    const newSubCategories = filters.subCategories.includes(subCategoryId)
      ? filters.subCategories.filter(sc => sc !== subCategoryId)
      : [...filters.subCategories, subCategoryId];
    
    handleFilterChange({ subCategories: newSubCategories });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      inStock: false,
      onSale: false,
      brands: [],
      subCategories: [],
      priceRange: priceRange
    });
    setCurrentPage(1);
  };

  // Rendu des sous-catégories selon le contexte
  const renderSubCategoriesSection = () => {
    if (availableSubCategories.length === 0) return null;

    if (currentSubCategoryId) {
      return (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Autres catégories</h4>
          <div className="space-y-2">
            {availableSubCategories.slice(0, 8).map(subCat => (
              <Link
                key={subCat.id}
                href={`/categories/${categorySlug}/${subCat.slug}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                  {subCat.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {subCat.count}
                </span>
              </Link>
            ))}
            {availableSubCategories.length > 8 && (
              <p className="text-sm text-gray-500 mt-2 italic">
                +{availableSubCategories.length - 8} autres catégories
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableSubCategories.map(subCat => (
            <label key={subCat.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.subCategories.includes(subCat.id)}
                  onChange={() => handleSubCategoryToggle(subCat.id)}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="ml-2 text-sm text-gray-700 truncate">
                  {subCat.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                ({subCat.count})
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Statistiques pour l'affichage
  const statsText = `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredAndSortedProducts.length)} sur ${filteredAndSortedProducts.length} produit${filteredAndSortedProducts.length > 1 ? 's' : ''}`;

  // CONDITION PRINCIPALE : Afficher skeleton si chargement initial OU aucun produit ET aucun filtre actif
  const isLoading = isInitialLoading || (
    products.length === 0 && 
    !filters.inStock && 
    !filters.onSale && 
    filters.brands.length === 0 && 
    filters.subCategories.length === 0 &&
    filters.priceRange.min === priceRange.min && 
    filters.priceRange.max === priceRange.max
  );

  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  return (
    <div className="px-4 py-8">
      
      {/* Header avec titre et contrôles */}
      {showPageTitle && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {categoryName || 'Products'}
            </h1>
            <p className="text-gray-600">
              {statsText}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500 bg-white"
            >
              <option value="score">Meilleur score</option>
              <option value="price-low">Prix croissant</option>
              <option value="price-high">Prix décroissant</option>
              <option value="newest">Plus récent</option>
              <option value="name">Nom A-Z</option>
              <option value="discount">Meilleure réduction</option>
            </select>
          </div>
        </div>
      )}

      {!showPageTitle && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            {/* Statistiques sans H1 - juste les stats */}
            <p className="text-gray-600 text-lg">
              {statsText}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </button>

            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500 focus:border-rose-500 bg-white"
            >
              <option value="score">Meilleur score</option>
              <option value="price-low">Prix croissant</option>
              <option value="price-high">Prix décroissant</option>
              <option value="newest">Plus récent</option>
              <option value="name">Nom A-Z</option>
              <option value="discount">Meilleure réduction</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex gap-8">
        
        {/* Sidebar avec filtres (desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                >
                  Réinitialiser
                </button>
              </div>

              {/* Filtre disponibilité */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Disponibilité</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En stock uniquement</span>
                </label>
              </div>

              {/* Filtre promotions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Promotions</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange({ onSale: e.target.checked })}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En promotion</span>
                </label>
              </div>

              {/* Section sous-catégories adaptée */}
              {renderSubCategoriesSection()}

              {/* Filtre prix */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Prix (DH)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange({
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange({
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filtre marques */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Marques</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                      <label key={brand.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand.id)}
                            onChange={() => handleBrandToggle(brand.id)}
                            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 truncate">
                            {brand.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({brand.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Contenu principal avec grille de produits */}
        <main className="flex-1">
          
          {/* Tags des filtres actifs */}
          {(filters.inStock || filters.onSale || filters.brands.length > 0 || (filters.subCategories.length > 0 && !currentSubCategoryId)) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.inStock && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
                  En stock
                  <button
                    onClick={() => handleFilterChange({ inStock: false })}
                    className="hover:text-rose-900"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {filters.onSale && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
                  En promotion
                  <button
                    onClick={() => handleFilterChange({ onSale: false })}
                    className="hover:text-rose-900"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              )}
              
              {!currentSubCategoryId && filters.subCategories.map(subCategoryId => {
                const subCatName = getSubCategoryDisplayName(subCategoryId);
                
                return (
                  <span key={subCategoryId} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {subCatName}
                    <button
                      onClick={() => handleSubCategoryToggle(subCategoryId)}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                );
              })}
              
              {filters.brands.map(brandId => {
                const brandName = getBrandDisplayName(brandId);
                
                return (
                  <span key={brandId} className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 text-sm rounded-full">
                    {brandName}
                    <button
                      onClick={() => handleBrandToggle(brandId)}
                      className="hover:text-rose-900"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Grille de produits */}
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 mb-8">
              {paginatedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  priority={index < 8}
                />
              ))}
            </div>
          ) : (
            /* État vide (seulement si des filtres sont appliqués) */
            <div className="text-center py-16">
              <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Aucun produit ne correspond à vos critères de recherche. Essayez d&apos;ajuster vos filtres.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-6 py-3 bg-rose-300 text-black font-semibold rounded-lg hover:bg-rose-400 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              
              {(() => {
                const pages = [];
                const showPages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                const endPage = Math.min(totalPages, startPage + showPages - 1);
                
                if (endPage - startPage < showPages - 1) {
                  startPage = Math.max(1, endPage - showPages + 1);
                }
                
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="ellipse1" className="px-2 text-gray-500">...</span>);
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i
                          ? 'bg-rose-300 text-black'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="ellipse2" className="px-2 text-gray-500">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal filtres mobile adaptée */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Disponibilité</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En stock uniquement</span>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Promotions</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange({ onSale: e.target.checked })}
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En promotion</span>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  {currentSubCategoryId ? 'Autres catégories' : 'Catégories'}
                </h4>
                {availableSubCategories.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentSubCategoryId ? (
                      availableSubCategories.slice(0, 6).map(subCat => (
                        <Link
                          key={subCat.id}
                          href={`/categories/${categorySlug}/${subCat.slug}`}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors"
                        >
                          <span className="text-sm text-gray-700">
                            {subCat.name}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {subCat.count}
                          </span>
                        </Link>
                      ))
                    ) : (
                      availableSubCategories.slice(0, 8).map(subCat => (
                        <label key={subCat.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.subCategories.includes(subCat.id)}
                              onChange={() => handleSubCategoryToggle(subCat.id)}
                              className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {subCat.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({subCat.count})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {currentSubCategoryId ? 'Aucune autre catégorie' : 'Aucune sous-catégorie disponible'}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Prix (DH)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange({
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max</label>
                    <input
                      type="number"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange({
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              {availableBrands.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Marques</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableBrands.slice(0, 8).map(brand => (
                      <label key={brand.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.brands.includes(brand.id)}
                            onChange={() => handleBrandToggle(brand.id)}
                            className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {brand.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({brand.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-3 bg-rose-300 text-black font-medium rounded-lg hover:bg-rose-400 transition-colors"
              >
                Appliquer ({filteredAndSortedProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO structured data pour la liste de produits */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": `${categoryName || 'Products'} - BeautyDiscount`,
            "description": `Liste des produits dans la catégorie ${categoryName || 'products'}`,
            "numberOfItems": filteredAndSortedProducts.length,
            "itemListElement": paginatedProducts.slice(0, 10).map((product, index) => ({
              "@type": "ListItem",
              "position": startIndex + index + 1,
              "item": {
                "@type": "Product",
                "@id": `https://beautydiscount.ma/products/${product.slug}`,
                "name": product.name,
                "description": product.shortDescription || product.description,
                "image": `https://beautydiscount.ma${product.images[0] || '/api/placeholder/300/300'}`,
                "sku": product.sku,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "MAD",
                  "availability": product.stock === "En Stock" 
                    ? "https://schema.org/InStock" 
                    : "https://schema.org/OutOfStock"
                }
              }
            }))
          })
        }}
      />
    </div>
  );
}