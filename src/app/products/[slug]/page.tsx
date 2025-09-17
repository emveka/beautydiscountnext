// app/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";

import BreadcrumbNav from "@/components/server/BreadcrumbNav";
import ProductGallery from "@/components/client/ProductGallery";
import ProductInfo from "@/components/client/ProductInfo";
import ProductTabs from "@/components/client/ProductTabs";
import RelatedProducts from "@/components/client/RelatedProducts";
import ProductSchema from "@/components/server/ProductSchema";

import { 
  getProductBySlug,
  getCategoryById,
  getSubCategoryById,
  getCategoryProductsWithBrands,
  getSubCategoryProductsWithBrands,
  calculateDiscount,
  formatPrice,
  getProductImageUrl
} from "@/lib/firebase-utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Page produit détaillée - Server Component
 * Récupère toutes les données côté serveur pour optimiser le SEO
 * 
 * Fonctionnalités incluses :
 * - ✅ Galerie d'images responsive
 * - ✅ Informations produit avec prix et stock
 * - ✅ NOUVEAU : Intégration complète du système de panier
 * - ✅ Onglets description/caractéristiques/avis
 * - ✅ Produits similaires/recommandés
 * - ✅ Breadcrumb navigation complet
 * - ✅ Métadonnées SEO optimisées
 * - ✅ Schema.org structured data
 * - ✅ Corrections TypeScript et imports
 * - ✅ CORRIGÉ : Hiérarchie H1-H4 appropriée
 */
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;
    
    // Récupération du produit par son slug
    const product = await getProductBySlug(slug);
    
    if (!product) {
      console.warn(`Produit introuvable pour le slug: ${slug}`);
      notFound();
    }
    
    // ✅ Récupération en parallèle des données contextuelles avec IDs corrigés
    const [category, subCategory, relatedProducts] = await Promise.all([
      // Catégorie parente par ID (pas par slug)
      getCategoryById(product.categoryId),
      
      // Sous-catégorie si elle existe par ID (pas par slug)
      product.subCategoryId 
        ? getSubCategoryById(product.subCategoryId) 
        : Promise.resolve(null),
      
      // Produits similaires (même sous-catégorie ou catégorie)
      product.subCategoryId
        ? getSubCategoryProductsWithBrands(product.subCategoryId)
        : getCategoryProductsWithBrands(product.categoryId)
    ]);
    
    // Filtrer les produits similaires (exclure le produit actuel, max 8)
    const similarProducts = relatedProducts
      .filter(p => p.id !== product.id)
      .slice(0, 8);
    
    // Construction du breadcrumb dynamique
    const breadcrumbItems = [
      { name: "Accueil", href: "/" },
      { name: "Catégories", href: "/categories" }
    ];
    
    if (category) {
      breadcrumbItems.push({
        name: category.name,
        href: `/categories/${category.slug}`
      });
    }
    
    if (subCategory) {
      breadcrumbItems.push({
        name: subCategory.name,
        href: `/categories/${category?.slug}/${subCategory.slug}`
      });
    }
    
    breadcrumbItems.push({
      name: product.name,
      href: `/products/${product.slug}`
    });
    
    // Calcul des données d'affichage
    const discount = calculateDiscount(product.price, product.originalPrice);
    const isOnSale = !!(product.originalPrice && product.originalPrice > product.price);
    
    console.log(`Produit "${product.name}" chargé avec ${similarProducts.length} produits similaires`);
    
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1700px] mx-auto px-4 py-4">
            <BreadcrumbNav items={breadcrumbItems} />
          </div>
        </section>

        {/* Contenu principal du produit */}
        <section className="py-8">
          <div className="w-full max-w-[1700px] mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* ✅ Galerie d'images - Côté gauche */}
              <div className="space-y-4">
                <ProductGallery 
                  images={product.images}
                  imagePaths={product.imagePaths}
                  productName={product.name}
                  priority={true} // Image principale en priority
                />
              </div>

              {/* ✅ NOUVEAU : Informations produit avec intégration panier - Côté droit */}
              {/* ProductInfo contient déjà le H1 principal */}
              <div className="space-y-6">
                <ProductInfo 
                  product={product}
                  category={category}
                  subCategory={subCategory}
                  discount={discount}
                  isOnSale={isOnSale}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Onglets détails produit */}
        <section className="py-8 bg-gray-50">
          <div className="w-full max-w-[1700px] mx-auto px-4">
            <ProductTabs 
              product={product}
              category={category}
              subCategory={subCategory}
            />
          </div>
        </section>

        {/* ✅ CORRIGÉ : Produits similaires avec H2 approprié */}
        {similarProducts.length > 0 && (
          <section className="py-12 bg-white">
            <div className="w-full max-w-[1700px] mx-auto px-4">
              {/* ✅ CORRECTION PRINCIPALE : Ajout du H2 obligatoire pour la section */}
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  Produits similaires
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Découvrez d&apos;autres produits qui pourraient vous intéresser dans la même catégorie
                </p>
              </div>
              
              {/* RelatedProducts utilise maintenant H3 au lieu de H2 */}
              <RelatedProducts 
                products={similarProducts}
                title={subCategory 
                  ? `Autres produits en ${subCategory.name}` 
                  : `Autres produits en ${category?.name || 'cette catégorie'}`
                }
                categorySlug={category?.slug}
                currentProductId={product.id}
              />
            </div>
          </section>
        )}

        {/* ✅ Données structurées Schema.org */}
        <ProductSchema 
          product={product}
          category={category}
          subCategory={subCategory}
          similarProducts={similarProducts.slice(0, 4)}
        />
      </div>
    );
    
  } catch (error) {
    console.error("Erreur lors du chargement de la page produit:", error);
    notFound();
  }
}

