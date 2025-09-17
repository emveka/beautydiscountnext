// lib/firebase-utils.ts
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, StockStatus, Category, SubCategory, Brand } from "@/lib/types";

/**
 * Fonction utilitaire pour convertir les timestamps Firestore
 */
function convertFirestoreDate(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Vérification pour les objets avec toDate
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    const timestampObj = timestamp as { toDate: () => Date };
    if (typeof timestampObj.toDate === 'function') {
      return timestampObj.toDate();
    }
  }
  
  // Vérification pour les objets avec seconds
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    const timestampObj = timestamp as { seconds: number };
    if (typeof timestampObj.seconds === 'number') {
      return new Date(timestampObj.seconds * 1000);
    }
  }
  
  return new Date();
}

/**
 * Validation sécurisée des données
 */
function validateString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value.trim() : defaultValue;
}

function validateNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

function validateArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === 'string') : [];
}

function validateStockStatus(value: unknown): StockStatus {
  const validStatuses: StockStatus[] = ["En Stock", "Sur Commande", "Rupture"];
  return validStatuses.includes(value as StockStatus) ? value as StockStatus : "En Stock";
}

// ===== FONCTIONS DE GESTION DES MARQUES =====

/**
 * Récupération du nom d'une marque par son ID
 */
export async function getBrandName(brandId: string): Promise<string | undefined> {
  try {
    if (!brandId) return undefined;
    
    const brandRef = doc(db, "brands", brandId);
    const brandSnap = await getDoc(brandRef);
    
    if (brandSnap.exists()) {
      const brandData = brandSnap.data();
      return validateString(brandData.name) || brandId;
    }
    
    return brandId;
  } catch (error) {
    console.warn(`Erreur lors de la récupération de la marque ${brandId}:`, error);
    return brandId;
  }
}

/**
 * Récupération de plusieurs marques en une fois
 */
