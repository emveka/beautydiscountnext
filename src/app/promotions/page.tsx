// app/promotions/page.tsx - PAGE PROMOTIONS SIMPLIFIÉE - PRODUCT GRID ONLY
import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import ProductGrid from "@/components/client/ProductGrid";
import PromotionsSkeleton from "@/components/client/PromotionsSkeleton";

import { getPromotionProducts, getPromotionStats } from "@/lib/firebase-promotions";

/**
 * Page des promotions - Server Component SIMPLIFIÉE
 * 
 * FONCTIONNALITÉS :
 * ✅ Affichage de tous les produits en promotion
 * ✅ Calcul automatique des remises
 * ✅ Tri par pourcentage de remise décroissant
 * ✅ SEO optimisé pour les promotions
 * ✅ Loading states avec skeleton
 * ✅ SUPPORT LARGEUR 1500px
 * ❌ SUPPRIMÉ : Hero Section avec stats
 * ❌ SUPPRIMÉ : Section titre personnalisée
 * ❌ SUPPRIMÉ : Section informative
 * ❌ SUPPRIMÉ : Call to Action
 */
export default async function PromotionsPage() {
  try {
    console.log("🎯 Chargement de la page promotions simplifiée...");
    
    // ✅ RÉCUPÉRATION DES PRODUITS EN PROMOTION
    const promotionProducts = await getPromotionProducts();

    console.log(`✅ ${promotionProducts.length} produits en promotion trouvés`);

    return (
      <div className="min-h-screen bg-white">
        
        {/* BREADCRUMB NAVIGATION - ✅ CONSERVÉ */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <BreadcrumbNav 
              items={[
                { name: "Accueil", href: "/" },
                { name: "Promotions", href: "/promotions" }
              ]} 
            />
          </div>
        </section>

        {/* GRID DES PRODUITS EN PROMOTION - ✅ PRINCIPAL CONTENU */}
        <section className="flex-1 bg-gray-50">
          <div className="w-full max-w-[1500px] mx-auto">
            <Suspense fallback={<PromotionsSkeleton />}>
              <ProductGrid 
                products={promotionProducts}
                categoryName="Promotions" // ✅ ProductGrid affichera son propre H1
                showPageTitle={true} // ✅ REMIS À TRUE pour afficher le titre
                showPromotionBadges={true} // ✅ Afficher les badges de promotion
                defaultSortBy="discount" // ✅ Tri par défaut par remise décroissante
                enablePromotionFilters={true} // ✅ Filtres spécifiques aux promotions
              />
            </Suspense>
          </div>
        </section>

      </div>
    );
    
  } catch (error) {
    console.error("❌ Erreur lors du chargement de la page promotions:", error);
    
    // PAGE D'ERREUR ÉLÉGANTE - ✅ CONSERVÉE
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
            url: '/og-promotions.jpg',
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

/* ✅ ÉLÉMENTS SUPPRIMÉS :
 *
 * ❌ Import de PromotionsHero (plus utilisé)
 * ❌ Import de formatPrice, calculateDiscount (plus utilisés)
 * ❌ Appel à getPromotionStats() dans le composant principal
 * ❌ Hero Section complète avec animations et stats
 * ❌ Section titre personnalisée avec stats rapides
 * ❌ Section informative avec avantages
 * ❌ Section Call to Action
 *
 * ✅ ÉLÉMENTS CONSERVÉS :
 *
 * ✅ Breadcrumb navigation
 * ✅ ProductGrid avec tous ses paramètres promotions
 * ✅ showPageTitle={true} pour que ProductGrid affiche le H1
 * ✅ Métadonnées SEO complètes (utilisent encore getPromotionStats)
 * ✅ Gestion d'erreur élégante
 * ✅ Support 1500px largeur
 *
 * 📦 RÉSULTAT : Page ultra-simple avec juste ProductGrid + Breadcrumb
 * Le ProductGrid se charge d'afficher le titre, les filtres, le tri, etc.
 */