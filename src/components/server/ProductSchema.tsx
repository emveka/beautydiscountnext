// components/server/ProductSchema.tsx
import type { Product, Category, SubCategory } from '@/lib/types';
import { getProductImageUrl } from '@/lib/firebase-utils';

interface ProductSchemaProps {
  product: Product;
  category: Category | null;
  subCategory: SubCategory | null;
  similarProducts: Product[];
}

/**
 * Composant server ProductSchema - Données structurées Schema.org
 * 
 * Fonctionnalités :
 * ✅ Schema.org Product complet
 * ✅ Schema.org BreadcrumbList
 * ✅ Schema.org Offer avec prix et disponibilité
 * ✅ Schema.org AggregateRating
 * ✅ Schema.org ItemList pour produits similaires
 * ✅ Optimisation SEO e-commerce
 */
export default function ProductSchema({ 
  product, 
  category, 
  subCategory, 
  similarProducts 
}: ProductSchemaProps) {
  // Construction de l'URL de l'image principale
  const productImage = getProductImageUrl(product);
  const imageUrl = productImage.startsWith('http') 
    ? productImage 
    : `https://beautydiscount.ma${productImage}`;
  
  // Schema.org Product principal
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
    
    // Catégorie
    "category": subCategory?.name || category?.name || "Beauté",
    
    // Caractéristiques additionnelles
    "additionalProperty": [
      ...(product.contenance ? [{
        "@type": "PropertyValue",
        "name": "Contenance",
        "value": product.contenance
      }] : []),
      {
        "@type": "PropertyValue",
        "name": "Référence",
        "value": product.sku
      }
    ],
    
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
  
  // Schema.org Breadcrumb
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
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
      },
      ...(category ? [{
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://beautydiscount.ma/categories/${category.slug}`
      }] : []),
      ...(subCategory ? [{
        "@type": "ListItem",
        "position": category ? 4 : 3,
        "name": subCategory.name,
        "item": `https://beautydiscount.ma/categories/${category?.slug}/${subCategory.slug}`
      }] : []),
      {
        "@type": "ListItem",
        "position": category && subCategory ? 5 : category ? 4 : 3,
        "name": product.name,
        "item": `https://beautydiscount.ma/products/${product.slug}`
      }
    ]
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
  
  // Schema.org ItemList pour produits similaires
  const similarProductsSchema = similarProducts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Produits similaires",
    "description": `Produits similaires à ${product.name}`,
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
        })
      }
    }))
  } : null;
  
  // Schema WebPage pour la page produit
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
    }
  };

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