export async function getBrandsMap(brandIds: string[]): Promise<Map<string, string>> {
  const brandsMap = new Map<string, string>();
  
  if (!brandIds.length) return brandsMap;
  
  try {
    const brandPromises = brandIds.map(async (brandId) => {
      try {
        const brandRef = doc(db, "brands", brandId);
        const brandSnap = await getDoc(brandRef);
        
        if (brandSnap.exists()) {
          const brandData = brandSnap.data();
          return { id: brandId, name: validateString(brandData.name) || brandId };
        }
        return { id: brandId, name: brandId };
      } catch (error) {
        console.warn(`Erreur lors de la récupération de la marque ${brandId}:`, error);
        return { id: brandId, name: brandId };
      }
    });
    
    const brands = await Promise.all(brandPromises);
    brands.forEach(brand => {
      brandsMap.set(brand.id, brand.name);
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des marques:", error);
    brandIds.forEach(id => brandsMap.set(id, id));
  }
  
  return brandsMap;
}

// ===== FONCTIONS DE GESTION DES CATÉGORIES =====

/**
 * Récupération d'une catégorie par son slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      console.error('Slug invalide fourni à getCategoryBySlug');
      return null;
    }

    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`Aucune catégorie trouvée pour le slug: ${slug}`);
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const category: Category = {
      id: doc.id,
      name: validateString(data.name, 'Catégorie sans nom'),
      slug: validateString(data.slug, slug),
      description: validateString(data.description) || undefined,
      descriptionLongue: validateString(data.descriptionLongue) || undefined,
      image: validateString(data.image) || undefined,
      imagePath: validateString(data.imagePath) || undefined,
      parentId: validateString(data.parentId) || undefined,
      seo: data.seo ? {
        metaTitle: validateString(data.seo.metaTitle) || undefined,
        metaDescription: validateString(data.seo.metaDescription) || undefined,
        metaKeywords: validateArray(data.seo.metaKeywords),
        canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
      } : undefined,
      createdAt: convertFirestoreDate(data.createdAt),
      updatedAt: convertFirestoreDate(data.updatedAt),
    };
    
    return category;
    
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return null;
  }
}

/**
 * Récupération de catégorie par ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    if (!categoryId || typeof categoryId !== 'string') {
      console.error('CategoryId invalide fourni à getCategoryById');
      return null;
    }

    const categoryRef = doc(db, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      console.warn(`Aucune catégorie trouvée pour l'ID: ${categoryId}`);
      return null;
    }
    
    const data = categorySnap.data();
    
    const category: Category = {
      id: categorySnap.id,
      name: validateString(data.name, 'Catégorie sans nom'),
      slug: validateString(data.slug),
      description: validateString(data.description) || undefined,
      descriptionLongue: validateString(data.descriptionLongue) || undefined,
      image: validateString(data.image) || undefined,
      imagePath: validateString(data.imagePath) || undefined,
      parentId: validateString(data.parentId) || undefined,
      seo: data.seo ? {
        metaTitle: validateString(data.seo.metaTitle) || undefined,
        metaDescription: validateString(data.seo.metaDescription) || undefined,
        metaKeywords: validateArray(data.seo.metaKeywords),
        canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
      } : undefined,
      createdAt: convertFirestoreDate(data.createdAt),
      updatedAt: convertFirestoreDate(data.updatedAt),
    };
    
    return category;
    
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    return null;
  }
}

// ===== FONCTIONS DE GESTION DES SOUS-CATÉGORIES =====

/**
 * Récupération des sous-catégories d'une catégorie
 */
export async function getSubCategories(categoryId: string): Promise<SubCategory[]> {
  try {
    if (!categoryId) return [];

    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, where("parentId", "==", categoryId));
    const querySnapshot = await getDocs(q);
    
    const subCategories: SubCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      subCategories.push({
        id: doc.id,
        name: validateString(data.name),
        slug: validateString(data.slug),
        parentId: validateString(data.parentId, categoryId),
        description: validateString(data.description) || undefined,
        descriptionLongue: validateString(data.descriptionLongue) || undefined,
        image: validateString(data.image) || undefined,
        imagePath: validateString(data.imagePath) || undefined,
        seo: data.seo ? {
          metaTitle: validateString(data.seo.metaTitle) || undefined,
          metaDescription: validateString(data.seo.metaDescription) || undefined,
          metaKeywords: validateArray(data.seo.metaKeywords),
          canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
        } : undefined,
        createdAt: convertFirestoreDate(data.createdAt),
        updatedAt: convertFirestoreDate(data.updatedAt),
        productCount: validateNumber(data.productCount) || 0,
      });
    });
    
    return subCategories.sort((a, b) => a.name.localeCompare(b.name));
    
  } catch (error) {
    console.error("Erreur lors de la récupération des sous-catégories:", error);
    return [];
  }
}

/**
 * Récupération d'une sous-catégorie par son slug
 */
export async function getSubCategoryBySlug(subSlug: string, parentSlug?: string): Promise<SubCategory | null> {
  try {
    if (!subSlug || typeof subSlug !== 'string') {
      console.error('SubSlug invalide fourni à getSubCategoryBySlug');
      return null;
    }

    const categoriesRef = collection(db, "categories");
    let q = query(categoriesRef, where("slug", "==", subSlug));
    
    if (parentSlug) {
      const parentCategory = await getCategoryBySlug(parentSlug);
      if (parentCategory) {
        q = query(categoriesRef, 
          where("slug", "==", subSlug), 
          where("parentId", "==", parentCategory.id)
        );
      }
    }
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`Aucune sous-catégorie trouvée pour le slug: ${subSlug}`);
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const subCategory: SubCategory = {
      id: doc.id,
      name: validateString(data.name, 'Sous-catégorie sans nom'),
      slug: validateString(data.slug, subSlug),
      parentId: validateString(data.parentId),
      description: validateString(data.description) || undefined,
      descriptionLongue: validateString(data.descriptionLongue) || undefined,
      image: validateString(data.image) || undefined,
      imagePath: validateString(data.imagePath) || undefined,
      seo: data.seo ? {
        metaTitle: validateString(data.seo.metaTitle) || undefined,
        metaDescription: validateString(data.seo.metaDescription) || undefined,
        metaKeywords: validateArray(data.seo.metaKeywords),
        canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
      } : undefined,
      createdAt: convertFirestoreDate(data.createdAt),
      updatedAt: convertFirestoreDate(data.updatedAt),
      productCount: 0,
    };
    
    return subCategory;
    
  } catch (error) {
    console.error("Erreur lors de la récupération de la sous-catégorie:", error);
    return null;
  }
}

