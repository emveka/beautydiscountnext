// lib/types.ts - Version Multi-Catégories CORRIGÉE pour BeautyDiscount
import type { Timestamp } from "firebase/firestore";

/**
 * ✅ INTERFACE POUR LES DONNÉES FIRESTORE BRUTES - EXPORTÉE
 * Interface utilisée pour la migration automatique des anciens produits
 */
export interface FirestoreProductData {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  shortDescription?: unknown;
  seo?: Record<string, unknown>;
  // 🔄 Nouveaux champs multi-catégories
  categoryIds?: unknown;
  subCategoryIds?: unknown;
  // 🔄 Anciens champs (rétrocompatibilité)
  categoryId?: unknown;
  subCategoryId?: unknown;
  // Autres champs
  brandId?: unknown;
  brandName?: unknown;
  price?: unknown;
  originalPrice?: unknown;
  stock?: unknown;
  sku?: unknown;
  images?: unknown;
  imagePaths?: unknown;
  contenance?: unknown;
  badgeText?: unknown;
  badgeColor?: unknown;
  score?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

/**
 * Types pour le statut de stock des produits
 */
export type StockStatus = "En Stock" | "Sur Commande" | "Rupture";

/**
 * Interface pour les métadonnées SEO des produits
 */
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
}

/**
 * Interface pour les métadonnées SEO des catégories
 */
export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
}

/**
 * ✅ INTERFACE PRINCIPALE PRODUIT - MULTI-CATÉGORIES
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  
  // SEO
  seo?: ProductSEO;
  
  // 🆕 TAXONOMIE MULTI-CATÉGORIES
  categoryIds: string[];        // 🔄 Remplace categoryId (tableau)
  subCategoryIds: string[];     // 🔄 Remplace subCategoryId? (tableau)
  
  // Marque
  brandId?: string;
  brandName?: string;
  
  // Prix
  price: number;
  originalPrice?: number;
  
  // Stock
  stock: StockStatus;
  
  // Référence & médias
  sku: string;
  images: string[];
  imagePaths: string[];
  
  // Contenance et badge
  contenance?: string;
  badgeText?: string;
  badgeColor?: string;
  
  // Scoring et dates
  score: number;
  createdAt: Date;
  updatedAt: Date;

  // 🆕 CHAMPS DE RÉTROCOMPATIBILITÉ (dépréciés)
  /** @deprecated Utilisez categoryIds à la place */
  categoryId?: string;
  /** @deprecated Utilisez subCategoryIds à la place */
  subCategoryId?: string;
}

/**
 * Interface pour les statistiques agrégées des produits
 */
export interface ProductAggregateStats {
  productId: string;
  views: number;
  clicks: number;
  addToCart?: number;
  lastViewAt?: Timestamp;
  lastClickAt?: Timestamp;
  updatedAt: Date;
}

/**
 * Interface pour les catégories de produits
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  descriptionLongue?: string;
  image?: string;
  imagePath?: string;
  parentId?: string;
  seo?: CategorySEO;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les sous-catégories
 */
export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
  description?: string;
  descriptionLongue?: string;
  image?: string;
  imagePath?: string;
  seo?: CategorySEO;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}

/**
 * ✅ Props pour CategoryInfo avec support multi-catégories
 */
export interface CategoryInfoProps {
  category: Category | SubCategory;
  productCount: number;
  subCategoriesCount?: number;
  isSubCategory?: boolean;
  parentCategory?: Category;
  // 🆕 NOUVEAUX CHAMPS MULTI-CATÉGORIES
  relatedCategories?: Category[];
  multiCategoryProducts?: number;
  crossCategoryProducts?: number;  // 🆕 Produits partagés avec d'autres catégories
}

/**
 * ✅ Props pour ProductGrid avec support multi-catégories
 */
export interface ProductGridProps {
  products: Product[];
  categorySlug?: string;
  categoryName?: string;
  subCategories?: SubCategory[];
  currentSubCategoryId?: string;
  // 🆕 NOUVEAUX CHAMPS MULTI-CATÉGORIES
  selectedCategoryIds?: string[];
  selectedSubCategoryIds?: string[];
  showCategoryTags?: boolean;
  allowMultipleSelection?: boolean;
  maxDisplayedCategories?: number;  // 🆕 Limite d'affichage des tags
}

/**
 * Interface pour les marques
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  description?: string;  // 🆕 Description de la marque
  logo?: string;         // 🆕 Logo de la marque
}

/**
 * ✅ Interface pour les filtres de produits - MULTI-CATÉGORIES
 */
