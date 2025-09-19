// lib/firebase-promotions.ts - GESTION DES PROMOTIONS
import { 
  collection, 
  query, 
  getDocs, 
  orderBy, 
  limit,
  where,
  QueryConstraint
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/lib/types";
import { getBrandsMap, calculateDiscount } from "./firebase-utils";

/**
 * Interface pour les statistiques des promotions
 */
export interface PromotionStats {
  totalProducts: number;
  averageDiscount: number;
  biggestDiscount: number;
  totalSavings: number;
  topBrands: Array<{
    brandId: string;
    brandName: string;
    productCount: number;
    averageDiscount: number;
  }>;
}

/**
 * Interface pour un produit en promotion avec métadonnées
 */
export interface PromotionProduct extends Product {
  discountPercentage: number;
  savings: number;
  isHotDeal: boolean; // Remise > 30%
  isBestDeal: boolean; // Top 10% des remises
}

/**
 * ✅ FONCTION PRINCIPALE : Récupération de tous les produits en promotion
 * 
 * CRITÈRES DE PROMOTION :
 * - Le produit doit avoir un originalPrice
 * - originalPrice doit être supérieur au price actuel
 * - Le produit doit être en stock ou sur commande
 */
export async function getPromotionProducts(
  limitCount: number = 100,
  sortBy: 'discount' | 'savings' | 'price' | 'newest' = 'discount'
): Promise<PromotionProduct[]> {
  try {
    console.log("🎯 Récupération des produits en promotion...");
    
    const productsRef = collection(db, "products");
    
    // ✅ REQUÊTE FIRESTORE OPTIMISÉE
    // On récupère plus de produits pour pouvoir filtrer côté client
    const constraints: QueryConstraint[] = [
      // Seulement les produits qui ont un prix original
      where("originalPrice", ">", 0),
      // Tri par score pour avoir les meilleurs produits en premier
      orderBy("score", "desc"),
      // Limite élevée pour récupérer tous les produits en promo
      limit(limitCount * 2)
    ];
    
    const q = query(productsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn("⚠️ Aucun produit en promotion trouvé");
      return [];
    }
    
    console.log(`📦 ${querySnapshot.docs.length} produits récupérés depuis Firestore`);
    
    // ✅ TRAITEMENT ET FILTRAGE DES PRODUITS
    const promotionProducts: PromotionProduct[] = [];
    const brandIds = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // ✅ VALIDATION STRICTE DES CHAMPS REQUIS
        const price = Number(data.price) || 0;
        const originalPrice = Number(data.originalPrice) || 0;
        
        // VÉRIFICATION : C'est bien une promotion ?
        if (!originalPrice || originalPrice <= price || price <= 0) {
          return; // Pas une promotion valide, on passe au suivant
        }
        
        // VÉRIFICATION : Le produit est-il disponible ?
        const stock = data.stock;
        if (stock === 'Rupture') {
          return; // Produit en rupture, on ne l'inclut pas
        }
        
        // ✅ CONSTRUCTION DU PRODUIT AVEC MIGRATION AUTOMATIQUE
        const product: Product = {
          id: doc.id,
          name: validateString(data.name, 'Produit sans nom'),
          slug: validateString(data.slug, doc.id),
          description: validateString(data.description, ''),
          shortDescription: validateString(data.shortDescription) || undefined,
          
          // SEO
          seo: data.seo ? {
            metaTitle: validateString(data.seo.metaTitle) || undefined,
            metaDescription: validateString(data.seo.metaDescription) || undefined,
            metaKeywords: validateArray(data.seo.metaKeywords),
            canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
          } : undefined,
          
          // ✅ MIGRATION AUTOMATIQUE MULTI-CATÉGORIES
          categoryIds: validateArray(data.categoryIds) || (data.categoryId ? [validateString(data.categoryId)] : []),
          subCategoryIds: validateArray(data.subCategoryIds) || (data.subCategoryId ? [validateString(data.subCategoryId)] : []),
          
          // Marque
          brandId: validateString(data.brandId) || undefined,
          brandName: validateString(data.brandName) || undefined,
          
          // Prix (déjà validés)
          price,
          originalPrice,
          
          // Stock
          stock: validateStockStatus(data.stock),
          
          // Autres champs
          sku: validateString(data.sku, doc.id),
          images: validateArray(data.images),
          imagePaths: validateArray(data.imagePaths),
          contenance: validateString(data.contenance) || undefined,
          badgeText: validateString(data.badgeText) || undefined,
          badgeColor: validateString(data.badgeColor) || undefined,
          score: validateNumber(data.score, 0),
          createdAt: convertFirestoreDate(data.createdAt),
          updatedAt: convertFirestoreDate(data.updatedAt),
        };
        
        // ✅ CALCULS DES MÉTADONNÉES DE PROMOTION
        const discountPercentage = calculateDiscount(price, originalPrice) || 0;
        const savings = originalPrice - price;
        const isHotDeal = discountPercentage >= 30;
        
        const promotionProduct: PromotionProduct = {
          ...product,
          discountPercentage,
          savings,
          isHotDeal,
          isBestDeal: false // Sera calculé après le tri
        };
        
        promotionProducts.push(promotionProduct);
        
        // Collecter les IDs de marques
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`❌ Erreur traitement produit promotion ${doc.id}:`, productError);
      }
    });
    
    console.log(`✅ ${promotionProducts.length} produits en promotion valides trouvés`);
    
    // ✅ RÉCUPÉRATION DES NOMS DE MARQUES
    if (brandIds.size > 0) {
      const brandsMap = await getBrandsMap(Array.from(brandIds));
      
      promotionProducts.forEach(product => {
        if (product.brandId && brandsMap.has(product.brandId)) {
          product.brandName = brandsMap.get(product.brandId);
        }
      });
    }
    
    // ✅ TRI DES PRODUITS SELON LE CRITÈRE DEMANDÉ
    promotionProducts.sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          // Tri par pourcentage de remise décroissant
          if (b.discountPercentage !== a.discountPercentage) {
            return b.discountPercentage - a.discountPercentage;
          }
          // Puis par économies décroissantes
          return b.savings - a.savings;
          
        case 'savings':
          // Tri par économies décroissantes
          if (b.savings !== a.savings) {
            return b.savings - a.savings;
          }
          // Puis par pourcentage de remise
          return b.discountPercentage - a.discountPercentage;
          
        case 'price':
          // Tri par prix croissant
          return a.price - b.price;
          
        case 'newest':
          // Tri par date de création décroissante
          return b.createdAt.getTime() - a.createdAt.getTime();
          
        default:
          return b.discountPercentage - a.discountPercentage;
      }
    });
    
    // ✅ MARQUER LES "BEST DEALS" (Top 10%)
    const topDealsCount = Math.max(1, Math.floor(promotionProducts.length * 0.1));
    for (let i = 0; i < topDealsCount && i < promotionProducts.length; i++) {
      promotionProducts[i].isBestDeal = true;
    }
    
    // ✅ LIMITATION FINALE
    const finalProducts = promotionProducts.slice(0, limitCount);
    
    console.log(`🎉 Produits en promotion préparés:`, {
      total: finalProducts.length,
      hotDeals: finalProducts.filter(p => p.isHotDeal).length,
      bestDeals: finalProducts.filter(p => p.isBestDeal).length,
      averageDiscount: Math.round(finalProducts.reduce((sum, p) => sum + p.discountPercentage, 0) / finalProducts.length),
      totalSavings: finalProducts.reduce((sum, p) => sum + p.savings, 0)
    });
    
    return finalProducts;
    
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des produits en promotion:", error);
    return [];
  }
}

