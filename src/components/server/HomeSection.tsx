// components/HomeSection.tsx - CONVERTI EN SERVER COMPONENT
import React from 'react';
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
 * HomeSection en Server Component pour SEO optimal
 * ✅ Les H2 seront présents dans le HTML initial
 * ✅ Pas de loading state - rendu direct côté serveur
 */
const HomeSection = async ({
  categorySlug,
  subCategorySlug,
  title,
  maxProducts = 5,
  showViewMore = true,
  containerClass = ""
}: HomeSectionProps) => {
  
  let products: Product[] = [];
  let category: Category | null = null;
  let subCategory: SubCategory | null = null;

  try {
    if (subCategorySlug) {
      // Récupération sous-catégorie
      subCategory = categorySlug 
        ? await getSubCategoryBySlug(subCategorySlug, categorySlug)
        : await getSubCategoryBySlug(subCategorySlug);
      
      if (!subCategory) {
        console.warn(`Sous-catégorie "${subCategorySlug}" introuvable`);
        return null;
      }

      // Récupération produits et catégorie parente en parallèle
      const [productsData, parentCategory] = await Promise.all([
        getSubCategoryProductsWithBrands(subCategory.id),
        categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null)
      ]);

      products = productsData.slice(0, maxProducts);
      category = parentCategory;

    } else if (categorySlug) {
      // Récupération catégorie
      category = await getCategoryBySlug(categorySlug);
      
      if (!category) {
        console.warn(`Catégorie "${categorySlug}" introuvable`);
        return null;
      }

      // Récupération produits
      const productsData = await getCategoryProductsWithBrands(category.id);
      products = productsData
        .sort((a, b) => b.score - a.score)
        .slice(0, maxProducts);
    } else {
      console.warn('categorySlug ou subCategorySlug requis pour HomeSection');
      return null;
    }

    // Pas de produits = pas d'affichage
    if (products.length === 0) {
      return null;
    }

  } catch (error) {
    console.error('Erreur dans HomeSection Server:', error);
    return null;
  }

  // Fonctions utilitaires
  const getDisplayTitle = (): string => {
    if (title) return title;
    if (subCategory) return subCategory.name;
    if (category) return category.name;
    return 'Nos Produits';
  };

  const getDisplayDescription = (): string | null => {
    if (subCategory?.description) return subCategory.description;
    if (category?.description) return category.description;
    return null;
  };

  const getViewMoreLink = (): string => {
    if (subCategory && category) {
      return `/categories/${category.slug}/${subCategory.slug}`;
    } else if (category) {
      return `/categories/${category.slug}`;
    }
    return '#';
  };

  return (
    <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
        
        {/* Header section avec H2 présent côté serveur pour SEO */}
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1">
            {/* ✅ H2 présent dans le HTML initial - CRUCIAL pour SEO */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {getDisplayTitle()}
            </h2>
            
            {getDisplayDescription() && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                {getDisplayDescription()}
              </p>
            )}
            
            {subCategory && category && (
              <div className="mt-2 sm:mt-3">
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-rose-100 text-rose-700 rounded">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {category.name}
                </span>
              </div>
            )}
          </div>

          {showViewMore && (category || subCategory) && (
            <div className="flex-shrink-0 ml-3 sm:ml-6">
              <a
                href={getViewMoreLink()}
                className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium hover:underline transition-colors group"
                aria-label={`Voir tous les produits ${getDisplayTitle()}`}
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

        {/* Products grid */}
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