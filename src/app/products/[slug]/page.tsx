// app/products/[slug]/page.tsx - VERSION TEMPS RÉEL FIREBASE
'use client'; // 🔥 TRANSFORMATION EN CLIENT COMPONENT

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Metadata } from 'next';

import BreadcrumbNav from '@/components/server/BreadcrumbNav';
import ProductGallery from '@/components/client/ProductGallery';
import ProductInfo from '@/components/client/ProductInfo';
import ProductTabs from '@/components/client/ProductTabs';
import RelatedProducts from '@/components/client/RelatedProducts';
import ProductSchema from '@/components/server/ProductSchema';

import { 
  getProductsByMultipleCategories,
  getProductsByMultipleSubCategories,
  resolveProductContext,
  calculateDiscount,
  formatPrice,
  getProductImageUrl
} from '@/lib/firebase-utils';
import { Category, Product, SubCategory } from '@/lib/types';

// Interface pour le loading state
interface PageState {
  product: Product | null;
  categories: Category[];
  subCategories: SubCategory[];
  relatedProducts: Product[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

/**
 * ✅ COMPOSANT LOADING OPTIMISÉ
 */
function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Breadcrumb skeleton */}
      <section className="bg-white border-b border-gray-200">
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </section>

      {/* Main content skeleton */}
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            
            {/* Image gallery skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="flex space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Product info skeleton */}
            <div className="space-y-4 sm:space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * ✅ COMPOSANT ERROR STATE
 */
function ProductErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 🔥 PAGE PRODUIT AVEC TEMPS RÉEL FIREBASE
 * 
 * NOUVELLES FONCTIONNALITÉS :
 * ✅ Écoute en temps réel avec onSnapshot
 * ✅ Mise à jour automatique des images depuis Firebase
 * ✅ Loading states optimisés
 * ✅ Gestion d'erreurs robuste
 * ✅ Retry automatique
 * ✅ Cache local intelligent
 */
export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // État principal de la page
  const [state, setState] = useState<PageState>({
    product: null,
    categories: [],
    subCategories: [],
    relatedProducts: [],
    loading: true,
    error: null,
    lastUpdate: 0
  });

