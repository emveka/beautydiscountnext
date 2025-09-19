// app/promotions/page.tsx - PAGE PROMOTIONS COMPLÈTE
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import ProductGrid from "@/components/client/ProductGrid";
import PromotionsHero from "@/components/client/PromotionsHero";
import PromotionsSkeleton from "@/components/client/PromotionsSkeleton";

import { getPromotionProducts, getPromotionStats } from "@/lib/firebase-promotions";
import { formatPrice, calculateDiscount } from "@/lib/firebase-utils";

/**
 * Page des promotions - Server Component
 * 
 * FONCTIONNALITÉS :
 * ✅ Affichage de tous les produits en promotion
 * ✅ Calcul automatique des remises
 * ✅ Tri par pourcentage de remise décroissant
 * ✅ Statistiques des promotions
 * ✅ Hero section avec compteur de promotions
 * ✅ SEO optimisé pour les promotions
 * ✅ Loading states avec skeleton
 */
export default async function PromotionsPage() {
  try {
    console.log("🎯 Chargement de la page promotions...");
    
    // ✅ RÉCUPÉRATION PARALLÈLE DES DONNÉES
    const [promotionProducts, promotionStats] = await Promise.all([
      getPromotionProducts(), // Récupère tous les produits en promotion
      getPromotionStats()     // Statistiques des promotions
    ]);

    console.log(`✅ ${promotionProducts.length} produits en promotion trouvés`);
    console.log(`📊 Statistiques:`, {
      totalProducts: promotionStats.totalProducts,
      averageDiscount: `${promotionStats.averageDiscount}%`,
      totalSavings: formatPrice(promotionStats.totalSavings)
    });

    return (
      <div className="min-h-screen bg-white">
        {/* BREADCRUMB NAVIGATION */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <BreadcrumbNav 
              items={[
                { name: "Accueil", href: "/" },
                { name: "Promotions", href: "/promotions" }
              ]} 
            />
          </div>
        </section>

        {/* HERO SECTION DES PROMOTIONS */}
        <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 border-b border-gray-100">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:py-12">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
              <PromotionsHero 
                totalProducts={promotionStats.totalProducts}
                averageDiscount={promotionStats.averageDiscount}
                totalSavings={promotionStats.totalSavings}
                biggestDiscount={promotionStats.biggestDiscount}
              />
            </Suspense>
          </div>
        </section>

        {/* TITRE DE LA PAGE */}
        <section className="bg-white py-4 sm:py-6">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                🔥 Nos Meilleures Promotions
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                Découvrez notre sélection de produits de beauté en promotion. 
                Jusqu&apos;à <span className="font-semibold text-red-600">{promotionStats.biggestDiscount}% de réduction</span> sur vos marques préférées !
              </p>
              
              {/* STATISTIQUES RAPIDES */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  🎁 <strong className="text-gray-700">{promotionStats.totalProducts}</strong> produits en promo
                </span>
                <span className="flex items-center gap-1">
                  💰 <strong className="text-gray-700">{promotionStats.averageDiscount}%</strong> de remise moyenne
                </span>
                <span className="flex items-center gap-1">
                  🏷️ Jusqu&apos;à <strong className="text-red-600">{formatPrice(promotionStats.totalSavings)}</strong> d&apos;économies
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* GRID DES PRODUITS EN PROMOTION */}
        <section className="flex-1 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto">
            <Suspense fallback={<PromotionsSkeleton />}>
              <ProductGrid 
                products={promotionProducts}
                categoryName="Promotions"
                showPageTitle={false} // On a déjà notre titre personnalisé
                showPromotionBadges={true} // ✅ NOUVEAU : Afficher les badges de promotion
                defaultSortBy="discount" // ✅ NOUVEAU : Tri par défaut par remise décroissante
                enablePromotionFilters={true} // ✅ NOUVEAU : Filtres spécifiques aux promotions
              />
            </Suspense>
          </div>
        </section>

        {/* SECTION INFORMATIVE SUR LES PROMOTIONS */}
        <section className="bg-white border-t border-gray-100 py-6 sm:py-8">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* AVANTAGES DES PROMOTIONS */}
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Promotions Authentiques
                </h3>
                <p className="text-sm text-gray-600">
                  Toutes nos promotions sont réelles et calculées sur les prix de référence officiels.
                </p>
              </div>

              {/* DURÉE DES PROMOTIONS */}
              <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-100">
                <div className="text-3xl mb-3">⏰</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Offres Limitées
                </h3>
                <p className="text-sm text-gray-600">
                  Profitez de ces prix exceptionnels avant la fin des stocks ou des promotions.
                </p>
              </div>

              {/* QUALITÉ GARANTIE */}
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-100 md:col-span-2 lg:col-span-1">
                <div className="text-3xl mb-3">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Qualité Garantie
                </h3>
                <p className="text-sm text-gray-600">
                  Même en promotion, tous nos produits sont authentiques et de première qualité.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white py-8 sm:py-12">
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ne Manquez Pas Ces Offres Exceptionnelles !
            </h2>
            <p className="text-lg sm:text-xl mb-6 opacity-90">
              Commandez maintenant et payez à la livraison partout au Maroc
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/categories"
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Voir Toutes les Catégories
              </Link>
              <Link
                href="/#nouveautes"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Découvrir les Nouveautés
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
    
  } catch (error) {
    console.error("❌ Erreur lors du chargement de la page promotions:", error);
    
    // PAGE D'ERREUR ÉLÉGANTE
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de charger les promotions pour le moment.
          </p>
          <Link
            href="/"
            className="bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }
}

/**
 * ✅ MÉTADONNÉES SEO OPTIMISÉES POUR LES PROMOTIONS
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Récupération des statistiques pour enrichir les métadonnées
    const stats = await getPromotionStats();
    
    const seoTitle = "🔥 Promotions BeautyDiscount - Jusqu'à " + stats.biggestDiscount + "% de Réduction";
    const seoDescription = `Découvrez nos ${stats.totalProducts} produits de beauté en promotion ! Économisez jusqu'à ${stats.biggestDiscount}% sur vos marques préférées. Livraison gratuite dès 300 DH au Maroc.`;
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: [
        "promotions",
        "soldes beauté",
        "cosmétiques discount",
        "prix réduits",
        "offres spéciales",
        "beauté maroc",
        "maquillage promotion",
        "soins visage promo",
        "parfums discount",
        "livraison maroc"
      ].join(', '),
      
      // Open Graph pour les réseaux sociaux
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: 'https://beautydiscount.ma/promotions',
        type: 'website',
        images: [
          {
            url: '/og-promotions.jpg', // Image spéciale promotions
            width: 1200,
            height: 630,
            alt: 'Promotions BeautyDiscount',
          }
        ],
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: ['/twitter-promotions.jpg'],
      },

      // URL canonique
      alternates: {
        canonical: 'https://beautydiscount.ma/promotions',
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

      // Métadonnées spécifiques e-commerce
      other: {
        'product:price:currency': 'MAD',
        'product:availability': 'in stock',
        'og:price:standard_amount': stats.totalProducts.toString(),
        'product:category': 'Beauty & Personal Care',
      },
    };
    
  } catch (error) {
    console.error("❌ Erreur génération métadonnées promotions:", error);
    
    return {
      title: "🔥 Promotions BeautyDiscount - Produits de Beauté en Solde",
      description: "Découvrez nos promotions exceptionnelles sur les produits de beauté, cosmétiques et soins. Livraison rapide au Maroc.",
      keywords: "promotions, beauté, cosmétiques, discount, maroc",
    };
  }
}