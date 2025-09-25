// app/products/[slug]/page.tsx - VERSION MULTI-CATÉGORIES
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
  getProductsByMultipleCategories,
  getProductsByMultipleSubCategories,
  resolveProductContext,
  calculateDiscount,
  formatPrice,
  getProductImageUrl
} from "@/lib/firebase-utils";
import { Category, Product, SubCategory } from "@/lib/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ---- Types utilitaires (pas d'import Timestamp pour éviter no-unused-vars)
type FirestoreTimestampLike = { seconds: number; nanoseconds?: number };
type HasToMillis = { toMillis: () => number };

function isFirestoreTimestampLike(v: unknown): v is FirestoreTimestampLike {
  return (
    typeof v === "object" &&
    v !== null &&
    "seconds" in v &&
    typeof (v as Record<"seconds", unknown>).seconds === "number"
  );
}

function hasToMillis(v: unknown): v is HasToMillis {
  return (
    typeof v === "object" &&
    v !== null &&
    "toMillis" in v &&
    typeof (v as Record<"toMillis", unknown>).toMillis === "function"
  );
}

/**
 * Convertit plusieurs formats de date (Date, number, string ISO,
 * Firestore Timestamp, objet {seconds, nanoseconds}, objet avec toMillis)
 * en nombre (ms), sans utiliser `any`.
 */
function toCacheKey(input: unknown): number {
  // Date
  if (input instanceof Date) return input.getTime();

  // number direct
  if (typeof input === "number" && Number.isFinite(input)) return input;

  // string parsable (ISO ou autre)
  if (typeof input === "string") {
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return t;
  }

  // Firestore Timestamp (type import) — détecté via méthode toMillis
  if (hasToMillis(input)) {
    try {
      return input.toMillis();
    } catch {
      // ignore et continue
    }
  }

  // Firestore-like { seconds, nanoseconds }
  if (isFirestoreTimestampLike(input)) {
    return Math.floor(input.seconds * 1000);
  }

  // Valeur de secours
  return Date.now();
}

/**
 * Page produit détaillée - Server Component OPTIMISÉ MULTI-CATÉGORIES
 *
 * ✅ NOUVELLES FONCTIONNALITÉS MULTI-CATÉGORIES :
 * - Support produits avec plusieurs catégories/sous-catégories
 * - Breadcrumb intelligent multi-catégories
 * - Produits similaires basés sur toutes les catégories
 * - Rétrocompatibilité totale avec anciens produits
 * - Métadonnées enrichies avec toutes les catégories
 */
