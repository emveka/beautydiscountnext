// components/HomeSection.tsx - VERSION CLIENT COMPONENT avec mise à jour temps réel
"use client"; // ← AJOUT DU "use client"

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
 * ✅ HomeSection en Client Component pour mise à jour temps réel
 * ✅ Récupération des données côté client avec useEffect
 * ✅ Possibilité d'ajouter du polling pour synchronisation
 */
const HomeSection = ({
  categorySlug,
  subCategorySlug,
  title,
  maxProducts = 5,
  showViewMore = true,
  containerClass = ""
}: HomeSectionProps) => {
  
  // États pour gérer les données et le chargement
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (subCategorySlug) {
        // Chargement sous-catégorie
        const fetchedSubCategory = categorySlug 
          ? await getSubCategoryBySlug(subCategorySlug, categorySlug)
          : await getSubCategoryBySlug(subCategorySlug);
        
        if (!fetchedSubCategory) {
          console.warn(`Sous-catégorie "${subCategorySlug}" introuvable`);
          setIsLoading(false);
          return;
        }

        const [productsData, parentCategory] = await Promise.all([
          getSubCategoryProductsWithBrands(fetchedSubCategory.id),
          categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null)
        ]);

        setSubCategory(fetchedSubCategory);
        setCategory(parentCategory);
        setProducts(productsData.slice(0, maxProducts));

      } else if (categorySlug) {
        // Chargement catégorie
        const fetchedCategory = await getCategoryBySlug(categorySlug);
        
        if (!fetchedCategory) {
          console.warn(`Catégorie "${categorySlug}" introuvable`);
          setIsLoading(false);
          return;
        }

        const productsData = await getCategoryProductsWithBrands(fetchedCategory.id);
        
        setCategory(fetchedCategory);
        setProducts(productsData
          .sort((a, b) => b.score - a.score)
          .slice(0, maxProducts)
        );
      } else {
        console.warn('categorySlug ou subCategorySlug requis pour HomeSection');
        setIsLoading(false);
        return;
      }

    } catch (error) {
      console.error('Erreur dans HomeSection Client:', error);
      setError('Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [categorySlug, subCategorySlug, maxProducts]);

  // ✅ POLLING OPTIONNEL pour synchronisation temps réel
  useEffect(() => {
    // Polling toutes les 30 secondes pour vérifier les changements
    const interval = setInterval(() => {
      loadData();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [categorySlug, subCategorySlug, maxProducts]);

  // ✅ CONTENU THÉMATIQUE pour enrichir les mots-clés
  const getThematicContent = () => {
    const content = {
      'lissages': 'Découvrez nos traitements lissage professionnel pour cheveux. Lissage brésilien, japonais et progressif pour tous types de cheveux. Obtenez des cheveux lisses, brillants et disciplinés avec nos produits capillaires de qualité professionnelle.',
      
      'kits-mini-lissage': 'Kits de lissage complets pour un traitement capillaire à domicile. Nos kits mini lissage contiennent tout le nécessaire : shampooing, masque, sérum et protection thermique pour un lissage parfait.',
      
      'poudres-decolorantes': 'Poudres décolorantes professionnelles pour éclaircir et décolorer les cheveux. Décoloration capillaire sûre et efficace pour créer des bases claires avant coloration. Produits de décoloration de salon.',
      
      'masques-capillaires': 'Masques capillaires réparateurs et nourrissants pour cheveux abîmés. Soins intensifs pour cheveux secs, cassants ou colorés. Masques hydratants, protéinés et reconstructeurs pour une chevelure en pleine santé.',
      
      'cosmetique-coreen': 'Cosmétiques coréens authentiques pour le visage et le corps. Skincare coréen avec essence, sérums, masques et crèmes. Beauté coréenne K-beauty pour une peau parfaite selon les rituels de beauté asiatiques.'
    };
    
    if (subCategorySlug && content[subCategorySlug as keyof typeof content]) {
      return content[subCategorySlug as keyof typeof content];
    }
    
    if (categorySlug && content[categorySlug as keyof typeof content]) {
      return content[categorySlug as keyof typeof content];
    }
    
    return null;
  };

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

  const thematicContent = getThematicContent();

  // État de chargement
  if (isLoading) {
    return (
      <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-4 sm:mb-8">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-80"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3">
              {Array.from({ length: maxProducts }).map((_, index) => (
                <div key={index} className="bg-gray-200 aspect-square rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
        <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-rose-300 text-black rounded hover:bg-rose-400 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Aucun produit trouvé
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-6 sm:py-10 bg-white ${containerClass}`}>
      <div className="max-w-[1500px] mx-auto px-2 sm:px-4">
        
        {/* Header section avec H2 présent côté client */}
        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div className="flex-1">
            {/* ✅ H2 toujours présent - maintenant côté client */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              {getDisplayTitle()}
            </h2>
            
            {/* ✅ CONTENU THÉMATIQUE enrichi */}
            {thematicContent && (
              <div className="mt-3 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed max-w-4xl">
                  {thematicContent}
                </p>
              </div>
            )}
            
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

        {/* Products grid avec données à jour */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3">
          {products.map((product, index) => (
            <ProductCard 
              key={`${product.id}-${product.updatedAt.getTime()}`} // ← Clé avec timestamp pour forcer re-render
              product={product}
              priority={index < 6}
            />
          ))}
        </div>

        {/* ✅ Indicateur de dernière mise à jour (optionnel) */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

      </div>
    </section>
  );
};

export default HomeSection;