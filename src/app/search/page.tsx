// app/search/page.tsx - PAGE DE RÉSULTATS DE RECHERCHE
import { Metadata } from "next";
import Link from "next/link";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import ProductGrid from "@/components/client/ProductGrid";
import { searchProducts } from "@/lib/firebase-search";

// ✅ INTERFACE POUR LES PARAMÈTRES DE RECHERCHE
interface SearchPageProps {
  searchParams: Promise<{
    q?: string;           // Terme de recherche
    category?: string;    // Filtrage par catégorie (slug)
    brand?: string;       // Filtrage par marque
    minPrice?: string;    // Prix minimum
    maxPrice?: string;    // Prix maximum
    sort?: string;        // Tri (relevance, price, name, newest)
    page?: string;        // Page (pour pagination future)
  }>;
}

/**
 * 🔍 PAGE DE RÉSULTATS DE RECHERCHE - Server Component
 * 
 * FONCTIONNALITÉS :
 * ✅ Recherche basée sur URL params (?q=terme)
 * ✅ Réutilise ProductGrid existant (zéro duplication)
 * ✅ Breadcrumb dynamique avec terme recherché
 * ✅ SEO optimisé avec métadonnées dynamiques
 * ✅ Gestion des états vides et erreurs
 * ✅ Support filtres via URL (optionnel)
 * ✅ Messages intelligents selon les résultats
 * ✅ Performance optimisée avec cache
 * 
 * URLS SUPPORTÉES :
 * /search?q=lissage
 * /search?q=masque&category=soins&sort=price
 * /search?q=shampoing&minPrice=50&maxPrice=200
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  try {
    const params = await searchParams;
    const searchQuery = params.q?.trim() || '';
    
    console.log(`🔍 Page de recherche chargée pour: "${searchQuery}"`);
    
    // ✅ VALIDATION DU TERME DE RECHERCHE
    if (!searchQuery || searchQuery.length < 2) {
      return <EmptySearchState />;
    }

    // ✅ PARSING DES FILTRES URL (optionnel)
    const searchOptions = {
      limit: 50,
      sortBy: (params.sort as 'relevance' | 'price' | 'name' | 'newest' | 'score') || 'relevance',
      includeOutOfStock: false,
      ...(params.minPrice && { minPrice: parseFloat(params.minPrice) }),
      ...(params.maxPrice && { maxPrice: parseFloat(params.maxPrice) }),
      // Filtres catégories/marques peuvent être ajoutés ici
    };

    // ✅ EXÉCUTION DE LA RECHERCHE
    const searchResult = await searchProducts(searchQuery, searchOptions);
    
    console.log(`✅ Recherche terminée:`, {
      terme: searchQuery,
      produitsTrouvés: searchResult.totalCount,
      tempsExécution: searchResult.executionTime
    });

    // ✅ CONSTRUCTION DU BREADCRUMB
    const breadcrumbItems = [
      { name: "Accueil", href: "/" },
      { name: "Recherche", href: "/search" },
      { 
        name: `"${searchQuery}"`, 
        href: `/search?q=${encodeURIComponent(searchQuery)}` 
      }
    ];

    return (
      <div className="min-h-screen bg-white">
        
        {/* ✅ BREADCRUMB NAVIGATION */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <BreadcrumbNav items={breadcrumbItems} />
          </div>
        </section>

        {/* ✅ SECTION D'EN-TÊTE AVEC STATISTIQUES */}
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="text-center">
              
              {/* Titre principal avec H1 pour SEO */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Résultats pour &quot;{searchQuery}&ldquo;
              </h1>
              
              {/* Statistiques de recherche */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <strong>{searchResult.totalCount}</strong> produit{searchResult.totalCount > 1 ? 's' : ''} trouvé{searchResult.totalCount > 1 ? 's' : ''}
                </span>
                
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recherche en {searchResult.executionTime}ms
                </span>
              </div>

              {/* ✅ SUGGESTIONS SI PEU DE RÉSULTATS */}
              {searchResult.totalCount < 3 && searchResult.suggestions && searchResult.suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Essayez aussi :</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {searchResult.suggestions.map((suggestion, index) => (
                      <Link
                        key={index}
                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full transition-colors"
                      >
                        {suggestion}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ✅ RÉSULTATS DE RECHERCHE */}
        {searchResult.products.length > 0 ? (
          
          /* Grille de produits avec ProductGrid existant */
          <section className="flex-1">
            <div className="bg-white w-full max-w-[1500px] mx-auto">
              <ProductGrid 
                products={searchResult.products}
                categoryName={`Résultats pour "${searchQuery}"`}
                showPageTitle={false} // On a déjà le H1 ci-dessus
                // ✅ Props optionnelles pour enrichir l'expérience
                showCategoryTags={true} // Afficher tags catégories sur résultats
                allowMultipleSelection={false}
                maxDisplayedCategories={2}
              />
            </div>
          </section>
          
        ) : (
          
          /* État vide avec suggestions */
          <NoResultsState 
            searchQuery={searchQuery} 
            suggestions={searchResult.suggestions}
          />
        )}

        {/* ✅ SECTION SEO AVEC LIENS POPULAIRES */}
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-6 sm:py-8">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recherches populaires
              </h2>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {POPULAR_SEARCHES.map((term, index) => (
                  <Link
                    key={index}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="inline-flex items-center px-3 py-1 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-sm text-gray-700 hover:text-rose-600 rounded-full transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    );

  } catch (error) {
    console.error("❌ Erreur lors du chargement de la page de recherche:", error);
    return <ErrorSearchState />;
  }
}

// ===== COMPOSANTS D'ÉTAT =====

/**
 * 🔍 État vide - Aucun terme de recherche
 */
function EmptySearchState() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Breadcrumb simple */}
      <section className="bg-white border-b border-gray-200">
        <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <BreadcrumbNav items={[
            { name: "Accueil", href: "/" },
            { name: "Recherche", href: "/search" }
          ]} />
        </div>
      </section>

      {/* Message principal */}
      <section className="flex-1 flex items-center justify-center py-12 sm:py-16">
        <div className="text-center px-4 max-w-md mx-auto">
          
          {/* Icône de recherche */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Rechercher des produits
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Utilisez la barre de recherche pour trouver vos produits de beauté préférés parmi notre large sélection.
          </p>

          {/* Liens vers catégories populaires */}
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">Catégories populaires :</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR_CATEGORIES.map((category, index) => (
                <Link
                  key={index}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-center px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-sm rounded-full transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * 🚫 État aucun résultat
 */
function NoResultsState({ 
  searchQuery, 
  suggestions 
}: { 
  searchQuery: string; 
  suggestions?: string[] 
}) {
  return (
    <section className="flex-1 py-12 sm:py-16">
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4">
        <div className="text-center max-w-2xl mx-auto">
          
          {/* Icône */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Aucun produit trouvé pour &ldquo;{searchQuery}&quot;
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Nous n&lsquo;avons trouvé aucun produit correspondant à votre recherche. 
            Essayez avec d&lsquo;autres termes ou explorez nos catégories.
          </p>

          {/* Suggestions de recherche */}
          {suggestions && suggestions.length > 0 && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                Essayez plutôt :
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <Link
                    key={index}
                    href={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="inline-flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors"
                  >
                    🔍 {suggestion}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions alternatives */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Voir toutes les catégories
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * ❌ État d'erreur
 */
function ErrorSearchState() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-4 max-w-md mx-auto">
        <div className="text-6xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Erreur de recherche
        </h1>
        <p className="text-gray-600 mb-8">
          Une erreur s&apos;est produite lors de la recherche. Veuillez réessayer.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

// ===== DONNÉES STATIQUES =====

/**
 * 📋 Recherches populaires pour SEO et suggestions
 */
const POPULAR_SEARCHES = [
  "Lissage brésilien",
  "Masque capillaire",
  "Poudre décolorante", 
  "Cosmétique coréen",
  "Kit mini lissage",
  "Shampoing professionnel",
  "Soin visage",
  "Maquillage"
];

/**
 * 📂 Catégories populaires pour l'état vide
 */
const POPULAR_CATEGORIES = [
  { name: "Lissages", slug: "lissages" },
  { name: "Cosmétique Coréen", slug: "cosmetique-coreen" },
  { name: "Soins Visage", slug: "soins-visage" },
  { name: "Maquillage", slug: "maquillage" }
];

// ===== MÉTADONNÉES SEO =====

/**
 * ✅ GÉNÉRATION DYNAMIQUE DES MÉTADONNÉES SEO
 */
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  try {
    const params = await searchParams;
    const searchQuery = params.q?.trim() || '';
    
    if (!searchQuery) {
      return {
        title: "Recherche de produits | BeautyDiscount",
        description: "Recherchez parmi notre large sélection de produits de beauté, cosmétiques et soins au Maroc. Trouvez vos marques préférées à prix discount.",
        keywords: "recherche, produits beauté, cosmétiques, soins, maroc, beautydiscount",
        robots: {
          index: true,
          follow: true,
        }
      };
    }

    // Métadonnées pour recherche avec terme
    const seoTitle = `Recherche "${searchQuery}" | BeautyDiscount`;
    const seoDescription = `Découvrez les produits de beauté pour "${searchQuery}" sur BeautyDiscount. Large sélection de cosmétiques et soins à prix discount au Maroc.`;
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        searchQuery,
        'beauté',
        'cosmétiques',
        'soins',
        'maroc',
        'discount',
        'recherche produits'
      ].join(', '),
      
      // Open Graph
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://beautydiscount.ma/search?q=${encodeURIComponent(searchQuery)}`,
        type: 'website',
      },

      // Twitter Card
      twitter: {
        card: 'summary',
        title: seoTitle,
        description: seoDescription,
      },

      // URL canonique
      alternates: {
        canonical: `https://beautydiscount.ma/search?q=${encodeURIComponent(searchQuery)}`,
      },

      // Configuration robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
    
  } catch (error) {
    console.error("❌ Erreur génération métadonnées recherche:", error);
    
    return {
      title: "Recherche | BeautyDiscount",
      description: "Recherchez vos produits de beauté préférés sur BeautyDiscount.",
    };
  }
}

/* ✅ UTILISATION :

URLs supportées :
- /search (état vide avec catégories populaires)
- /search?q=lissage (recherche simple)
- /search?q=masque&sort=price (avec tri)
- /search?q=shampoing&minPrice=50 (avec filtres)

Fonctionnalités :
✅ Réutilise ProductGrid existant (zéro duplication)
✅ SEO optimisé avec métadonnées dynamiques
✅ Breadcrumb intelligent
✅ Gestion des états vides et erreurs
✅ Suggestions de recherche
✅ Performance avec cache Firebase
✅ Mobile-first responsive
✅ Support 1500px largeur

*/