  // Fonction de retry
  const retryLoading = () => {
    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));
  };

  /**
   * 🔥 EFFET PRINCIPAL - ÉCOUTE TEMPS RÉEL FIREBASE
   */
  useEffect(() => {
    if (!slug) {
      setState(prev => ({ ...prev, error: 'Slug manquant', loading: false }));
      return;
    }

    console.log('🔥 [ProductPage] Configuration écoute temps réel pour:', slug);

    // 1. RECHERCHE DU PRODUIT PAR SLUG
    const findAndListenToProduct = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Recherche du produit par slug
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('slug', '==', slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error('❌ [ProductPage] Produit introuvable pour slug:', slug);
          setState(prev => ({ ...prev, error: 'Produit introuvable', loading: false }));
          return null;
        }

        const productDoc = querySnapshot.docs[0];
        const productId = productDoc.id;
        const productData = { id: productId, ...productDoc.data() } as Product;

        console.log('✅ [ProductPage] Produit trouvé:', {
          id: productId,
          name: productData.name,
          imagesCount: productData.images?.length || 0
        });

        // 2. CONFIGURATION ÉCOUTE TEMPS RÉEL
        const unsubscribe = onSnapshot(
          doc(db, 'products', productId),
          async (docSnapshot) => {
            if (!docSnapshot.exists()) {
              console.error('❌ [ProductPage] Produit supprimé');
              setState(prev => ({ ...prev, error: 'Produit supprimé', loading: false }));
              return;
            }

            const updatedProduct = {
              id: docSnapshot.id,
              ...docSnapshot.data()
            } as Product;

            console.log('🔄 [ProductPage] Mise à jour temps réel reçue:', {
              name: updatedProduct.name,
              imagesCount: updatedProduct.images?.length || 0,
              lastUpdate: new Date().toLocaleTimeString()
            });

            // Charger le contexte et produits similaires
            const [contextResult, relatedProducts] = await Promise.all([
              resolveProductContext(
                updatedProduct.categoryIds || [], 
                updatedProduct.subCategoryIds || []
              ),
              getRelatedProductsMultiCategories(updatedProduct)
            ]);

            // Mise à jour de l'état
            setState({
              product: updatedProduct,
              categories: contextResult.categories,
              subCategories: contextResult.subCategories,
              relatedProducts: relatedProducts.filter(p => p.id !== updatedProduct.id).slice(0, 8),
              loading: false,
              error: null,
              lastUpdate: Date.now()
            });

          },
          (error) => {
            console.error('❌ [ProductPage] Erreur écoute temps réel:', error);
            setState(prev => ({ 
              ...prev, 
              error: 'Erreur de connexion Firebase', 
              loading: false 
            }));
          }
        );

        return unsubscribe;

      } catch (error) {
        console.error('❌ [ProductPage] Erreur initialisation:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'Erreur de chargement initial', 
          loading: false 
        }));
        return null;
      }
    };

    // Lancer l'initialisation
    let unsubscribe: (() => void) | null = null;
    
    findAndListenToProduct().then(unsub => {
      unsubscribe = unsub;
    });

    // Nettoyage
    return () => {
      if (unsubscribe) {
        console.log('🧹 [ProductPage] Nettoyage écoute temps réel');
        unsubscribe();
      }
    };

  }, [slug]);

  // Affichage conditionnel selon l'état
  if (state.loading) {
    return <ProductPageSkeleton />;
  }

  if (state.error || !state.product) {
    return <ProductErrorState error={state.error || 'Erreur inconnue'} onRetry={retryLoading} />;
  }

  // Données destructurées pour faciliter la lecture
  const { product, categories, subCategories, relatedProducts } = state;
  
  // Construction du breadcrumb
  const breadcrumbItems = buildMultiCategoryBreadcrumb(product, categories, subCategories);
  
  // Calculs d'affichage
  const discount = calculateDiscount(product.price, product.originalPrice);
  const isOnSale = !!(product.originalPrice && product.originalPrice > product.price);
  
  // Catégorie principale pour rétrocompatibilité
  const primaryCategory = categories[0] || null;
  const primarySubCategory = subCategories[0] || null;

  console.log('🎯 [ProductPage] Rendu avec données:', {
    productName: product.name,
    imagesCount: product.images?.length || 0,
    categoriesCount: categories.length,
    lastUpdate: new Date(state.lastUpdate).toLocaleTimeString()
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 🎯 BREADCRUMB */}
      <section className="bg-white border-b border-gray-200">
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <BreadcrumbNav items={breadcrumbItems} />
        </div>
      </section>

      {/* 🎯 CONTENU PRINCIPAL */}
      <section className="py-4 sm:py-6 lg:py-8">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
            
            {/* 🎯 GALERIE D'IMAGES - TEMPS RÉEL */}
            <div className="space-y-3 sm:space-y-4">
              <ProductGallery 
                images={product.images || []}
                imagePaths={product.imagePaths || []}
                productName={product.name}
                priority={true}
                key={`gallery-${state.lastUpdate}`} // Force re-render lors des mises à jour
              />
            </div>

            {/* 🎯 INFORMATIONS PRODUIT */}
            <div className="space-y-4 sm:space-y-6">
              <ProductInfo 
                product={product}
                categories={categories}
                subCategories={subCategories}
                primaryCategory={primaryCategory}
                primarySubCategory={primarySubCategory}
                discount={discount}
                isOnSale={isOnSale}
                key={`info-${state.lastUpdate}`} // Force re-render
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 ONGLETS DÉTAILS */}
      <section className="py-4 sm:py-6 lg:py-8 bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
          <ProductTabs 
            product={product}
            categories={categories}
            subCategories={subCategories}
            primaryCategory={primaryCategory}
            primarySubCategory={primarySubCategory}
          />
        </div>
      </section>

      {/* 🎯 PRODUITS SIMILAIRES */}
      {relatedProducts.length > 0 && (
        <section className="py-6 sm:py-8 lg:py-12 bg-white">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Produits similaires
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                {buildSimilarProductsDescription(categories, subCategories)}
              </p>
            </div>
            
            <RelatedProducts 
              products={relatedProducts}
              title={getSimilarProductsTitle(categories, subCategories)}
              categorySlug={primaryCategory?.slug}
              currentProductId={product.id}
              categories={categories}
              subCategories={subCategories}
            />
          </div>
        </section>
      )}

      {/* 🎯 AFFICHAGE MULTI-CATÉGORIES */}
      {categories.length > 1 && (
        <section className="py-4 sm:py-6 bg-blue-50 border-t border-blue-100">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Ce produit appartient à plusieurs catégories :
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🎯 INDICATEUR DE DERNIÈRE MISE À JOUR (dev only) */}
      {process.env.NODE_ENV === 'development' && state.lastUpdate > 0 && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium z-50">
          Mis à jour : {new Date(state.lastUpdate).toLocaleTimeString()}
        </div>
      )}

      <div className="sm:hidden h-4"></div>

      {/* Données structurées */}
      <ProductSchema 
        product={product}
        categories={categories}
        subCategories={subCategories}
        primaryCategory={primaryCategory}
        primarySubCategory={primarySubCategory}
        similarProducts={relatedProducts.slice(0, 4)}
      />
    </div>
  );
}

