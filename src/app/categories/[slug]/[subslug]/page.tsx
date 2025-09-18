import { notFound } from "next/navigation";
import { Metadata } from "next";

import ProductGrid from "@/components/client/ProductGrid";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import { 
  getCategoryBySlug, 
  getSubCategoryBySlug,
  getSubCategoryProductsWithBrands, 
  getSubCategories 
} from "@/lib/firebase-utils";

interface SubCategoryPageProps {
  params: Promise<{ 
    slug: string;      // slug de la catégorie parente
    subslug: string;   // slug de la sous-catégorie
  }>; 
}

/**
 * Page de sous-catégorie - Server Component
 * Récupère les données côté serveur et les passe aux composants clients
 * ✅ NOUVEAU : Inclut le skeleton loading avec Suspense
 * ✅ CORRIGÉ : Hiérarchie H1-H4 appropriée
 * 
 * URL : /categories/lissages/lissage-bresilien
 * Params : { slug: "lissages", subslug: "lissage-bresilien" }
 */
export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
  try {
    const { slug, subslug } = await params;
    
    // Récupération de la catégorie parent et de la sous-catégorie
    const [parentCategory, subCategory] = await Promise.all([
      getCategoryBySlug(slug),
      getSubCategoryBySlug(subslug, slug)
    ]);
    
    if (!parentCategory) {
      console.warn(`Catégorie parente introuvable pour le slug: ${slug}`);
      notFound();
    }
    
    if (!subCategory) {
      console.warn(`Sous-catégorie introuvable pour le slug: ${subslug} dans ${slug}`);
      notFound();
    }
    
    // ✅ OPTIMISATION : Récupération en parallèle
    const [products, siblingSubCategories] = await Promise.all([
      getSubCategoryProductsWithBrands(subCategory.id),
      getSubCategories(parentCategory.id)
    ]);
    
    console.log(`Sous-catégorie "${subCategory.name}" chargée avec ${products.length} produits`);
    
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1700px] mx-auto px-4 py-4">
            <BreadcrumbNav 
              items={[
                { name: "Accueil", href: "/" },
                { name: "Catégories", href: "/categories" },
                { name: parentCategory.name, href: `/categories/${parentCategory.slug}` },
                { name: subCategory.name, href: `/categories/${slug}/${subslug}` }
              ]} 
            />
          </div>
        </section>



        {/* ✅ CORRIGÉ : Grid des produits sans H1 (CategoryInfo contient déjà le H1) */}
        <section className="flex-1">
          <div className="bg-white w-full max-w-[1700px] mx-auto">
            <ProductGrid 
              products={products}
              categorySlug={slug}
              categoryName={subCategory.name}
              subCategories={siblingSubCategories} // Autres sous-catégories pour filtres
              currentSubCategoryId={subCategory.id} // ✅ Pour marquer la sous-cat actuelle
              showPageTitle={false} // ✅ NOUVEAU : Empêche ProductGrid d'afficher son propre H1
            />
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement de la page sous-catégorie:", error);
    notFound();
  }
}

/**
 * Génération des métadonnées SEO pour la page sous-catégorie
 * Utilise les données de la sous-catégorie pour optimiser le référencement
 */
export async function generateMetadata({ params }: SubCategoryPageProps): Promise<Metadata> {
  try {
    const { slug, subslug } = await params;
    const [parentCategory, subCategory] = await Promise.all([
      getCategoryBySlug(slug),
      getSubCategoryBySlug(subslug, slug)
    ]);
    
    if (!parentCategory || !subCategory) {
      return {
        title: "Page introuvable | BeautyDiscount",
        description: "La page demandée n'existe pas sur BeautyDiscount.",
        robots: {
          index: false,
          follow: false,
        }
      };
    }

    // Récupération des produits pour enrichir les métadonnées
    const products = await getSubCategoryProductsWithBrands(subCategory.id);

    // Construction du titre optimisé pour le SEO
    const seoTitle = subCategory.seo?.metaTitle || 
      `${subCategory.name} - ${parentCategory.name} | BeautyDiscount`;
    
    // Description SEO enrichie
    let seoDescription = subCategory.seo?.metaDescription;
    
    if (!seoDescription) {
      const baseDescription = subCategory.description || 
        `Découvrez notre collection ${subCategory.name.toLowerCase()} dans la catégorie ${parentCategory.name.toLowerCase()}. Produits de beauté à prix discount au Maroc.`;
      
      seoDescription = products.length > 0 
        ? `${baseDescription} ${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}.`
        : baseDescription;
    }

    // Mots-clés enrichis
    const keywords = subCategory.seo?.metaKeywords || [
      subCategory.name,
      parentCategory.name,
      'beauté',
      'cosmétiques',
      'maroc',
      'discount'
    ];

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords?.join(', '),
      
      // Open Graph
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://beautydiscount.ma/categories/${slug}/${subslug}`,
        type: 'website',
        images: (subCategory.image || parentCategory.image) ? [
          {
            url: subCategory.image || parentCategory.image!,
            width: 1200,
            height: 630,
            alt: subCategory.name,
          }
        ] : [],
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: (subCategory.image || parentCategory.image) ? [subCategory.image || parentCategory.image!] : [],
      },

      // URL canonique
      alternates: {
        canonical: subCategory.seo?.canonicalUrl || `https://beautydiscount.ma/categories/${slug}/${subslug}`,
      },

      // Robots
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
    
    return {
      title: "BeautyDiscount - Produits de beauté",
      description: "Découvrez nos produits de beauté à prix discount au Maroc.",
    };
  }
}