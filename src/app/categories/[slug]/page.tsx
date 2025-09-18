import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductGrid from "@/components/client/ProductGrid";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import { 
  getCategoryBySlug, 
  getCategoryProductsWithBrands, 
  getSubCategories
} from "@/lib/firebase-utils";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Page de catégorie - Server Component
 * Récupère les données côté serveur et les passe aux composants clients
 * ✅ MODIFIÉ : Ajout de la section description longue pour le SEO
 * ✅ CORRIGÉ : Hiérarchie H1-H4 appropriée
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const { slug } = await params;
    
    // Récupération de la catégorie par son slug
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      console.warn(`Catégorie introuvable pour le slug: ${slug}`);
      notFound();
    }
    
    // ✅ OPTIMISATION : Récupération en parallèle
    const [products, subCategories] = await Promise.all([
      getCategoryProductsWithBrands(category.id),
      getSubCategories(category.id)
    ]);
    
    console.log(`Catégorie "${category.name}" chargée avec ${products.length} produits et ${subCategories.length} sous-catégories`);
    
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1500px] mx-auto px-4 py-4">
            <BreadcrumbNav 
              items={[
                { name: "Accueil", href: "/" },
                { name: "Catégories", href: "/categories" },
                { name: category.name, href: `/categories/${category.slug}` }
              ]} 
            />
          </div>
        </section>



        {/* ✅ CORRIGÉ : Grid des produits sans H1 (CategoryInfo contient déjà le H1) */}
        <section className="flex-1">
          <div className="bg-white w-full max-w-[1500px] mx-auto">
            <ProductGrid 
              products={products}
              categorySlug={slug}
              categoryName={category.name}
              subCategories={subCategories}
              showPageTitle={false} // ✅ NOUVEAU : Empêche ProductGrid d'afficher son propre H1
            />
          </div>
        </section>

        {/* Section description longue pour le SEO - Compact et aligné */}
        {category.descriptionLongue && (
          <section className="bg-gray-50 border-t border-gray-100">
            <div className="w-full max-w-[1500px] mx-auto px-4 py-6">
              <div className="w-full text-center">
                <h2 className="text-lg font-medium text-gray-700 mb-3">
                  En savoir plus sur {category.name}
                </h2>
                <div className="text-gray-600 text-sm leading-5 text-justify">
                  <div
                    className="whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: category.descriptionLongue.replace(/\n/g, '<br />')
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la page catégorie:", error);
    notFound();
  }
}

/**
 * Génération des métadonnées SEO pour la page catégorie
 * ✅ MODIFIÉ : Utilisation de la description longue pour enrichir le SEO
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    
    if (!category) {
      return {
        title: "Catégorie introuvable | BeautyDiscount",
        description: "La catégorie demandée n'existe pas sur BeautyDiscount.",
        robots: {
          index: false,
          follow: false,
        }
      };
    }

    // ✅ OPTIMISATION : Récupération en parallèle pour les métadonnées
    const [products, subCategories] = await Promise.all([
      getCategoryProductsWithBrands(category.id),
      getSubCategories(category.id)
    ]);

    // Construction du titre optimisé pour le SEO
    const seoTitle = category.seo?.metaTitle || `${category.name} | BeautyDiscount`;
    
    // ✅ NOUVEAU : Utilisation de la description longue pour enrichir le SEO
    let seoDescription = category.seo?.metaDescription;
    
    if (!seoDescription) {
      // Priorité à la description longue si elle existe (tronquée pour les meta)
      if (category.descriptionLongue) {
        // Nettoyer et tronquer la description longue pour les métadonnées (160 caractères max)
        const cleanDescription = category.descriptionLongue
          .replace(/\n/g, ' ')
          .replace(/<[^>]*>/g, '') // Supprimer les balises HTML si présentes
          .trim();
        
        seoDescription = cleanDescription.length > 160 
          ? cleanDescription.substring(0, 157) + '...'
          : cleanDescription;
      } else {
        // Fallback sur un texte par défaut
        const baseDescription = `Découvrez notre sélection ${category.name.toLowerCase()} sur BeautyDiscount. Produits de beauté à prix discount au Maroc.`;
        
        // Enrichir avec les statistiques
        const statsInfo = [];
        if (products.length > 0) {
          statsInfo.push(`${products.length} produit${products.length > 1 ? 's' : ''}`);
        }
        if (subCategories.length > 0) {
          statsInfo.push(`${subCategories.length} sous-catégorie${subCategories.length > 1 ? 's' : ''}`);
        }
        
        seoDescription = statsInfo.length > 0 
          ? `${baseDescription} ${statsInfo.join(' et ')} disponible${statsInfo.length > 1 ? 's' : ''}.`
          : baseDescription;
      }
    }

    // Mots-clés avec noms des sous-catégories
    let keywords = category.seo?.metaKeywords;
    if (!keywords && subCategories.length > 0) {
      keywords = [
        category.name,
        ...subCategories.slice(0, 5).map(sc => sc.name), // Maximum 5 sous-catégories
        'beauté',
        'cosmétiques',
        'maroc',
        'discount'
      ];
    }

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords?.join(', '),
      
      // Open Graph pour les réseaux sociaux
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: category.seo?.canonicalUrl || `https://beautydiscount.ma/categories/${slug}`,
        type: 'website',
        images: category.image ? [
          {
            url: category.image,
            width: 1200,
            height: 630,
            alt: category.name,
          }
        ] : [],
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: category.image ? [category.image] : [],
      },

      // URL canonique
      alternates: {
        canonical: category.seo?.canonicalUrl || `https://beautydiscount.ma/categories/${slug}`,
      },

      // Autres métadonnées SEO
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
    console.error("Erreur lors de la génération des métadonnées:", error);
    
    // Métadonnées par défaut en cas d'erreur
    return {
      title: "BeautyDiscount - Produits de beauté",
      description: "Découvrez nos produits de beauté à prix discount au Maroc.",
    };
  }
}