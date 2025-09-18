// components/server/CategoryInfo.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';

interface CategoryInfoProps {
  category: Category;
  productCount: number;
  subCategoriesCount: number;
  isSubCategory?: boolean;
  parentCategory?: Category | null;
}

/**
 * Composant CategoryInfo optimisé pour PageSpeed avec Next.js Image
 * Affiche les informations d'une catégorie ou sous-catégorie avec optimisations performances
 * 
 * Fonctionnalités :
 * - H1 principal pour le SEO
 * - Navigation contextuelle pour sous-catégories  
 * - Images optimisées avec Next.js Image
 * - Design responsive et accessible
 */
export default function CategoryInfo({ 
  category, 
  productCount, 
  subCategoriesCount,
  isSubCategory = false,
  parentCategory = null
}: CategoryInfoProps) {
  return (
    <div className="text-center space-y-6">
      {/* H1 principal obligatoire pour chaque page */}
      <div className="space-y-3">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
          {category.name}
        </h1>
        
        {/* Contexte hiérarchique pour les sous-catégories */}
        {isSubCategory && parentCategory && (
          <div className="flex justify-center items-center space-x-2 text-lg">
            <span className="text-gray-500">dans</span>
            <Link 
              href={`/categories/${parentCategory.slug}`} 
              className="text-rose-600 hover:text-rose-700 hover:underline font-medium transition-colors"
            >
              {parentCategory.name}
            </Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Description principale enrichie */}
      {category.description && (
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 leading-relaxed">
            {category.description}
          </p>
        </div>
      )}

      {/* Image de catégorie optimisée avec Next.js Image */}
      {category.image && (
        <div className="max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <Image
              src={category.image}
              alt={`Illustration ${category.name}`}
              width={448}
              height={192}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 100vw, 448px"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Statistiques avec icônes et design moderne */}
      <div className="flex justify-center items-center space-x-8">
        {/* Compteur de produits */}
        <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{productCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">
              produit{productCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        {/* Compteur de sous-catégories si applicable */}
        {subCategoriesCount > 0 && (
          <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{subCategoriesCount}</div>
              <div className="text-sm text-gray-500">
                sous-catégorie{subCategoriesCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions et informations contextuelles */}
      <div className="space-y-4">
        {/* Badge de statut */}
        {productCount > 0 && (
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Produits disponibles
          </div>
        )}

        {/* Liens de navigation rapide pour les catégories principales */}
        {!isSubCategory && subCategoriesCount > 0 && (
          <div className="pt-2">
            <p className="text-sm text-gray-500 mb-4">
              Explorez nos {subCategoriesCount} sous-catégories spécialisées
            </p>
            
            {/* Message d'encouragement à la navigation */}
            <div className="inline-flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Utilisez les filtres ci-dessous pour affiner votre recherche
            </div>
          </div>
        )}

        {/* Lien de retour pour les sous-catégories */}
        {isSubCategory && parentCategory && (
          <div className="pt-2">
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-rose-600 transition-colors group"
            >
              <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Retour à {parentCategory.name}
            </Link>
          </div>
        )}
      </div>

      {/* Message d'encouragement selon le contexte */}
      <div className="pt-4">
        {productCount > 20 ? (
          <p className="text-gray-600 text-sm">
            Large sélection disponible • Utilisez les filtres pour trouver exactement ce que vous cherchez
          </p>
        ) : productCount > 5 ? (
          <p className="text-gray-600 text-sm">
            Collection soigneusement sélectionnée • Découvrez nos recommandations ci-dessous
          </p>
        ) : productCount > 0 ? (
          <p className="text-gray-600 text-sm">
            Sélection exclusive • Chaque produit a été choisi pour sa qualité
          </p>
        ) : (
          <p className="text-gray-500 text-sm">
            Nouveaux produits bientôt disponibles • Revenez prochainement
          </p>
        )}
      </div>
    </div>
  );
}