/**
 * ✅ FONCTION : Récupération des statistiques des promotions
 */
export async function getPromotionStats(): Promise<PromotionStats> {
  try {
    console.log("📊 Calcul des statistiques des promotions...");
    
    // Récupérer tous les produits en promotion (sans limite)
    const allPromotionProducts = await getPromotionProducts(1000, 'discount');
    
    if (allPromotionProducts.length === 0) {
      return {
        totalProducts: 0,
        averageDiscount: 0,
        biggestDiscount: 0,
        totalSavings: 0,
        topBrands: []
      };
    }
    
    // ✅ CALCULS DES STATISTIQUES
    const totalProducts = allPromotionProducts.length;
    
    const averageDiscount = Math.round(
      allPromotionProducts.reduce((sum, product) => sum + product.discountPercentage, 0) / totalProducts
    );
    
    const biggestDiscount = Math.max(
      ...allPromotionProducts.map(product => product.discountPercentage)
    );
    
    const totalSavings = allPromotionProducts.reduce(
      (sum, product) => sum + product.savings, 0
    );
    
    // ✅ CALCUL DES TOP MARQUES EN PROMOTION
    const brandStats = new Map<string, {
      brandName: string;
      productCount: number;
      totalDiscount: number;
    }>();
    
    allPromotionProducts.forEach(product => {
      if (product.brandId && product.brandName) {
        const existing = brandStats.get(product.brandId);
        if (existing) {
          existing.productCount++;
          existing.totalDiscount += product.discountPercentage;
        } else {
          brandStats.set(product.brandId, {
            brandName: product.brandName,
            productCount: 1,
            totalDiscount: product.discountPercentage
          });
        }
      }
    });
    
    const topBrands = Array.from(brandStats.entries())
      .map(([brandId, stats]) => ({
        brandId,
        brandName: stats.brandName,
        productCount: stats.productCount,
        averageDiscount: Math.round(stats.totalDiscount / stats.productCount)
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5); // Top 5 marques
    
    const promotionStats: PromotionStats = {
      totalProducts,
      averageDiscount,
      biggestDiscount,
      totalSavings: Math.round(totalSavings),
      topBrands
    };
    
    console.log("✅ Statistiques des promotions calculées:", promotionStats);
    
    return promotionStats;
    
  } catch (error) {
    console.error("❌ Erreur calcul statistiques promotions:", error);
    return {
      totalProducts: 0,
      averageDiscount: 0,
      biggestDiscount: 0,
      totalSavings: 0,
      topBrands: []
    };
  }
}

/**
 * ✅ FONCTION : Récupération des promotions par catégorie
 */
export async function getPromotionsByCategory(
  categoryIds: string[],
  limitCount: number = 20
): Promise<PromotionProduct[]> {
  try {
    console.log("🏷️ Récupération des promotions par catégorie:", categoryIds);
    
    if (!categoryIds.length) {
      return [];
    }
    
    const allPromotions = await getPromotionProducts(500, 'discount');
    
    // Filtrer par catégories
    const categoryPromotions = allPromotions.filter(product =>
      product.categoryIds.some(catId => categoryIds.includes(catId))
    );
    
    return categoryPromotions.slice(0, limitCount);
    
  } catch (error) {
    console.error("❌ Erreur récupération promotions par catégorie:", error);
    return [];
  }
}

/**
 * ✅ FONCTION : Recherche dans les promotions
 */
export async function searchPromotions(
  searchTerm: string,
  filters?: {
    minDiscount?: number;
    maxPrice?: number;
    brandIds?: string[];
    categoryIds?: string[];
  },
  limitCount: number = 20
): Promise<PromotionProduct[]> {
  try {
    console.log("🔍 Recherche dans les promotions:", { searchTerm, filters });
    
    const allPromotions = await getPromotionProducts(500, 'discount');
    
    if (!searchTerm.trim() && !filters) {
      return allPromotions.slice(0, limitCount);
    }
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    let filteredPromotions = allPromotions;
    
    // Filtrage par terme de recherche
    if (normalizedSearchTerm) {
      filteredPromotions = filteredPromotions.filter(product =>
        product.name.toLowerCase().includes(normalizedSearchTerm) ||
        product.description.toLowerCase().includes(normalizedSearchTerm) ||
        (product.brandName && product.brandName.toLowerCase().includes(normalizedSearchTerm)) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(normalizedSearchTerm))
      );
    }
    
    // Application des filtres
    if (filters) {
      if (filters.minDiscount) {
        filteredPromotions = filteredPromotions.filter(p => 
          p.discountPercentage >= filters.minDiscount!
        );
      }
      
      if (filters.maxPrice) {
        filteredPromotions = filteredPromotions.filter(p => 
          p.price <= filters.maxPrice!
        );
      }
      
      if (filters.brandIds?.length) {
        filteredPromotions = filteredPromotions.filter(p => 
          p.brandId && filters.brandIds!.includes(p.brandId)
        );
      }
      
      if (filters.categoryIds?.length) {
        filteredPromotions = filteredPromotions.filter(p =>
          p.categoryIds.some(catId => filters.categoryIds!.includes(catId))
        );
      }
    }
    
    return filteredPromotions.slice(0, limitCount);
    
  } catch (error) {
    console.error("❌ Erreur recherche promotions:", error);
    return [];
  }
}

// ===== FONCTIONS UTILITAIRES INTERNES =====

/**
 * Validation sécurisée des chaînes
 */
function validateString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value.trim() : defaultValue;
}

/**
 * Validation sécurisée des nombres
 */
function validateNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

/**
 * Validation sécurisée des tableaux
 */
function validateArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

/**
 * Validation du statut de stock
 */
function validateStockStatus(value: unknown): "En Stock" | "Sur Commande" | "Rupture" {
  const validStatuses: ("En Stock" | "Sur Commande" | "Rupture")[] = ["En Stock", "Sur Commande", "Rupture"];
  return validStatuses.includes(value as "En Stock" | "Sur Commande" | "Rupture") ? value as "En Stock" | "Sur Commande" | "Rupture" : "En Stock";
}

/**
 * Conversion des timestamps Firestore
 */
function convertFirestoreDate(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    const timestampObj = timestamp as { toDate: () => Date };
    if (typeof timestampObj.toDate === 'function') {
      return timestampObj.toDate();
    }
  }
  
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const timestampObj = timestamp as { seconds: number };
    if (typeof timestampObj.seconds === 'number') {
      return new Date(timestampObj.seconds * 1000);
    }
  }
  
  return new Date();
}