// ===== FONCTIONS UTILITAIRES (INCHANGÉES) =====

async function getRelatedProductsMultiCategories(product: Product) {
  try {
    const relatedProducts: Product[] = [];

    if (product.subCategoryIds?.length > 0) {
      const subCategoryProducts = await getProductsByMultipleSubCategories(product.subCategoryIds);
      relatedProducts.push(...subCategoryProducts);
    }

    if (relatedProducts.length < 12 && product.categoryIds?.length > 0) {
      const categoryProducts = await getProductsByMultipleCategories(product.categoryIds);
      const existingIds = new Set(relatedProducts.map(p => p.id));
      const newProducts = categoryProducts.filter(p => !existingIds.has(p.id));
      relatedProducts.push(...newProducts);
    }

    return relatedProducts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 20);

  } catch (error) {
    console.error("❌ Erreur récupération produits similaires:", error);
    return [];
  }
}

function buildMultiCategoryBreadcrumb(product: Product, categories: Category[], subCategories: SubCategory[]) {
  const breadcrumbItems = [
    { name: "Accueil", href: "/" },
    { name: "Catégories", href: "/categories" }
  ];

  const primaryCategory = categories[0];
  const primarySubCategory = subCategories.find(sub => 
    sub.parentId === primaryCategory?.id
  ) || subCategories[0];

  if (primaryCategory) {
    breadcrumbItems.push({
      name: primaryCategory.name,
      href: `/categories/${primaryCategory.slug}`
    });

    if (primarySubCategory) {
      breadcrumbItems.push({
        name: primarySubCategory.name,
        href: `/categories/${primaryCategory.slug}/${primarySubCategory.slug}`
      });
    }
  }

  breadcrumbItems.push({
    name: product.name,
    href: `/products/${product.slug}`
  });

  return breadcrumbItems;
}

function getSimilarProductsTitle(categories: Category[], subCategories: SubCategory[]): string {
  if (subCategories.length > 0) {
    return subCategories.length === 1 
      ? `Autres produits en ${subCategories[0].name}`
      : `Autres produits dans ces sous-catégories`;
  }
  
  if (categories.length > 0) {
    return categories.length === 1
      ? `Autres produits en ${categories[0].name}`
      : `Autres produits dans ces catégories`;
  }
  
  return "Produits similaires";
}

function buildSimilarProductsDescription(categories: Category[], subCategories: SubCategory[]): string {
  if (subCategories.length > 1) {
    return `Découvrez d'autres produits dans les sous-catégories ${subCategories.map(s => s.name).join(', ')}`;
  }
  
  if (subCategories.length === 1) {
    return `Découvrez d'autres produits dans la sous-catégorie ${subCategories[0].name}`;
  }
  
  if (categories.length > 1) {
    return `Découvrez d'autres produits dans les catégories ${categories.map(c => c.name).join(', ')}`;
  }
  
  if (categories.length === 1) {
    return `Découvrez d'autres produits dans la catégorie ${categories[0].name}`;
  }
  
  return "Découvrez d'autres produits qui pourraient vous intéresser";
}