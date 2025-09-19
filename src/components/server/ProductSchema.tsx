// components/server/ProductSchema.tsx - INTERFACE MISE À JOUR MULTI-CATÉGORIES
import type { Product, Category, SubCategory } from '@/lib/types';
import { getProductImageUrl } from '@/lib/firebase-utils';

// ✅ INTERFACE MISE À JOUR POUR MULTI-CATÉGORIES
interface ProductSchemaProps {
  product: Product;
  
  // ✅ NOUVELLES PROPS MULTI-CATÉGORIES
  categories: Category[];           // 🔄 Tableau de toutes les catégories
  subCategories: SubCategory[];     // 🔄 Tableau de toutes les sous-catégories
  
  // ✅ PROPS DE RÉTROCOMPATIBILITÉ (optionnelles)
  primaryCategory?: Category | null;      // 🔄 Catégorie principale pour rétrocompatibilité
  primarySubCategory?: SubCategory | null; // 🔄 Sous-catégorie principale pour rétrocompatibilité
  
  // ✅ PROPS EXISTANTES
  similarProducts: Product[];
  
  // 🆕 PROPS HÉRITÉES (pour compatibilité avec l'ancien code)
  category?: Category | null;       // 🔄 Déprécié mais supporté
  subCategory?: SubCategory | null; // 🔄 Déprécié mais supporté
}

/**
 * Composant server ProductSchema - Données structurées Schema.org avec support multi-catégories
 * 
 * Fonctionnalités :
 * ✅ Schema.org Product complet avec multi-catégories
 * ✅ Schema.org BreadcrumbList intelligent
 * ✅ Schema.org Offer avec prix et disponibilité
 * ✅ Schema.org AggregateRating
 * ✅ Schema.org ItemList pour produits similaires
 * ✅ Optimisation SEO e-commerce multi-catégories
 */