export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const { slug } = await params;

    // Récupération du produit par son slug avec migration automatique
    const product = await getProductBySlug(slug);

    if (!product) {
      console.warn(`Produit introuvable pour le slug: ${slug}`);
      notFound();
    }

    console.log(`🔍 Produit chargé:`, {
      name: product.name,
      categoriesCount: product.categoryIds.length,
      subCategoriesCount: product.subCategoryIds.length,
      categoryIds: product.categoryIds,
      subCategoryIds: product.subCategoryIds
    });

    // 🆕 RÉCUPÉRATION MULTI-CATÉGORIES EN PARALLÈLE
    const [contextResult, relatedProducts] = await Promise.all([
      // Résolution de toutes les catégories et sous-catégories
      resolveProductContext(product.categoryIds, product.subCategoryIds),

      // Produits similaires basés sur toutes les catégories/sous-catégories
      getRelatedProductsMultiCategories(product)
    ]);

    const { categories, subCategories } = contextResult;

    console.log(`📊 Contexte résolu:`, {
      categoriesFound: categories.length,
      subCategoriesFound: subCategories.length,
      relatedProductsFound: relatedProducts.length
    });

    // Filtrer les produits similaires (exclure le produit actuel, max 8)
    const similarProducts = relatedProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 8);

    // 🆕 CONSTRUCTION DU BREADCRUMB MULTI-CATÉGORIES
    const breadcrumbItems = buildMultiCategoryBreadcrumb(product, categories, subCategories);

    // Calcul des données d'affichage (inchangé)
    const discount = calculateDiscount(product.price, product.originalPrice);
    const isOnSale = !!(product.originalPrice && product.originalPrice > product.price);

    // 🆕 SÉLECTION DE LA CATÉGORIE PRINCIPALE POUR L'AFFICHAGE
    const primaryCategory = categories[0] || null;
    const primarySubCategory = subCategories[0] || null;

    console.log(`✅ Page produit multi-catégories préparée:`, {
      productName: product.name,
      primaryCategory: primaryCategory?.name,
      primarySubCategory: primarySubCategory?.name,
      totalCategories: categories.length,
      totalSubCategories: subCategories.length,
      similarProductsCount: similarProducts.length
    });

    return (
      <div className="min-h-screen bg-white">
        {/* 🎯 BREADCRUMB - Multi-catégories optimisé */}
        <section className="bg-white border-b border-gray-200">
          <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <BreadcrumbNav items={breadcrumbItems} />
          </div>
        </section>

        {/* 🎯 CONTENU PRINCIPAL - Layout mobile first */}
        <section className="py-4 sm:py-6 lg:py-8">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            {/* Grid responsive avec gap adaptatif */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
              {/* 🎯 GALERIE D'IMAGES - Optimisée mobile */}
              <div className="space-y-3 sm:space-y-4">
                <ProductGallery
                  images={product.images}
                  imagePaths={product.imagePaths}
                  productName={product.name}
                  priority
                  cacheKey={toCacheKey(product.updatedAt)}
                />
              </div>

              {/* 🎯 INFORMATIONS PRODUIT - Multi-catégories */}
              <div className="space-y-4 sm:space-y-6">
                <ProductInfo
                  product={product}
                  categories={categories} // 🔄 Nouveau : toutes les catégories
                  subCategories={subCategories} // 🔄 Nouveau : toutes les sous-catégories
                  primaryCategory={primaryCategory} // 🔄 Rétrocompatibilité
                  primarySubCategory={primarySubCategory} // 🔄 Rétrocompatibilité
                  discount={discount}
                  isOnSale={isOnSale}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 ONGLETS DÉTAILS - Multi-catégories */}
        <section className="py-4 sm:py-6 lg:py-8 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
            <ProductTabs
              product={product}
              categories={categories} // 🔄 Nouveau
              subCategories={subCategories} // 🔄 Nouveau
              primaryCategory={primaryCategory} // 🔄 Rétrocompatibilité
              primarySubCategory={primarySubCategory} // 🔄 Rétrocompatibilité
            />
          </div>
        </section>

        {/* 🎯 PRODUITS SIMILAIRES - Multi-catégories intelligents */}
        {similarProducts.length > 0 && (
          <section className="py-6 sm:py-8 lg:py-12 bg-white">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
              {/* En-tête de section avec contexte multi-catégories */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Produits similaires
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
                  {buildSimilarProductsDescription(categories, subCategories)}
                </p>
              </div>

              {/* Carrousel de produits similaires */}
              <RelatedProducts
                products={similarProducts}
                title={getSimilarProductsTitle(categories, subCategories)}
                categorySlug={primaryCategory?.slug}
                currentProductId={product.id}
                // 🆕 Nouvelles props multi-catégories
                categories={categories}
                subCategories={subCategories}
              />
            </div>
          </section>
        )}

        {/* 🆕 AFFICHAGE DES CATÉGORIES MULTIPLES (si plus d'une catégorie) */}
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

        {/* 🎯 PADDING BOTTOM MOBILE */}
        <div className="sm:hidden h-4"></div>

        {/* Données structurées Schema.org multi-catégories */}
        <ProductSchema
          product={product}
          categories={categories} // 🔄 Nouveau
          subCategories={subCategories} // 🔄 Nouveau
          primaryCategory={primaryCategory} // 🔄 Rétrocompatibilité
          primarySubCategory={primarySubCategory} // 🔄 Rétrocompatibilité
          similarProducts={similarProducts.slice(0, 4)}
        />
      </div>
    );
  } catch (error) {
    console.error("❌ Erreur lors du chargement de la page produit multi-catégories:", error);
    notFound();
  }
}

// ===== FONCTIONS UTILITAIRES MULTI-CATÉGORIES =====

/**
 * 🆕 Récupération intelligente des produits similaires multi-catégories
 */
async function getRelatedProductsMultiCategories(product: Product) {
  try {
    const relatedProducts: Product[] = [];

    // Stratégie 1: Produits des mêmes sous-catégories (plus spécifique)
    if (product.subCategoryIds.length > 0) {
      const subCategoryProducts = await getProductsByMultipleSubCategories(
        product.subCategoryIds
      );
      relatedProducts.push(...subCategoryProducts);
    }

    // Stratégie 2: Si pas assez de résultats, ajouter des produits des catégories principales
    if (relatedProducts.length < 12 && product.categoryIds.length > 0) {
      const categoryProducts = await getProductsByMultipleCategories(
        product.categoryIds
      );

      // Éviter les doublons
      const existingIds = new Set(relatedProducts.map((p) => p.id));
      const newProducts = categoryProducts.filter((p) => !existingIds.has(p.id));

      relatedProducts.push(...newProducts);
    }

    // Tri par score décroissant et limitation
    return relatedProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Plus de produits pour avoir plus de choix après filtrage
  } catch (error) {
    console.error("❌ Erreur récupération produits similaires multi-catégories:", error);
    return [];
  }
}

/**
 * 🆕 Construction du breadcrumb intelligent multi-catégories
 */
