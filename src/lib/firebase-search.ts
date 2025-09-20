// lib/firebase-search.ts - VERSION SIMPLE ET FONCTIONNELLE
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
 * Interface pour les résultats de recherche
 */
export interface SearchResult {
  products: Product[];
  totalCount: number;
  searchTerm: string;
  executionTime: number;
  suggestions?: string[];
}

/**
 * Options de recherche
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
 * Normalisation du texte pour la recherche
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcul simple de similarité
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calcul de distance simple
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  
  let matches = 0;
  const minLen = Math.min(s1.length, s2.length);
  
  for (let i = 0; i < minLen; i++) {
    if (s1[i] === s2[i]) matches++;
  }
  
  return matches / maxLen;
}

/**
 * Génération de variantes de recherche
 */
function generateVariants(term: string): string[] {
  const variants = new Set<string>();
  const normalized = normalizeText(term);
  
  // Corrections courantes
  const corrections: Record<string, string[]> = {
    'lissage': ['lisage', 'lissag', 'lysage'],
    'bresilien': ['bresilien', 'brezilien', 'brazilian'],
    'cheveux': ['cheveu', 'cheveus'],
    'masque': ['masqu', 'mask'],
    'shampooing': ['shampoing', 'shampoo'],
    'decolorant': ['decolorant', 'decoloran'],
    'coreen': ['coreen', 'korean'],
    'maquillage': ['maquillage', 'makeup'],
    'poudre': ['poudre', 'powder'],
    'creme': ['crème', 'cream']
  };

  variants.add(normalized);
  
  // Ajouter les corrections
  Object.entries(corrections).forEach(([correct, wrongs]) => {
    if (wrongs.includes(normalized)) {
      variants.add(correct);
    }
    if (correct === normalized) {
      wrongs.forEach(wrong => variants.add(wrong));
    }
  });

  return Array.from(variants);
}

/**
 * Calcul du score de pertinence
 */
function calculateRelevanceScore(product: Product, searchTerm: string): number {
  let score = 0;
  const search = normalizeText(searchTerm);
  const variants = generateVariants(search);
  
  const productName = normalizeText(product.name);
  const brandName = normalizeText(product.brandName || '');
  const description = normalizeText(product.description);
  const shortDesc = normalizeText(product.shortDescription || '');

  // Recherche exacte
  for (const variant of variants) {
    if (productName === variant) score += 100;
    else if (productName.includes(variant)) score += 80;
    
    if (brandName === variant) score += 70;
    else if (brandName.includes(variant)) score += 50;
    
    if (shortDesc.includes(variant)) score += 40;
    if (description.includes(variant)) score += 30;
  }

  // Recherche approximative si pas de score exact
  if (score === 0) {
    const nameSim = calculateSimilarity(productName, search);
    const brandSim = calculateSimilarity(brandName, search);
    
    if (nameSim > 0.4) score += Math.floor(nameSim * 60);
    if (brandSim > 0.4) score += Math.floor(brandSim * 40);
  }

  // Bonus qualité
  if (product.score > 80) score += 5;

  return score;
}

/**
 * Fonction principale de recherche
 */
export async function searchProducts(
  searchTerm: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const startTime = Date.now();
  
  try {
    const cleanSearchTerm = searchTerm.trim();
    
    if (!cleanSearchTerm || cleanSearchTerm.length < 2) {
      return {
        products: [],
        totalCount: 0,
        searchTerm,
        executionTime: Date.now() - startTime,
        suggestions: []
      };
    }

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

    // Récupération des produits
    const allProducts = await fetchAllProducts();
    
    // Enrichissement avec noms de marques
    const uniqueBrandIds = Array.from(new Set(
      allProducts.map(p => p.brandId).filter(Boolean) as string[]
    ));
    
    const brandsMap = await getBrandsMap(uniqueBrandIds);
    allProducts.forEach(product => {
      if (product.brandId && brandsMap.has(product.brandId)) {
        product.brandName = brandsMap.get(product.brandId);
      }
    });

    // Filtrage
    let filteredProducts = allProducts;

    if (!includeOutOfStock) {
      filteredProducts = filteredProducts.filter(p => p.stock !== "Rupture");
    }

    if (categoryIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.categoryIds.some(catId => categoryIds.includes(catId))
      );
    }

    if (subCategoryIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.subCategoryIds.some(subCatId => subCategoryIds.includes(subCatId))
      );
    }

    if (brandIds.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.brandId && brandIds.includes(product.brandId)
      );
    }

    if (typeof minPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (typeof maxPrice === 'number') {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }

    // Recherche et scoring
    const searchResults = filteredProducts
      .map(product => ({
        product,
        relevanceScore: calculateRelevanceScore(product, cleanSearchTerm)
      }))
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => {
        if (sortBy === 'relevance') {
          return b.relevanceScore - a.relevanceScore;
        }
        return sortProducts(a.product, b.product, sortBy);
      });

    const limitedResults = searchResults.slice(0, maxResults);
    const finalProducts = limitedResults.map(result => result.product);

    // Génération de suggestions simples
    const suggestions = generateSimpleSuggestions(cleanSearchTerm, allProducts);

    const executionTime = Date.now() - startTime;
    
    return {
      products: finalProducts,
      totalCount: searchResults.length,
      searchTerm,
      executionTime,
      suggestions
    };

  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    
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
 * Fonction de tri
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
    default:
      return b.score - a.score;
  }
}

/**
 * Génération de suggestions simples
 */
function generateSimpleSuggestions(searchTerm: string, allProducts: Product[]): string[] {
  const suggestions = new Set<string>();
  const search = normalizeText(searchTerm);
  
  allProducts.forEach(product => {
    const name = normalizeText(product.name);
    const brand = normalizeText(product.brandName || '');
    
    if (name.includes(search) && suggestions.size < 8) {
      suggestions.add(product.name);
    }
    
    if (brand.includes(search) && suggestions.size < 8 && product.brandName) {
      suggestions.add(product.brandName);
    }
  });
  
  return Array.from(suggestions).slice(0, 6);
}

/**
 * Fonction pour suggestions live
 */
export async function getSearchSuggestions(searchTerm: string, maxSuggestions = 8): Promise<string[]> {
  if (!searchTerm.trim() || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    const products = await fetchAllProducts();
    return generateSimpleSuggestions(searchTerm, products).slice(0, maxSuggestions);
  } catch (error) {
    console.error("Erreur suggestions:", error);
    return [];
  }
}

// Cache produits
let productsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchAllProducts(): Promise<Product[]> {
  if (productsCache && Date.now() - productsCache.timestamp < CACHE_DURATION) {
    return productsCache.data;
  }

  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      orderBy("score", "desc"),
      limit(1000)
    );
    
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        
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
        console.error(`Erreur traitement produit ${doc.id}:`, productError);
      }
    });

    productsCache = {
      data: products,
      timestamp: Date.now()
    };

    return products;

  } catch (error) {
    console.error("Erreur récupération produits:", error);
    
    if (productsCache) {
      return productsCache.data;
    }
    
    return [];
  }
}

// Fonctions de validation
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

export function clearProductsCache(): void {
  productsCache = null;
}