/**
 * ✅ GÉNÉRATION DES MÉTADONNÉES SEO OPTIMISÉES
 * Utilise toutes les données du produit pour maximiser le référencement
 * ✅ Fix des propriétés Open Graph non standard
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return {
        title: "Produit introuvable | BeautyDiscount",
        description: "Le produit demandé n'existe pas sur BeautyDiscount.",
        robots: {
          index: false,
          follow: false,
        }
      };
    }

    // Récupération du contexte pour enrichir les métadonnées
    const [category, subCategory] = await Promise.all([
      getCategoryById(product.categoryId),
      product.subCategoryId 
        ? getSubCategoryById(product.subCategoryId)
        : Promise.resolve(null)
    ]);

    // ✅ Construction du titre SEO optimisé
    const seoTitle = product.seo?.metaTitle || 
      `${product.name} | ${product.brandName ? product.brandName + ' - ' : ''}BeautyDiscount`;
    
    // ✅ Description enrichie avec contexte
    let seoDescription = product.seo?.metaDescription;
    
    if (!seoDescription) {
      const baseDescription = product.shortDescription || product.description || product.name;
      const contextParts = [];
      
      if (product.brandName) contextParts.push(product.brandName);
      if (subCategory) contextParts.push(subCategory.name);
      else if (category) contextParts.push(category.name);
      
      const priceInfo = product.originalPrice 
        ? `Prix réduit ${formatPrice(product.price)} (était ${formatPrice(product.originalPrice)})`
        : `${formatPrice(product.price)}`;
      
      seoDescription = `${baseDescription}${contextParts.length ? ' - ' + contextParts.join(' | ') : ''}. ${priceInfo}. Livraison rapide au Maroc.`;
      
      // Limiter à 160 caractères pour les métadonnées
      if (seoDescription.length > 160) {
        seoDescription = seoDescription.substring(0, 157) + '...';
      }
    }

    // ✅ Mots-clés enrichis avec le contexte
    let keywords = product.seo?.metaKeywords;
    if (!keywords) {
      keywords = [
        product.name,
        ...(product.brandName ? [product.brandName] : []),
        ...(subCategory ? [subCategory.name] : []),
        ...(category ? [category.name] : []),
        ...(product.contenance ? [product.contenance] : []),
        'beauté',
        'cosmétiques',
        'maroc',
        'discount'
      ];
    }

    // ✅ Image principale pour les réseaux sociaux
    const productImage = getProductImageUrl(product);
    const ogImage = productImage.startsWith('http') 
      ? productImage 
      : `https://beautydiscount.ma${productImage}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords?.join(', '),
      
      // ✅ Open Graph pour les réseaux sociaux (propriétés corrigées)
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://beautydiscount.ma/products/${slug}`,
        type: 'website', // Changé de 'product' vers 'website' pour éviter l'erreur
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: product.name,
          }
        ],
      },

      // ✅ Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: [ogImage],
      },

      // ✅ URL canonique
      alternates: {
        canonical: product.seo?.canonicalUrl || `https://beautydiscount.ma/products/${slug}`,
      },

      // ✅ Métadonnées e-commerce dans 'other' (solution pour les propriétés custom)
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': 'MAD',
        'product:availability': product.stock === 'En Stock' ? 'in stock' : 'out of stock',
        ...(product.brandName && { 'product:brand': product.brandName }),
        ...(product.sku && { 'product:sku': product.sku }),
      },

      // ✅ Robots et indexation
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
    console.error("Erreur lors de la génération des métadonnées produit:", error);
    
    return {
      title: "BeautyDiscount - Produits de beauté",
      description: "Découvrez nos produits de beauté à prix discount au Maroc.",
    };
  }
}

/**
 * ✅ GÉNÉRATION STATIQUE DES PARAMÈTRES (Optionnel)
 * Pour pré-générer les pages des produits les plus populaires
 */
export async function generateStaticParams() {
  try {
    // Vous pouvez récupérer les slugs des produits les plus populaires
    // pour les pré-générer au build time
    
    // const popularProducts = await getPopularProducts(50);
    // return popularProducts.map(product => ({
    //   slug: product.slug
    // }));
    
    // Pour l'instant, on retourne un tableau vide (génération à la demande)
    return [];
    
  } catch (error) {
    console.error("Erreur lors de la génération des paramètres statiques:", error);
    return [];
  }
}