function buildMultiCategoryBreadcrumb(
  product: Product,
  categories: Category[],
  subCategories: SubCategory[]
) {
  const breadcrumbItems = [
    { name: "Accueil", href: "/" },
    { name: "Catégories", href: "/categories" }
  ];

  // Stratégie intelligente pour le breadcrumb :
  // 1. Si une seule catégorie : breadcrumb classique
  // 2. Si plusieurs catégories : utiliser la première (ou la plus pertinente)

  const primaryCategory = categories[0];
  const primarySubCategory =
    subCategories.find((sub) => sub.parentId === primaryCategory?.id) ||
    subCategories[0];

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

/**
 * 🆕 Génération du titre pour les produits similaires
 */
function getSimilarProductsTitle(
  categories: Category[],
  subCategories: SubCategory[]
): string {
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

/**
 * 🆕 Description pour les produits similaires
 */
function buildSimilarProductsDescription(
  categories: Category[],
  subCategories: SubCategory[]
): string {
  if (subCategories.length > 1) {
    return `Découvrez d'autres produits dans les sous-catégories ${subCategories
      .map((s) => s.name)
      .join(", ")}`;
  }

  if (subCategories.length === 1) {
    return `Découvrez d'autres produits dans la sous-catégorie ${subCategories[0].name}`;
  }

  if (categories.length > 1) {
    return `Découvrez d'autres produits dans les catégories ${categories
      .map((c) => c.name)
      .join(", ")}`;
  }

  if (categories.length === 1) {
    return `Découvrez d'autres produits dans la catégorie ${categories[0].name}`;
  }

  return "Découvrez d'autres produits qui pourraient vous intéresser";
}

// ===== MÉTADONNÉES SEO MULTI-CATÉGORIES =====

/**
 * ✅ MÉTADONNÉES SEO OPTIMISÉES MULTI-CATÉGORIES
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
          follow: false
        }
      };
    }

    // 🆕 RÉCUPÉRATION DU CONTEXTE MULTI-CATÉGORIES
    const { categories, subCategories } = await resolveProductContext(
      product.categoryIds,
      product.subCategoryIds
    );

    // Construction du titre SEO enrichi avec contexte multi-catégories
    const seoTitle =
      product.seo?.metaTitle ||
      `${product.name} | ${product.brandName ? product.brandName + " - " : ""}BeautyDiscount`;

    // 🆕 DESCRIPTION ENRICHIE MULTI-CATÉGORIES
    let seoDescription = product.seo?.metaDescription;

    if (!seoDescription) {
      const baseDescription = product.shortDescription || product.description || product.name;
      const contextParts: string[] = [];

      if (product.brandName) contextParts.push(product.brandName);

      // 🔄 Ajout du contexte multi-catégories
      if (subCategories.length > 0) {
        contextParts.push(...subCategories.slice(0, 2).map((s) => s.name));
      } else if (categories.length > 0) {
        contextParts.push(...categories.slice(0, 2).map((c) => c.name));
      }

      const priceInfo = product.originalPrice
        ? `Prix réduit ${formatPrice(product.price)} (était ${formatPrice(product.originalPrice)})`
        : `${formatPrice(product.price)}`;

      seoDescription = `${baseDescription}${
        contextParts.length ? " - " + contextParts.join(" | ") : ""
      }. ${priceInfo}. Livraison rapide au Maroc.`;

      if (seoDescription.length > 160) {
        seoDescription = seoDescription.substring(0, 157) + "...";
      }
    }

    // 🆕 MOTS-CLÉS ENRICHIS MULTI-CATÉGORIES
    let keywords = product.seo?.metaKeywords;
    if (!keywords) {
      keywords = [
        product.name,
        ...(product.brandName ? [product.brandName] : []),
        ...subCategories.map((s) => s.name),
        ...categories.map((c) => c.name),
        ...(product.contenance ? [product.contenance] : []),
        "beauté",
        "cosmétiques",
        "maroc",
        "discount"
      ];
    }

    const productImage = getProductImageUrl(product);
    const ogImage = productImage.startsWith("http")
      ? productImage
      : `https://beautydiscount.ma${productImage}`;

    return {
      title: seoTitle,
      description: seoDescription,
      keywords: keywords?.join(", "),

      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `https://beautydiscount.ma/products/${slug}`,
        type: "website",
        images: [
          {
            url: ogImage,
            width: 800,
            height: 800,
            alt: product.name
          }
        ]
      },

      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description: seoDescription,
        images: [ogImage]
      },

      alternates: {
        canonical: product.seo?.canonicalUrl || `https://beautydiscount.ma/products/${slug}`
      },

      other: {
        "product:price:amount": product.price.toString(),
        "product:price:currency": "MAD",
        "product:availability": product.stock === "En Stock" ? "in stock" : "out of stock",
        ...(product.brandName && { "product:brand": product.brandName }),
        ...(product.sku && { "product:sku": product.sku }),
        // 🆕 Métadonnées multi-catégories
        ...(categories.length > 0 && {
          "product:categories": categories.map((c) => c.name).join(", ")
        }),
        ...(subCategories.length > 0 && {
          "product:subcategories": subCategories.map((s) => s.name).join(", ")
        })
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1
        }
      }
    };
  } catch (error) {
    console.error("❌ Erreur génération métadonnées produit multi-catégories:", error);

    return {
      title: "BeautyDiscount - Produits de beauté",
      description: "Découvrez nos produits de beauté à prix discount au Maroc."
    };
  }
}

/**
 * ✅ GÉNÉRATION STATIQUE DES PARAMÈTRES (Optionnel)
 */
export async function generateStaticParams() {
  try {
    // Retourne un tableau vide (génération à la demande)
    return [];
  } catch (error) {
    console.error("❌ Erreur génération paramètres statiques:", error);
    return [];
  }
}