export interface ProductFilters {
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  // 🔄 SUPPORT MULTI-CATÉGORIES
  categoryIds: string[];
  subCategoryIds: string[];
  
  // 🆕 FILTRES AVANCÉS
  minCategoriesCount?: number;
  maxCategoriesCount?: number;
  hasMultipleCategories?: boolean;
  
  // 🆕 FILTRES SUPPLÉMENTAIRES
  stockStatuses?: StockStatus[];
  scoreRange?: {
    min: number;
    max: number;
  };
}

/**
 * Types pour le tri des produits
 */
export type ProductSortOption = 
  | 'score' 
  | 'price-low' 
  | 'price-high' 
  | 'newest' 
  | 'name' 
  | 'discount'
  | 'popularity'    // 🆕 Tri par popularité
  | 'category';     // 🆕 Tri par catégorie

/**
 * Interface pour les réponses d'API paginées
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages: number;  // 🆕 Nombre total de pages
}

/**
 * Interface pour les erreurs d'API
 */
export interface APIError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
  timestamp?: Date;  // 🆕 Horodatage de l'erreur
}

// ===== NOUVEAUX TYPES POUR MULTI-CATÉGORIES =====

/**
 * 🆕 Interface pour les statistiques de répartition des catégories
 */
export interface CategoryDistributionStats {
  totalProducts: number;
  monoCategory: number;
  multiCategory: number;
  averageCategoriesPerProduct: number;
  maxCategoriesPerProduct: number;
  categoryDistribution: { [key: number]: number };
  // 🆕 STATISTIQUES SUPPLÉMENTAIRES
  mostPopularCombinations: Array<{
    categoryIds: string[];
    productCount: number;
    categoryNames: string[];
  }>;
  orphanedProducts: number;  // Produits sans catégorie
}

/**
 * 🆕 Interface pour le contexte de navigation multi-catégories
 */
export interface MultiCategoryContext {
  currentCategories: Category[];
  currentSubCategories: SubCategory[];
  breadcrumb: Array<{
    type: 'category' | 'subcategory';
    id: string;
    name: string;
    slug: string;
  }>;
  relatedCategories: Category[];
  totalProducts: number;
  // 🆕 CONTEXTE ENRICHI
  siblingCategories: Category[];  // Catégories de même niveau
  parentCategories: Category[];   // Catégories parentes
}

/**
 * 🆕 Interface pour les requêtes de recherche avancées
 */
export interface AdvancedSearchQuery {
  searchTerm?: string;
  categoryIds?: string[];
  subCategoryIds?: string[];
  brandIds?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  stockStatuses?: StockStatus[];
  scoreRange?: {
    min: number;
    max: number;
  };
  hasDiscount?: boolean;
  sortBy?: ProductSortOption;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  // 🆕 OPTIONS AVANCÉES
  fuzzySearch?: boolean;          // Recherche floue
  includeDescription?: boolean;   // Inclure la description dans la recherche
  boostExactMatches?: boolean;    // Privilégier les correspondances exactes
}

/**
 * 🆕 Interface pour les résultats de recherche avec métadonnées
 */
export interface SearchResult {
  products: Product[];
  totalCount: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    subCategories: Array<{ id: string; name: string; parentId: string; count: number }>;
    brands: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    stockStatuses: Array<{ status: StockStatus; count: number }>;
  };
  suggestions?: string[];
  executionTime: number;
  // 🆕 MÉTADONNÉES ENRICHIES
  correctedQuery?: string;        // Requête corrigée
  matchType: 'exact' | 'fuzzy' | 'partial';
}

/**
 * 🆕 Interface pour les recommandations de produits
 */
export interface ProductRecommendation {
  product: Product;
  score: number;
  reason: 
    | 'same_category' 
    | 'same_brand' 
    | 'similar_price' 
    | 'high_score' 
    | 'frequently_bought_together'
    | 'cross_category'      // 🆕 Recommandation inter-catégories
    | 'trending';           // 🆕 Produit tendance
  similarity?: number;
  explanation?: string;     // 🆕 Explication de la recommandation
}

// ===== TYPES UTILITAIRES =====

/**
 * 🆕 Type helper pour extraire les IDs de catégories d'un produit
 */
export type ProductCategoryIds<T extends Product> = T['categoryIds'];

/**
 * 🆕 Type helper pour extraire les IDs de sous-catégories d'un produit
 */
export type ProductSubCategoryIds<T extends Product> = T['subCategoryIds'];

/**
 * 🆕 Type helper pour les produits avec au moins une catégorie
 */
