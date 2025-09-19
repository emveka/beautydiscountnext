// lib/firebase-search.ts - FONCTIONS DE RECHERCHE FIREBASE SIMPLES
import { 
  collection, 
  query, 
  getDocs, 
  limit,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "@/lib/types";
import { getBrandsMap } from "./firebase-utils";

/**
 * Interface pour les résultats de recherche enrichis
 */
export interface SearchResult {
  products: Product[];
  totalCount: number;
  searchTerm: string;
  executionTime: number;
  suggestions?: string[];
}

/**
 * Options de recherche configurables
 */
export interface SearchOptions {
  limit?: number;
  includeOutOfStock?: boolean;
  categoryIds?: string[];
  subCategoryIds?: string[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'relevance' | 'price' | 'name' | 'newest' | 'score';
}

/**
 * 🔍 FONCTION PRINCIPALE DE RECHERCHE PRODUITS
 * 
 * STRATÉGIE SIMPLE ET EFFICACE :
 * ✅ Récupère tous les produits (avec cache)
 * ✅ Filtre côté client par terme de recherche
 * ✅ Recherche dans : nom, description, marque, SKU
 * ✅ Support multi-catégories (réutilise tes fonctions existantes)
 * ✅ Tri par pertinence intelligent
 * ✅ Performance optimisée
 * 
 * @param searchTerm - Terme à rechercher
 * @param options - Options de filtrage et tri
 * @returns Promise<SearchResult>
 */
export async function searchProducts(
  searchTerm: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Recherche de produits pour: "${searchTerm}"`);
    
    // ✅ VALIDATION DU TERME DE RECHERCHE
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    
    if (!cleanSearchTerm || cleanSearchTerm.length < 2) {
      return {
        products: [],
        totalCount: 0,
        searchTerm,
        executionTime: Date.now() - startTime,
        suggestions: []
      };
    }

    // ✅ CONFIGURATION PAR DÉFAUT
    const {
      limit: maxResults = 50,
      includeOutOfStock = false,
      categoryIds = [],
      subCategoryIds = [],
      brandIds = [],
      minPrice,
      maxPrice,
      sortBy = 'relevance'
    } = options;

    // ✅ RÉCUPÉRATION DES PRODUITS DEPUIS FIREBASE
    const allProducts = await fetchAllProducts();
    console.log(`📦 ${allProducts.length} produits récupérés depuis Firebase`);

    // ✅ RÉCUPÉRATION DES NOMS DE MARQUES
    const brandIds_unique = new Set<string>();
    allProducts.forEach(product => {
      if (product.brandId) {
        brandIds_unique.add(product.brandId);
      }
    });
    
    const brandsMap = await getBrandsMap(Array.from(brandIds_unique));
    
    // Enrichir les produits avec les noms de marques
    allProducts.forEach(product => {
      if (product.brandId && brandsMap.has(product.brandId)) {
        product.brandName = brandsMap.get(product.brandId);
      }
    });

    // ✅ FILTRAGE ET RECHERCHE
    let filteredProducts = allProducts;

    // Filtre 1: Stock
    if (!includeOutOfStock) {
      filteredProducts = filteredProducts.filter(p => p.stock !== "Rupture");
    }

    // Filtre 2: Catégories
    if (categoryIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.categoryIds.some(catId => categoryIds.includes(catId))
      );
    }

    // Filtre 3: Sous-catégories
    if (subCategoryIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.subCategoryIds.some(subCatId => subCategoryIds.includes(subCatId))
      );
    }

    // Filtre 4: Marques
    if (brandIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.brandId && brandIds.includes(product.brandId)
      );
    }

    // Filtre 5: Prix
    if (typeof minPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (typeof maxPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // ✅ RECHERCHE TEXTUELLE AVEC SCORING
    const searchResults = filteredProducts
      .map(product => ({
        product,
        relevanceScore: calculateRelevanceScore(product, cleanSearchTerm)
      }))
      .filter(result => result.relevanceScore > 0) // Garde seulement les résultats pertinents
      .sort((a, b) => {
        if (sortBy === 'relevance') {
          return b.relevanceScore - a.relevanceScore;
        }
        return sortProducts(a.product, b.product, sortBy);
      });

    // ✅ LIMITATION DES RÉSULTATS
    const limitedResults = searchResults.slice(0, maxResults);
    const finalProducts = limitedResults.map(result => result.product);

    // ✅ GÉNÉRATION DE SUGGESTIONS (optionnel)
    const suggestions = generateSearchSuggestions(cleanSearchTerm, allProducts);

    const executionTime = Date.now() - startTime;
    
    console.log(`✅ Recherche terminée en ${executionTime}ms:`, {
      terme: searchTerm,
      totalTrouvés: searchResults.length,
      retournés: finalProducts.length,
      suggestions: suggestions.length
    });

    return {
      products: finalProducts,
      totalCount: searchResults.length,
      searchTerm,
      executionTime,
      suggestions
    };

  } catch (error) {
    console.error("❌ Erreur lors de la recherche:", error);
    
    return {
      products: [],
      totalCount: 0,
      searchTerm,
      executionTime: Date.now() - startTime,
      suggestions: []
    };
  }
}

/**
 * 🎯 CALCUL DU SCORE DE PERTINENCE
 * 
 * LOGIQUE DE SCORING :
 * - Nom exact : 100 points
 * - Nom contient : 80 points
 * - Marque exacte : 70 points
 * - Marque contient : 50 points
 * - Description contient : 30 points
 * - SKU contient : 20 points
 * - Début de mot : +20 points bonus
 */
function calculateRelevanceScore(product: Product, searchTerm: string): number {
  let score = 0;
  const search = searchTerm.toLowerCase();
  
  // Préparation des textes à analyser
  const productName = product.name.toLowerCase();
  const productDescription = product.description.toLowerCase();
  const productShortDescription = product.shortDescription?.toLowerCase() || '';
  const brandName = product.brandName?.toLowerCase() || '';
  const sku = product.sku.toLowerCase();

  // ✅ SCORING PRINCIPAL

  // 1. Nom du produit (priorité maximale)
  if (productName === search) {
    score += 100; // Match exact
  } else if (productName.includes(search)) {
    score += 80;
    // Bonus si le terme est au début
    if (productName.startsWith(search)) {
      score += 20;
    }
  }

  // 2. Nom de marque
  if (brandName && brandName === search) {
    score += 70;
  } else if (brandName && brandName.includes(search)) {
    score += 50;
    if (brandName.startsWith(search)) {
      score += 15;
    }
  }

  // 3. Description courte
  if (productShortDescription && productShortDescription.includes(search)) {
    score += 40;
  }

  // 4. Description longue
  if (productDescription.includes(search)) {
    score += 30;
  }

  // 5. SKU
  if (sku.includes(search)) {
    score += 20;
  }

  // ✅ BONUS POUR MOTS MULTIPLES
  if (search.includes(' ')) {
    const searchWords = search.split(' ').filter(word => word.length > 1);
    let wordsFound = 0;
    
    searchWords.forEach(word => {
      if (productName.includes(word) || brandName.includes(word)) {
        wordsFound++;
      }
    });
    
    // Bonus si plusieurs mots trouvés
    if (wordsFound > 1) {
      score += wordsFound * 10;
    }
  }

  // ✅ BONUS QUALITÉ PRODUIT
  if (product.score > 80) {
    score += 5; // Bonus pour les produits bien notés
  }

  return score;
}

/**
 * 🔄 FONCTION DE TRI DES PRODUITS
 */
function sortProducts(a: Product, b: Product, sortBy: string): number {
  switch (sortBy) {
    case 'price':
      return a.price - b.price;
    case 'name':
      return a.name.localeCompare(b.name, 'fr', { numeric: true });
    case 'newest':
      return b.createdAt.getTime() - a.createdAt.getTime();
    case 'score':
      return b.score - a.score;
    case 'relevance':
    default:
      return b.score - a.score; // Fallback sur le score produit
  }
}

/**
 * 📦 RÉCUPÉRATION OPTIMISÉE DES PRODUITS
 * 
 * STRATÉGIE :
 * ✅ Cache simple en mémoire (5 minutes)
 * ✅ Récupération par batch si nécessaire
 * ✅ Migration automatique multi-catégories
 */
let productsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchAllProducts(): Promise<Product[]> {
  // Vérifier le cache
  if (productsCache && Date.now() - productsCache.timestamp < CACHE_DURATION) {
    console.log("📋 Utilisation du cache produits");
    return productsCache.data;
  }

  try {
    console.log("🔄 Récupération des produits depuis Firebase...");
    
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      orderBy("score", "desc"), // Meilleurs produits en premier
      limit(1000) // Limite raisonnable
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn("⚠️ Aucun produit trouvé dans Firebase");
      return [];
    }

    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
        // ✅ MIGRATION AUTOMATIQUE MULTI-CATÉGORIES
        const product: Product = {
          id: doc.id,
          name: validateString(data.name, 'Produit sans nom'),
          slug: validateString(data.slug, doc.id),
          description: validateString(data.description, ''),
          shortDescription: validateString(data.shortDescription) || undefined,
          
          seo: data.seo ? {
            metaTitle: validateString(data.seo.metaTitle) || undefined,
            metaDescription: validateString(data.seo.metaDescription) || undefined,
            metaKeywords: validateArray(data.seo.metaKeywords),
            canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
          } : undefined,
          
          // ✅ MIGRATION MULTI-CATÉGORIES
          categoryIds: validateArray(data.categoryIds) || (data.categoryId ? [validateString(data.categoryId)] : []),
          subCategoryIds: validateArray(data.subCategoryIds) || (data.subCategoryId ? [validateString(data.subCategoryId)] : []),
          
          brandId: validateString(data.brandId) || undefined,
          brandName: validateString(data.brandName) || undefined,
          
          price: validateNumber(data.price, 0),
          originalPrice: data.originalPrice ? validateNumber(data.originalPrice) : undefined,
          
          stock: validateStockStatus(data.stock),
          
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
        
        products.push(product);
        
      } catch (productError) {
        console.error(`❌ Erreur traitement produit ${doc.id}:`, productError);
      }
    });

    // Mise à jour du cache
    productsCache = {
      data: products,
      timestamp: Date.now()
    };

    console.log(`✅ ${products.length} produits mis en cache`);
    return products;

  } catch (error) {
    console.error("❌ Erreur récupération produits:", error);
    
    // Retourner le cache même expiré en cas d'erreur
    if (productsCache) {
      console.log("📋 Utilisation du cache expiré en fallback");
      return productsCache.data;
    }
    
    return [];
  }
}

/**
 * 💡 GÉNÉRATION DE SUGGESTIONS DE RECHERCHE
 */
function generateSearchSuggestions(searchTerm: string, allProducts: Product[]): string[] {
  const suggestions = new Set<string>();
  
  // Suggestions basées sur les noms de produits
  allProducts.forEach(product => {
    const productName = product.name.toLowerCase();
    const brandName = product.brandName?.toLowerCase() || '';
    
    // Si le nom contient le terme, ajouter le nom complet
    if (productName.includes(searchTerm) && productName !== searchTerm) {
      suggestions.add(product.name);
    }
    
    // Si la marque contient le terme, ajouter la marque
    if (brandName.includes(searchTerm) && brandName !== searchTerm && product.brandName) {
      suggestions.add(product.brandName);
    }
  });

  // Limiter à 5 suggestions
  return Array.from(suggestions).slice(0, 5);
}

// ===== FONCTIONS UTILITAIRES RÉUTILISÉES =====

function validateString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value.trim() : defaultValue;
}

function validateNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

function validateArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

function validateStockStatus(value: unknown): "En Stock" | "Sur Commande" | "Rupture" {
  const validStatuses: ("En Stock" | "Sur Commande" | "Rupture")[] = ["En Stock", "Sur Commande", "Rupture"];
  return validStatuses.includes(value as "En Stock" | "Sur Commande" | "Rupture") ? value as "En Stock" | "Sur Commande" | "Rupture" : "En Stock";
}

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

/**
 * 🚀 FONCTION RAPIDE POUR RECHERCHE SUGGESTIONS LIVE
 * Optimisée pour les suggestions en temps réel dans SearchBar
 */
export async function getSearchSuggestions(searchTerm: string, maxSuggestions = 5): Promise<string[]> {
  if (!searchTerm.trim() || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    // Récupérer les produits (utilise le cache si disponible)
    const products = await fetchAllProducts();
    
    // Suggestions simples basées sur les noms
    const suggestions = new Set<string>();
    const search = searchTerm.toLowerCase();
    
    products.forEach(product => {
      const name = product.name.toLowerCase();
      const brand = product.brandName?.toLowerCase() || '';
      
      if (name.includes(search) && suggestions.size < maxSuggestions * 2) {
        suggestions.add(product.name);
      }
      
      if (brand.includes(search) && suggestions.size < maxSuggestions * 2 && product.brandName) {
        suggestions.add(product.brandName);
      }
    });
    
    return Array.from(suggestions).slice(0, maxSuggestions);
    
  } catch (error) {
    console.error("❌ Erreur suggestions de recherche:", error);
    return [];
  }
}

/**
 * 🧹 FONCTION DE NETTOYAGE DU CACHE (utilitaire)
 */
export function clearProductsCache(): void {
  productsCache = null;
  console.log("🗑️ Cache produits vidé");
}

/* ✅ EXEMPLES D'UTILISATION :

// Recherche simple
const results = await searchProducts("lissage brésilien");

// Recherche avec options
const results = await searchProducts("masque", {
  limit: 20,
  includeOutOfStock: false,
  categoryIds: ["cat123"],
  sortBy: 'price'
});

// Suggestions pour SearchBar
const suggestions = await getSearchSuggestions("liss", 5);

*/