export default function ProductSchema({ 
  product,
  categories = [],
  subCategories = [],
  primaryCategory = null,
  primarySubCategory = null,
  category = null,    // 🔄 Rétrocompatibilité
  subCategory = null, // 🔄 Rétrocompatibilité
  similarProducts
}: ProductSchemaProps) {
  
  // ✅ DÉTERMINATION INTELLIGENTE DE LA CATÉGORIE À UTILISER
  const displayCategory = primaryCategory || category || categories[0] || null;
  const displaySubCategory = primarySubCategory || subCategory || subCategories[0] || null;
  
  // Construction de l'URL de l'image principale
  const productImage = getProductImageUrl(product);
  const imageUrl = productImage.startsWith('http') 
    ? productImage 
    : `https://beautydiscount.ma${productImage}`;
  
  // ✅ GÉNÉRATION INTELLIGENTE DES CATÉGORIES POUR SCHEMA.ORG
  const generateCategoryString = () => {
    if (subCategories.length > 0) {
      return subCategories[0].name;
    }
    if (categories.length > 0) {
      return categories[0].name;
    }
    return displaySubCategory?.name || displayCategory?.name || "Beauté";
  };
  
  // ✅ GÉNÉRATION DES PROPRIÉTÉS ADDITIONNELLES MULTI-CATÉGORIES
  const generateAdditionalProperties = () => {
    const properties = [];
    
    // Contenance
    if (product.contenance) {
      properties.push({
        "@type": "PropertyValue",
        "name": "Contenance",
        "value": product.contenance
      });
    }
    
    // Référence
    properties.push({
      "@type": "PropertyValue",
      "name": "Référence",
      "value": product.sku
    });
    
    // Catégories multiples
    if (categories.length > 1) {
      properties.push({
        "@type": "PropertyValue",
        "name": "Catégories",
        "value": categories.map(c => c.name).join(", ")
      });
    }
    
    // Sous-catégories multiples
    if (subCategories.length > 1) {
      properties.push({
        "@type": "PropertyValue",
        "name": "Sous-catégories", 
        "value": subCategories.map(s => s.name).join(", ")
      });
    }
    
    // Indicateur multi-catégories
    if (categories.length > 1 || subCategories.length > 1) {
      properties.push({
        "@type": "PropertyValue",
        "name": "Classification",
        "value": "Produit multi-catégories"
      });
    }
    
    return properties;
  };
  
  // Schema.org Product principal avec support multi-catégories
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.shortDescription || product.description,
    "sku": product.sku,
    "image": [imageUrl, ...product.images.slice(1, 4)], // Jusqu'à 4 images
    "url": `https://beautydiscount.ma/products/${product.slug}`,
    
    // Marque
    ...(product.brandName && {
      "brand": {
        "@type": "Brand",
        "name": product.brandName
      }
    }),
    
    // ✅ CATÉGORIE INTELLIGENTE MULTI-CATÉGORIES
    "category": generateCategoryString(),
    
    // ✅ CATÉGORIES ADDITIONNELLES (extension Schema.org)
    ...(categories.length > 1 && {
      "additionalType": categories.map(c => `https://beautydiscount.ma/categories/${c.slug}`)
    }),
    
    // ✅ PROPRIÉTÉS ADDITIONNELLES ENRICHIES
    "additionalProperty": generateAdditionalProperties(),
    
    // Offre commerciale
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "MAD",
      "availability": getAvailabilitySchema(product.stock),
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "BeautyDiscount",
        "url": "https://beautydiscount.ma"
      },
      "validFrom": new Date().toISOString(),
      
      // Prix de référence si en promotion
      ...(product.originalPrice && product.originalPrice > product.price && {
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
        "highPrice": product.originalPrice.toString()
      })
    },
    
    // Évaluation agrégée (données factices pour l'exemple)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "23",
      "bestRating": "5",
      "worstRating": "1"
    },
    
    // Avis récents (données factices)
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah M."
        },
        "reviewBody": "Excellent produit ! Très satisfaite de mon achat.",
        "datePublished": "2025-09-15"
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4", 
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Amina K."
        },
        "reviewBody": "Bon produit, conforme à mes attentes.",
        "datePublished": "2025-09-10"
      }
    ]
  };
  
  // ✅ BREADCRUMB INTELLIGENT MULTI-CATÉGORIES
  const generateBreadcrumbSchema = () => {
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://beautydiscount.ma"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Catégories",
        "item": "https://beautydiscount.ma/categories"
      }
    ];
    
    let currentPosition = 3;
    
    // Ajouter la catégorie principale
    if (displayCategory) {
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": currentPosition++,
        "name": displayCategory.name,
        "item": `https://beautydiscount.ma/categories/${displayCategory.slug}`
      });
    }
    
    // Ajouter la sous-catégorie principale
    if (displaySubCategory) {
      breadcrumbItems.push({
        "@type": "ListItem",
        "position": currentPosition++,
        "name": displaySubCategory.name,
        "item": `https://beautydiscount.ma/categories/${displayCategory?.slug}/${displaySubCategory.slug}`
      });
    }
    
    // Ajouter le produit
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": currentPosition,
      "name": product.name,
      "item": `https://beautydiscount.ma/products/${product.slug}`
    });
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    };
  };
  
  // Schema.org Organization (BeautyDiscount)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BeautyDiscount",
    "url": "https://beautydiscount.ma",
    "logo": "https://beautydiscount.ma/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+212-XXX-XXXXXX",
      "contactType": "Customer Service",
      "availableLanguage": ["French", "Arabic"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Casablanca",
      "addressCountry": "MA"
    },
    "sameAs": [
      "https://www.facebook.com/beautydiscount",
      "https://www.instagram.com/beautydiscount"
    ]
  };
  
  // ✅ SCHEMA ITEMLIST POUR PRODUITS SIMILAIRES ENRICHI
  const generateSimilarProductsSchema = () => {
    if (similarProducts.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Produits similaires",
      "description": `Produits similaires à ${product.name}${categories.length > 1 ? ` dans ${categories.length} catégories` : ''}`,
      "numberOfItems": similarProducts.length,
      "itemListElement": similarProducts.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": item.name,
          "url": `https://beautydiscount.ma/products/${item.slug}`,
          "image": getProductImageUrl(item).startsWith('http') 
            ? getProductImageUrl(item)
            : `https://beautydiscount.ma${getProductImageUrl(item)}`,
          "offers": {
            "@type": "Offer",
            "price": item.price.toString(),
            "priceCurrency": "MAD",
            "availability": getAvailabilitySchema(item.stock)
          },
          ...(item.brandName && {
            "brand": {
              "@type": "Brand",
              "name": item.brandName
            }
          }),
          // ✅ CATÉGORIE POUR PRODUITS SIMILAIRES
          "category": item.categoryIds.length > 0 ? "Beauté" : generateCategoryString()
        }
      }))
    };
  };
  
  // ✅ SCHEMA WEBPAGE ENRICHI MULTI-CATÉGORIES
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${product.name} | BeautyDiscount`,
    "description": product.shortDescription || product.description,
    "url": `https://beautydiscount.ma/products/${product.slug}`,
    "mainEntity": {
      "@id": `https://beautydiscount.ma/products/${product.slug}#product`
    },
    "breadcrumb": {
      "@id": `https://beautydiscount.ma/products/${product.slug}#breadcrumb`
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "BeautyDiscount",
      "url": "https://beautydiscount.ma"
    },
    // ✅ MENTIONS DES CATÉGORIES MULTIPLES
    ...(categories.length > 1 && {
      "mentions": categories.map(cat => ({
        "@type": "Thing",
        "name": cat.name,
        "url": `https://beautydiscount.ma/categories/${cat.slug}`
      }))
    })
  };

  const breadcrumbSchema = generateBreadcrumbSchema();
  const similarProductsSchema = generateSimilarProductsSchema();

  return (
    <>
      {/* Schema.org Product principal */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...productSchema,
            "@id": `https://beautydiscount.ma/products/${product.slug}#product`
          })
        }}
      />
      
      {/* Schema.org Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...breadcrumbSchema,
            "@id": `https://beautydiscount.ma/products/${product.slug}#breadcrumb`
          })
        }}
      />
      
      {/* Schema.org Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      
      {/* Schema.org WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema)
        }}
      />
      
      {/* Schema.org Similar Products */}
      {similarProductsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(similarProductsSchema)
          }}
        />
      )}
      
      {/* ✅ SCHEMA SPÉCIAL MULTI-CATÉGORIES */}
      {categories.length > 1 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": `Catégories de ${product.name}`,
              "description": `Ce produit appartient à ${categories.length} catégories différentes`,
              "numberOfItems": categories.length,
              "itemListElement": categories.map((cat, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Thing",
                  "name": cat.name,
                  "url": `https://beautydiscount.ma/categories/${cat.slug}`
                }
              }))
            })
          }}
        />
      )}
    </>
  );
}

/**
 * Fonction helper pour convertir le stock en schema de disponibilité
 */
function getAvailabilitySchema(stock: string): string {
  switch (stock) {
    case 'En Stock':
      return "https://schema.org/InStock";
    case 'Sur Commande':
      return "https://schema.org/PreOrder";
    case 'Rupture':
      return "https://schema.org/OutOfStock";
    default:
      return "https://schema.org/InStock";
  }
}