export type ProductWithCategories = Product & {
  categoryIds: [string, ...string[]]; // Au moins un élément
};

/**
 * 🆕 Type helper pour les produits avec catégories multiples
 */
export type MultiCategoryProduct = Product & {
  categoryIds: [string, string, ...string[]]; // Au moins deux éléments
};

/**
 * 🆕 Type pour les options de migration des anciens produits
 */
export interface MigrationOptions {
  preserveOriginalFields: boolean;
  defaultCategoryIds: string[];
  logMigrationWarnings: boolean;
  validateCategoryExists: boolean;
  createMissingCategories: boolean;
  batchSize?: number;           // 🆕 Taille des lots pour la migration
  dryRun?: boolean;             // 🆕 Mode simulation
}

/**
 * 🆕 Interface pour les résultats de migration
 */
export interface MigrationResult {
  totalProducts: number;
  migratedProducts: number;
  failedMigrations: number;
  warnings: string[];
  errors: string[];
  executionTime: number;
  createdCategories?: string[];
  // 🆕 DÉTAILS SUPPLÉMENTAIRES
  batchesProcessed: number;
  averageTimePerBatch: number;
  skippedProducts: number;      // Produits déjà migrés
}

// ===== TYPES DE COMPATIBILITÉ =====

/**
 * 🔄 Type déprécié pour la rétrocompatibilité
 * @deprecated Utilisez ProductFilters avec categoryIds à la place
 */
export interface LegacyProductFilters {
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  priceRange: { min: number; max: number };
  categories: string[];  // Ancien format
}

/**
 * 🔄 Function helper pour convertir les anciens filtres vers les nouveaux
 */
export function migrateLegacyFilters(legacy: LegacyProductFilters): ProductFilters {
  return {
    ...legacy,
    categoryIds: legacy.categories,
    subCategoryIds: [],
    minCategoriesCount: undefined,
    maxCategoriesCount: undefined,
    hasMultipleCategories: undefined,
    stockStatuses: legacy.inStock ? ["En Stock"] : undefined,
    scoreRange: undefined,
  };
}

// ===== TYPES POUR L'ANALYTICS ET LE TRACKING =====

/**
 * 🆕 Types pour les événements de tracking multi-catégories
 */
export type MultiCategoryEvent = 
  | 'category_selected'
  | 'subcategory_selected' 
  | 'multiple_categories_selected'
  | 'category_filter_applied'
  | 'category_combination_viewed'
  | 'cross_category_navigation'
  | 'category_search_performed';

export interface CategoryTrackingEvent {
  eventType: MultiCategoryEvent;
  categoryIds: string[];
  subCategoryIds?: string[];
  timestamp: Date;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  // 🆕 CONTEXTE SUPPLÉMENTAIRE
  previousCategoryIds?: string[];  // Catégories précédentes
  searchQuery?: string;            // Requête de recherche associée
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * 🆕 Interface pour l'analyse des performances multi-catégories
 */
export interface MultiCategoryAnalytics {
  popularCombinations: Array<{
    categoryIds: string[];
    subCategoryIds?: string[];
    viewCount: number;
    conversionRate: number;
    averageOrderValue: number;
    // 🆕 MÉTRIQUES SUPPLÉMENTAIRES
    bounceRate: number;
    timeSpent: number;
    returnVisitorRate: number;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    name: string;
    productCount: number;
    viewCount: number;
    clickThroughRate: number;
    conversionRate: number;
    // 🆕 PERFORMANCE ENRICHIE
    revenueGenerated: number;
    averageSessionDuration: number;
    topExitPoints: string[];
  }>;
  crossCategoryNavigation: Array<{
    fromCategoryId: string;
    toCategoryId: string;
    transitionCount: number;
    averageTimeSpent: number;
    // 🆕 ANALYSE DU FLUX
    conversionRate: number;
    dropOffRate: number;
  }>;
}

// ===== UTILITAIRES DE VALIDATION =====

/**
 * 🆕 Fonctions utilitaires pour la validation
 */
export const ProductValidation = {
  isValidProduct: (product: unknown): product is Product => {
    return (
      typeof product === 'object' &&
      product !== null &&
      'id' in product &&
      'name' in product &&
      'categoryIds' in product &&
      Array.isArray((product as Product).categoryIds)
    );
  },
  
  hasMultipleCategories: (product: Product): product is MultiCategoryProduct => {
    return product.categoryIds.length > 1;
  },
  
  isLegacyProduct: (product: Product): boolean => {
    return 'categoryId' in product || 'subCategoryId' in product;
  }
} as const;