/**
 * Récupération de sous-catégorie par ID
 */
export async function getSubCategoryById(subCategoryId: string): Promise<SubCategory | null> {
  try {
    if (!subCategoryId || typeof subCategoryId !== 'string') {
      console.error('SubCategoryId invalide fourni à getSubCategoryById');
      return null;
    }

    const categoryRef = doc(db, "categories", subCategoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (!categorySnap.exists()) {
      console.warn(`Aucune sous-catégorie trouvée pour l'ID: ${subCategoryId}`);
      return null;
    }
    
    const data = categorySnap.data();
    
    const subCategory: SubCategory = {
      id: categorySnap.id,
      name: validateString(data.name, 'Sous-catégorie sans nom'),
      slug: validateString(data.slug),
      parentId: validateString(data.parentId),
      description: validateString(data.description) || undefined,
      descriptionLongue: validateString(data.descriptionLongue) || undefined,
      image: validateString(data.image) || undefined,
      imagePath: validateString(data.imagePath) || undefined,
      seo: data.seo ? {
        metaTitle: validateString(data.seo.metaTitle) || undefined,
        metaDescription: validateString(data.seo.metaDescription) || undefined,
        metaKeywords: validateArray(data.seo.metaKeywords),
        canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
      } : undefined,
      createdAt: convertFirestoreDate(data.createdAt),
      updatedAt: convertFirestoreDate(data.updatedAt),
      productCount: 0,
    };
    
    return subCategory;
    
  } catch (error) {
    console.error("Erreur lors de la récupération de la sous-catégorie:", error);
    return null;
  }
}

// ===== FONCTIONS DE GESTION DES PRODUITS =====

/**
 * Récupération des produits d'une catégorie avec les noms de marques
 */
export async function getCategoryProductsWithBrands(categoryId: string): Promise<Product[]> {
  try {
    if (!categoryId || typeof categoryId !== 'string') {
      console.error('CategoryId invalide fourni à getCategoryProductsWithBrands');
      return [];
    }

    const productsRef = collection(db, "products");
    const q = query(productsRef, where("categoryId", "==", categoryId));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    
    // Première passe : construire les produits et collecter les IDs de marques
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      try {
        const product: Product = {
          id: doc.id,
          name: validateString(data.name, 'Produit sans nom'),
          slug: validateString(data.slug, doc.id),
          description: validateString(data.description),
          shortDescription: validateString(data.shortDescription) || undefined,
          
          seo: data.seo ? {
            metaTitle: validateString(data.seo.metaTitle) || undefined,
            metaDescription: validateString(data.seo.metaDescription) || undefined,
            metaKeywords: validateArray(data.seo.metaKeywords),
            canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
          } : undefined,
          
          categoryId: validateString(data.categoryId, categoryId),
          subCategoryId: validateString(data.subCategoryId) || undefined,
          brandId: validateString(data.brandId) || undefined,
          brandName: undefined,
          
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
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit ${doc.id}:`, productError);
      }
    });
    
    // Deuxième passe : récupérer les noms de marques
    if (brandIds.size > 0) {
      const brandsMap = await getBrandsMap(Array.from(brandIds));
      
      products.forEach(product => {
        if (product.brandId && brandsMap.has(product.brandId)) {
          product.brandName = brandsMap.get(product.brandId);
        }
      });
    }
    
    // Tri par score décroissant
    products.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits avec marques:", error);
    return [];
  }
}

/**
 * Récupération des produits d'une sous-catégorie avec les noms de marques
 */
export async function getSubCategoryProductsWithBrands(subCategoryId: string): Promise<Product[]> {
  try {
    if (!subCategoryId || typeof subCategoryId !== 'string') {
      console.error('SubCategoryId invalide fourni à getSubCategoryProductsWithBrands');
      return [];
    }

    const productsRef = collection(db, "products");
    const q = query(productsRef, where("subCategoryId", "==", subCategoryId));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      try {
        const product: Product = {
          id: doc.id,
          name: validateString(data.name, 'Produit sans nom'),
          slug: validateString(data.slug, doc.id),
          description: validateString(data.description),
          shortDescription: validateString(data.shortDescription) || undefined,
          
          seo: data.seo ? {
            metaTitle: validateString(data.seo.metaTitle) || undefined,
            metaDescription: validateString(data.seo.metaDescription) || undefined,
            metaKeywords: validateArray(data.seo.metaKeywords),
            canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
          } : undefined,
          
          categoryId: validateString(data.categoryId),
          subCategoryId: validateString(data.subCategoryId, subCategoryId),
          brandId: validateString(data.brandId) || undefined,
          brandName: undefined,
          
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
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit ${doc.id}:`, productError);
      }
    });
    
    if (brandIds.size > 0) {
      const brandsMap = await getBrandsMap(Array.from(brandIds));
      
      products.forEach(product => {
        if (product.brandId && brandsMap.has(product.brandId)) {
          product.brandName = brandsMap.get(product.brandId);
        }
      });
    }
    
    products.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits de sous-catégorie avec marques:", error);
    return [];
  }
}

