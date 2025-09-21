// components/HomeSection.tsx - VERSION HYBRIDE SIMPLE
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
  categorySlug?: string;
  subCategorySlug?: string;
  title?: string;
  maxProducts?: number;
  showViewMore?: boolean;
  containerClass?: string;
}

/**
 * ✅ SOLUTION SIMPLE : Client Component avec refresh automatique
 * ✅ H2 toujours présent même côté client
 * ✅ Mise à jour automatique toutes les 2 minutes
 */
const HomeSection = ({
  categorySlug,
  subCategorySlug,
  title,
  maxProducts = 5,
  showViewMore = true,
  containerClass = ""
}: HomeSectionProps) => {
  
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FONCTION SIMPLE pour charger les données
  const loadData = async () => {
    try {
      if (subCategorySlug) {
        const fetchedSubCategory = categorySlug 
          ? await getSubCategoryBySlug(subCategorySlug, categorySlug)
          : await getSubCategoryBySlug(subCategorySlug);
        
        if (!fetchedSubCategory) return;

        const [productsData, parentCategory] = await Promise.all([
          getSubCategoryProductsWithBrands(fetchedSubCategory.id),
          categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null)
        ]);

        setSubCategory(fetchedSubCategory);
        setCategory(parentCategory);
        setProducts(productsData.slice(0, maxProducts));

      } else if (categorySlug) {
        const fetchedCategory = await getCategoryBySlug(categorySlug);
        if (!fetchedCategory) return;

        const productsData = await getCategoryProductsWithBrands(fetchedCategory.id);
        setCategory(fetchedCategory);
        setProducts(productsData.sort((a, b) => b.score - a.score).slice(0, maxProducts));
      }
    } catch (error) {
      console.error('Erreur HomeSection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CHARGEMENT INITIAL
  useEffect(() => {
    loadData();
  }, [categorySlug, subCategorySlug, maxProducts]);

  // ✅ REFRESH AUTOMATIQUE toutes les 2 minutes (simple)
  useEffect(() => {
    const interval = setInterval(loadData, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [categorySlug, subCategorySlug, maxProducts]);

  const getDisplayTitle = () => {
    if (title) return title;
    if (subCategory) return subCategory.name;
    if (category) return category.name;
    return 'Nos Produits';
  };

  const getViewMoreLink = () => {
    if (subCategory && category) return `/categories/${category.slug}/${subCategory.slug}`;
    if (category) return `/categories/${category.slug}`;
    return '#';
  };

  // ✅ LOADING simple
  if (isLoading) {
    return (
      <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({length: maxProducts}).map((_, i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
        
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1">
            {/* ✅ H2 TOUJOURS PRÉSENT même côté client */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {getDisplayTitle()}
            </h2>
            
            {subCategory?.description && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {subCategory.description}
              </p>
            )}
            
            {category?.description && !subCategory && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {category.description}
              </p>
            )}
          </div>

          {showViewMore && (category || subCategory) && (
            <div className="flex-shrink-0 ml-3 sm:ml-6">
              <a
                href={getViewMoreLink()}
                className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors group"
              >
                <span className="hidden sm:inline">Voir plus</span>
                <span className="sm:hidden">Plus</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* ✅ GRILLE PRODUITS avec données auto-actualisées */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3">
          {products.map((product, index) => (
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