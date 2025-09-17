// lib/types.ts - Fichier de types centralisé pour BeautyDiscount
import type { Timestamp } from "firebase/firestore";

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
 * Interface principale pour les produits selon votre structure Firebase
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  // SEO
  seo?: ProductSEO;
  // Taxonomie
  categoryId: string;
  subCategoryId?: string;
  brandId?: string;
  brandName?: string; // ✅ Ajout du nom de la marque
  // Prix
  price: number;
  originalPrice?: number;
  // Stock
  stock: StockStatus;
  // Référence & médias
  sku: string;
  images: string[];
  imagePaths: string[];
  // Contenance
  contenance?: string;
  badgeText?: string;      // Texte du badge (ex: "NOUVEAU", "TENDANCE", "EXCLUSIF")
  badgeColor?: string;     // Couleur du badge (ex: "red", "blue", "#ff6b6b", "rgb(255,107,107)")
  // Scoring et ordre
  score: number;
  createdAt: Date;
  updatedAt: Date;
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
  categoryId?: string;        // ✅ CORRIGÉ: string au lieu de any
  description?: string;
  descriptionLongue?: string;        // ✅ NOUVEAU
  image?: string;             // ✅ NOUVEAU
  imagePath?: string;         // ✅ NOUVEAU
  seo?: CategorySEO;          // ✅ NOUVEAU : Réutilise l'interface SEO des catégories
  createdAt: Date;            // ✅ NOUVEAU
  updatedAt: Date;            // ✅ NOUVEAU
  productCount?: number;
}

/**
 * ✅ NOUVEAU : Props pour CategoryInfo avec support sous-catégories
 */
export interface CategoryInfoProps {
  category: Category | SubCategory;
  productCount: number;
  subCategoriesCount?: number;
  isSubCategory?: boolean;       // ✅ NOUVEAU : Pour adapter l'affichage
  parentCategory?: Category;     // ✅ NOUVEAU : Catégorie parente si c'est une sous-cat
}

/**
 * ✅ ENRICHISSEMENT : Props pour ProductGrid avec sous-catégorie courante
 */
export interface ProductGridProps {
  products: Product[];
  categorySlug?: string;
  categoryName?: string;
  subCategories?: SubCategory[];
  currentSubCategoryId?: string;  // ✅ NOUVEAU : Pour marquer la sous-cat active
}

/**
 * Interface pour les marques
 */
export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

/**
 * Interface pour les filtres de produits
 */
export interface ProductFilters {
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  categories: string[];
}

/**
 * Types pour le tri des produits
 */
export type ProductSortOption = 'score' | 'price-low' | 'price-high' | 'newest' | 'name' | 'discount';

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
}

/**
 * Interface pour les erreurs d'API
 */
export interface APIError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}