/**
 * Récupération d'un produit par son slug avec nom de marque
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      console.error('Slug invalide fourni à getProductBySlug');
      return null;
    }

    const productsRef = collection(db, "products");
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`Aucun produit trouvé pour le slug: ${slug}`);
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    const product: Product = {
      id: doc.id,
      name: validateString(data.name, 'Produit sans nom'),
      slug: validateString(data.slug, slug),
      description: validateString(data.description),
      shortDescription: validateString(data.shortDescription) || undefined,
      
      seo: data.seo ? {
        metaTitle: validateString(data.seo.metaTitle) || undefined,
        metaDescription: validateString(data.seo.metaDescription) || undefined,
        metaKeywords: validateArray(data.seo.metaKeywords),
        canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
      } : undefined,
      
      categoryId: validateString(data.categoryId),
      subCategoryId: validateString(data.subCategoryId) || undefined,
      brandId: validateString(data.brandId) || undefined,
      brandName: undefined,
      
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
    
    // Récupération du nom de la marque si brandId existe
    if (product.brandId) {
      product.brandName = await getBrandName(product.brandId);
    }
    
    return product;
    
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

/**
 * Récupération des produits populaires/recommandés
 */
export async function getPopularProducts(limitCount: number = 20): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products");
    const q = query(
      productsRef, 
      orderBy("score", "desc"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      try {
        const product: Product = {
          id: doc.id,
          name: validateString(data.name, 'Produit sans nom'),
          slug: validateString(data.slug, doc.id),
          description: validateString(data.description),
          shortDescription: validateString(data.shortDescription) || undefined,
          
          seo: data.seo ? {
            metaTitle: validateString(data.seo.metaTitle) || undefined,
            metaDescription: validateString(data.seo.metaDescription) || undefined,
            metaKeywords: validateArray(data.seo.metaKeywords),
            canonicalUrl: validateString(data.seo.canonicalUrl) || undefined,
          } : undefined,
          
          categoryId: validateString(data.categoryId),
          subCategoryId: validateString(data.subCategoryId) || undefined,
          brandId: validateString(data.brandId) || undefined,
          brandName: undefined,
          
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
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit populaire ${doc.id}:`, productError);
      }
    });
    
    if (brandIds.size > 0) {
      const brandsMap = await getBrandsMap(Array.from(brandIds));
      
      products.forEach(product => {
        if (product.brandId && brandsMap.has(product.brandId)) {
          product.brandName = brandsMap.get(product.brandId);
        }
      });
    }
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits populaires:", error);
    return [];
  }
}

// ===== FONCTIONS UTILITAIRES =====

/**
 * Récupération des marques utilisées dans une catégorie
 */
export async function getCategoryBrands(categoryId: string): Promise<Brand[]> {
  try {
    if (!categoryId) return [];

    const products = await getCategoryProductsWithBrands(categoryId);
    
    const brandCounts = new Map<string, { name: string; count: number }>();
    
    products.forEach(product => {
      if (product.brandId && product.brandName) {
        const existing = brandCounts.get(product.brandId);
        if (existing) {
          existing.count++;
        } else {
          brandCounts.set(product.brandId, {
            name: product.brandName,
            count: 1
          });
        }
      }
    });
    
    const brands: Brand[] = Array.from(brandCounts.entries()).map(([brandId, data]) => ({
      id: brandId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      productCount: data.count,
    }));
    
    return brands.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    
  } catch (error) {
    console.error("Erreur lors de la récupération des marques:", error);
    return [];
  }
}

/**
 * Fonction utilitaire pour résoudre la catégorie et sous-catégorie par leurs IDs
 */
export async function resolveProductContext(categoryId: string, subCategoryId?: string) {
  try {
    const promises: [Promise<Category | null>, Promise<SubCategory | null>] = [
      getCategoryById(categoryId),
      subCategoryId ? getSubCategoryById(subCategoryId) : Promise.resolve(null)
    ];
    
    const [category, subCategory] = await Promise.all(promises);
    
    return { category, subCategory };
    
  } catch (error) {
    console.error("Erreur lors de la résolution du contexte produit:", error);
    return { category: null, subCategory: null };
  }
}

// ===== FONCTIONS DE FORMATAGE ET UTILITAIRES =====

/**
 * Fonction utilitaire pour calculer la réduction
 */
export function calculateDiscount(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price || price <= 0) {
    return null;
  }
  
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Fonction utilitaire pour formater le prix
 */
export function formatPrice(price: number, currency = 'DH'): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return `0 ${currency}`;
  }
  
  return `${price.toLocaleString('fr-FR')} ${currency}`;
}

/**
 * Fonction pour obtenir le statut CSS du stock
 */
export function getStockStatusClasses(stock: StockStatus): string {
  switch (stock) {
    case "En Stock":
      return 'bg-green-100 text-green-700';
    case "Sur Commande":
      return 'bg-amber-100 text-amber-700';
    case "Rupture":
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-green-100 text-green-700';
  }
}

/**
 * Fonction pour vérifier si un produit est en promotion
 */
export function isProductOnSale(product: Product): boolean {
  return !!(product.originalPrice && product.originalPrice > product.price);
}

// ===== FONCTIONS DE GESTION D'IMAGES - VERSION SIMPLIFIÉE =====

/**
 * Fonction SIMPLIFIÉE pour obtenir l'URL de la première image du produit
 * Remplace toute la logique complexe précédente
 */
export function getProductImageUrl(product: Product): string {
  const allImages = [...(product.images || []), ...(product.imagePaths || [])];
  
  for (const imageUrl of allImages) {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      const cleanUrl = imageUrl.trim();
      
      // URL complète Firebase Storage ou autre
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
      }
      
      // Chemin relatif qui commence déjà par /
      if (cleanUrl.startsWith('/')) {
        return cleanUrl;
      }
      
      // Ajouter le slash manquant pour les chemins relatifs
      return `/${cleanUrl}`;
    }
  }
  
  // Image par défaut si aucune image valide trouvée
  return '/api/placeholder/300/300';
}

/**
 * Fonction SIMPLIFIÉE pour valider les URLs d'images (pour ProductGallery)
 * Version allégée pour compatibilité avec le code existant
 */
export function isValidImageUrl(imageUrl: string): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }
  
  const cleanUrl = imageUrl.trim();
  
  if (!cleanUrl) {
    return false;
  }
  
  // Vérifier l'extension (basique)
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    cleanUrl.toLowerCase().includes(ext)
  );
  
  if (!hasValidExtension) {
    return false;
  }
  
  // URLs complètes valides
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      new URL(cleanUrl);
      return true;
    } catch {
      return false;
    }
  }
  
  // Chemins relatifs valides
  if (cleanUrl.startsWith('/')) {
    return true;
  }
  
  // Autres chemins relatifs
  return true;
}

/**
 * Fonction SIMPLIFIÉE pour normaliser les URLs (pour ProductGallery)
 * Version allégée pour compatibilité avec le code existant
 */
export function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '/api/placeholder/300/300';
  }
  
  const cleanUrl = imageUrl.trim();
  
  if (!cleanUrl) {
    return '/api/placeholder/300/300';
  }
  
  // Si c'est déjà une URL complète, on la retourne
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }
  
  // Si c'est un chemin absolu qui commence par /, on le retourne
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }
  
  // Ajouter le / manquant pour les chemins relatifs
  return `/${cleanUrl}`;
}



