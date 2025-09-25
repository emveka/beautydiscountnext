// lib/firebase-utils.ts - VERSION MULTI-CATÉGORIES - PARTIE 1/3
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc,

} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, StockStatus, Category, SubCategory, Brand } from "@/lib/types";

// ✅ AJOUTEZ L'INTERFACE ICI
interface FirestoreProductData {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  shortDescription?: unknown;
  seo?: {
    metaTitle?: unknown;
    metaDescription?: unknown;
    metaKeywords?: unknown;
    canonicalUrl?: unknown;
  };
  categoryIds?: unknown;
  categoryId?: unknown;
  subCategoryIds?: unknown;
  subCategoryId?: unknown;
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
 * Fonction utilitaire pour convertir les timestamps Firestore
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
// lib/firebase-utils.ts - VERSION MULTI-CATÉGORIES - PARTIE 3A/3

// ===== FONCTIONS DE GESTION DES PRODUITS MULTI-CATÉGORIES =====

/**
 * MIGRATION AUTOMATIQUE D'UN PRODUIT VERS LA STRUCTURE MULTI-CATÉGORIES
 */
function migrateProductToMultiCategories(data: FirestoreProductData): Product {
  return {
    id: validateString(data.id, ''),
    name: validateString(data.name, 'Produit sans nom'),
    slug: validateString(data.slug, data.id as string || ''),
    description: validateString(data.description),
    shortDescription: validateString(data.shortDescription) || undefined,
   
    seo: data.seo ? {
  metaTitle: validateString((data.seo as Record<string, unknown>).metaTitle) || undefined,
  metaDescription: validateString((data.seo as Record<string, unknown>).metaDescription) || undefined,
  metaKeywords: validateArray((data.seo as Record<string, unknown>).metaKeywords),
  canonicalUrl: validateString((data.seo as Record<string, unknown>).canonicalUrl) || undefined,
} : undefined,
   
    // MIGRATION AUTOMATIQUE : anciens champs → nouveaux champs multi-catégories
    categoryIds: validateArray(data.categoryIds) || (data.categoryId ? [validateString(data.categoryId)] : []),
    subCategoryIds: validateArray(data.subCategoryIds) || (data.subCategoryId ? [validateString(data.subCategoryId)] : []),
   
    brandId: validateString(data.brandId) || undefined,
    brandName: validateString(data.brandName) || undefined,
   
    price: validateNumber(data.price, 0),
    originalPrice: data.originalPrice ? validateNumber(data.originalPrice) : undefined,
   
    stock: validateStockStatus(data.stock),
   
    sku: validateString(data.sku, data.id as string || ''),
    images: validateArray(data.images),
    imagePaths: validateArray(data.imagePaths),
   
    contenance: validateString(data.contenance) || undefined,
    badgeText: validateString(data.badgeText) || undefined,
    badgeColor: validateString(data.badgeColor) || undefined,
   
    score: validateNumber(data.score, 0),
    createdAt: convertFirestoreDate(data.createdAt),
    updatedAt: convertFirestoreDate(data.updatedAt),
  };
}

/**
 * RÉCUPÉRATION DES PRODUITS PAR MULTI-CATÉGORIES AVEC NOMS DE MARQUES
 */
export async function getProductsByMultipleCategories(categoryIds: string[]): Promise<Product[]> {
  try {
    if (!categoryIds.length) {
      console.warn('Aucune catégorie fournie à getProductsByMultipleCategories');
      return [];
    }

    console.log('Recherche produits multi-catégories:', { categoryIds, count: categoryIds.length });

    const productsRef = collection(db, "products");
    
    // REQUÊTE FIRESTORE POUR MULTI-CATÉGORIES
    // Utilise arrayContainsAny pour trouver les produits qui ont au moins une des catégories
    const q = query(productsRef, where("categoryIds", "array-contains-any", categoryIds));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Aucun produit trouvé pour ces catégories');
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const product = migrateProductToMultiCategories({ ...data, id: doc.id });
        
        products.push(product);
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit multi-catégories ${doc.id}:`, productError);
      }
    });
    
    // Récupération des noms de marques
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
    
    console.log('Produits multi-catégories récupérés:', {
      total: products.length,
      uniqueBrands: brandIds.size,
      avgCategoriesPerProduct: products.reduce((sum, p) => sum + p.categoryIds.length, 0) / products.length
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits multi-catégories:", error);
    return [];
  }
}

/**
 * RÉCUPÉRATION DES PRODUITS PAR MULTI-SOUS-CATÉGORIES
 */
export async function getProductsByMultipleSubCategories(subCategoryIds: string[]): Promise<Product[]> {
  try {
    if (!subCategoryIds.length) {
      console.warn('Aucune sous-catégorie fournie à getProductsByMultipleSubCategories');
      return [];
    }

    console.log('Recherche produits multi-sous-catégories:', { subCategoryIds, count: subCategoryIds.length });

    const productsRef = collection(db, "products");
    const q = query(productsRef, where("subCategoryIds", "array-contains-any", subCategoryIds));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('Aucun produit trouvé pour ces sous-catégories');
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const product = migrateProductToMultiCategories({ ...data, id: doc.id });
        
        products.push(product);
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit multi-sous-catégories ${doc.id}:`, productError);
      }
    });
    
    // Récupération des noms de marques
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
    
    console.log('Produits multi-sous-catégories récupérés:', {
      total: products.length,
      avgSubCategoriesPerProduct: products.reduce((sum, p) => sum + p.subCategoryIds.length, 0) / products.length
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits multi-sous-catégories:", error);
    return [];
  }
}

/**
 * MISE À JOUR : Récupération des produits d'une catégorie (avec rétrocompatibilité)
 */
export async function getCategoryProductsWithBrands(categoryId: string): Promise<Product[]> {
  try {
    if (!categoryId || typeof categoryId !== 'string') {
      console.error('CategoryId invalide fourni à getCategoryProductsWithBrands');
      return [];
    }

    console.log('Recherche produits pour catégorie:', categoryId);

    const productsRef = collection(db, "products");
    
    // REQUÊTE HYBRIDE : recherche dans categoryIds (nouveau) ET categoryId (ancien)
    const queries = [
      // Nouveaux produits multi-catégories
      query(productsRef, where("categoryIds", "array-contains", categoryId)),
      // Anciens produits mono-catégorie (rétrocompatibilité)
      query(productsRef, where("categoryId", "==", categoryId))
    ];
    
    const queryPromises = queries.map(q => getDocs(q));
    const queryResults = await Promise.all(queryPromises);
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    const seenProductIds = new Set<string>(); // Éviter les doublons
    
    // Traitement des résultats de toutes les requêtes
    queryResults.forEach(querySnapshot => {
      querySnapshot.forEach((doc) => {
        // Éviter les doublons
        if (seenProductIds.has(doc.id)) {
          return;
        }
        seenProductIds.add(doc.id);
        
        try {
          const data = doc.data();
          const product = migrateProductToMultiCategories({ ...data, id: doc.id });
          
          products.push(product);
          
          if (product.brandId) {
            brandIds.add(product.brandId);
          }
          
        } catch (productError) {
          console.error(`Erreur lors du traitement du produit ${doc.id}:`, productError);
        }
      });
    });
    
    // Récupération des noms de marques
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
    
    console.log('Produits de catégorie récupérés:', {
      categoryId,
      total: products.length,
      uniqueBrands: brandIds.size,
      multiCategoryProducts: products.filter(p => p.categoryIds.length > 1).length
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits avec marques:", error);
    return [];
  }
}

/**
 * MISE À JOUR : Récupération des produits d'une sous-catégorie (avec rétrocompatibilité)
 */
export async function getSubCategoryProductsWithBrands(subCategoryId: string): Promise<Product[]> {
  try {
    if (!subCategoryId || typeof subCategoryId !== 'string') {
      console.error('SubCategoryId invalide fourni à getSubCategoryProductsWithBrands');
      return [];
    }

    console.log('Recherche produits pour sous-catégorie:', subCategoryId);

    const productsRef = collection(db, "products");
    
    // REQUÊTE HYBRIDE : recherche dans subCategoryIds (nouveau) ET subCategoryId (ancien)
    const queries = [
      // Nouveaux produits multi-sous-catégories
      query(productsRef, where("subCategoryIds", "array-contains", subCategoryId)),
      // Anciens produits mono-sous-catégorie (rétrocompatibilité)
      query(productsRef, where("subCategoryId", "==", subCategoryId))
    ];
    
    const queryPromises = queries.map(q => getDocs(q));
    const queryResults = await Promise.all(queryPromises);
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    const seenProductIds = new Set<string>();
    
    queryResults.forEach(querySnapshot => {
      querySnapshot.forEach((doc) => {
        if (seenProductIds.has(doc.id)) {
          return;
        }
        seenProductIds.add(doc.id);
        
        try {
          const data = doc.data();
          const product = migrateProductToMultiCategories({ ...data, id: doc.id });
          
          products.push(product);
          
          if (product.brandId) {
            brandIds.add(product.brandId);
          }
          
        } catch (productError) {
          console.error(`Erreur lors du traitement du produit ${doc.id}:`, productError);
        }
      });
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
    
    console.log('Produits de sous-catégorie récupérés:', {
      subCategoryId,
      total: products.length,
      multiSubCategoryProducts: products.filter(p => p.subCategoryIds.length > 1).length
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits de sous-catégorie avec marques:", error);
    return [];
  }
}
// lib/firebase-utils.ts - VERSION MULTI-CATÉGORIES - PARTIE 3B/3 (FINALE)

/**
 * MISE À JOUR : Récupération d'un produit par son slug avec migration automatique
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
    
    const product = migrateProductToMultiCategories({ ...data, id: doc.id });
    
    // Récupération du nom de la marque si brandId existe
    if (product.brandId) {
      product.brandName = await getBrandName(product.brandId);
    }
    
    console.log('Produit récupéré par slug:', {
      slug,
      name: product.name,
      categoriesCount: product.categoryIds.length,
      subCategoriesCount: product.subCategoryIds.length
    });
    
    return product;
    
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

/**
 * MISE À JOUR : Récupération des produits populaires avec migration automatique
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
      try {
        const data = doc.data();
        const product = migrateProductToMultiCategories({ ...data, id: doc.id });
        
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
    
    console.log('Produits populaires récupérés:', {
      total: products.length,
      avgCategoriesPerProduct: products.reduce((sum, p) => sum + p.categoryIds.length, 0) / products.length
    });
    
    return products;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des produits populaires:", error);
    return [];
  }
}

// ===== FONCTIONS UTILITAIRES MISES À JOUR =====

/**
 * MISE À JOUR : Récupération des marques utilisées dans une catégorie (multi-catégories)
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
    
    console.log('Marques de catégorie récupérées:', {
      categoryId,
      uniqueBrands: brands.length,
      totalProducts: products.length
    });
    
    return brands.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    
  } catch (error) {
    console.error("Erreur lors de la récupération des marques:", error);
    return [];
  }
}

/**
 * NOUVELLE FONCTION : Récupération des marques utilisées dans plusieurs catégories
 */
export async function getMultipleCategoriesBrands(categoryIds: string[]): Promise<Brand[]> {
  try {
    if (!categoryIds.length) return [];

    console.log('Recherche marques pour catégories multiples:', categoryIds);

    const products = await getProductsByMultipleCategories(categoryIds);
    
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
    
    console.log('Marques multi-catégories récupérées:', {
      categoryIds,
      uniqueBrands: brands.length,
      totalProducts: products.length
    });
    
    return brands.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    
  } catch (error) {
    console.error("Erreur lors de la récupération des marques multi-catégories:", error);
    return [];
  }
}

/**
 * MISE À JOUR : Fonction utilitaire pour résoudre le contexte produit (multi-catégories)
 */
export async function resolveProductContext(
  categoryIds: string[],
  subCategoryIds?: string[]
): Promise<{
  categories: Category[]
  subCategories: SubCategory[]
}> {
  try {
    // ✅ SÉPARER LES PROMESSES PAR TYPE
    const categoryPromises: Promise<Category | null>[] = categoryIds.map(id => getCategoryById(id));
    const subCategoryPromises: Promise<SubCategory | null>[] = subCategoryIds?.length ? 
      subCategoryIds.map(id => getSubCategoryById(id)) : [];
    
    // ✅ EXÉCUTER LES PROMESSES SÉPARÉMENT
    const [categoryResults, subCategoryResults] = await Promise.all([
      Promise.all(categoryPromises),
      Promise.all(subCategoryPromises)
    ]);
    
    // ✅ FILTRER LES RÉSULTATS AVEC LES BONS TYPES
    const categories: Category[] = categoryResults.filter((cat): cat is Category => cat !== null);
    const subCategories: SubCategory[] = subCategoryResults.filter((subCat): subCat is SubCategory => subCat !== null);
    
    console.log('Contexte produit multi-catégories résolu:', {
      categoriesFound: categories.length,
      categoriesRequested: categoryIds.length,
      subCategoriesFound: subCategories.length,
      subCategoriesRequested: subCategoryIds?.length || 0
    });
    
    return { categories, subCategories };
    
  } catch (error) {
    console.error("Erreur lors de la résolution du contexte produit multi-catégories:", error);
    return { categories: [], subCategories: [] };
  }
}

/**
 * NOUVELLE FONCTION : Recherche de produits par texte avec support multi-catégories
 */
export async function searchProductsWithCategories(
  searchTerm: string, 
  categoryIds?: string[], 
  subCategoryIds?: string[],
  limitCount: number = 20
): Promise<Product[]> {
  try {
    if (!searchTerm.trim()) {
      console.warn('Terme de recherche vide');
      return [];
    }

    console.log('Recherche produits avec catégories:', {
      searchTerm,
      categoryIds: categoryIds?.length || 0,
      subCategoryIds: subCategoryIds?.length || 0,
      limitCount
    });

    const productsRef = collection(db, "products");
    const baseQuery = query(productsRef, limit(limitCount * 2)); // Récupérer plus pour filtrer ensuite

    const querySnapshot = await getDocs(baseQuery);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const products: Product[] = [];
    const brandIds = new Set<string>();
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const product = migrateProductToMultiCategories({ ...data, id: doc.id });
        
        // Filtrage par terme de recherche
        const matchesSearch = 
          product.name.toLowerCase().includes(normalizedSearchTerm) ||
          product.description.toLowerCase().includes(normalizedSearchTerm) ||
          product.slug.toLowerCase().includes(normalizedSearchTerm) ||
          product.sku.toLowerCase().includes(normalizedSearchTerm) ||
          (product.shortDescription && product.shortDescription.toLowerCase().includes(normalizedSearchTerm)) ||
          (product.brandName && product.brandName.toLowerCase().includes(normalizedSearchTerm));
        
        if (!matchesSearch) return;
        
        // Filtrage par catégories si spécifiées
        if (categoryIds?.length) {
          const hasMatchingCategory = product.categoryIds.some(catId => categoryIds.includes(catId));
          if (!hasMatchingCategory) return;
        }
        
        // Filtrage par sous-catégories si spécifiées
        if (subCategoryIds?.length) {
          const hasMatchingSubCategory = product.subCategoryIds.some(subCatId => subCategoryIds.includes(subCatId));
          if (!hasMatchingSubCategory) return;
        }
        
        products.push(product);
        
        if (product.brandId) {
          brandIds.add(product.brandId);
        }
        
      } catch (productError) {
        console.error(`Erreur lors du traitement du produit recherché ${doc.id}:`, productError);
      }
    });
    
    // Récupération des noms de marques
    if (brandIds.size > 0) {
      const brandsMap = await getBrandsMap(Array.from(brandIds));
      
      products.forEach(product => {
        if (product.brandId && brandsMap.has(product.brandId)) {
          product.brandName = brandsMap.get(product.brandId);
        }
      });
    }
    
    // Tri par pertinence et score
    products.sort((a, b) => {
      // Priorité aux produits qui matchent dans le nom
      const aNameMatch = a.name.toLowerCase().includes(normalizedSearchTerm);
      const bNameMatch = b.name.toLowerCase().includes(normalizedSearchTerm);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Puis par score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    // Limiter les résultats
    const limitedResults = products.slice(0, limitCount);
    
    console.log('Recherche produits terminée:', {
      searchTerm,
      totalFound: products.length,
      returned: limitedResults.length,
      avgCategoriesPerResult: limitedResults.reduce((sum, p) => sum + p.categoryIds.length, 0) / limitedResults.length
    });
    
    return limitedResults;
    
  } catch (error) {
    console.error("Erreur lors de la recherche de produits:", error);
    return [];
  }
}

// ===== FONCTIONS DE FORMATAGE ET UTILITAIRES =====

export function calculateDiscount(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price || price <= 0) {
    return null;
  }
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatPrice(price: number, currency = 'DH'): string {
  if (typeof price !== 'number' || isNaN(price)) {
    return `0 ${currency}`;
  }
  return `${price.toLocaleString('fr-FR')} ${currency}`;
}

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

export function isProductOnSale(product: Product): boolean {
  return !!(product.originalPrice && product.originalPrice > product.price);
}

// ===== FONCTION GETPRODUCTIMAGEURL CORRIGÉE AVEC CACHE-BUSTING =====

/**
 * ✅ FONCTION CORRIGÉE - Obtient l'URL de l'image principale d'un produit avec cache-busting
 */
export function getProductImageUrl(product: Product, addCacheBusting: boolean = false): string {
  const allImages = [...(product.images || []), ...(product.imagePaths || [])];
  
  console.log('🖼️ getProductImageUrl appelée:', {
    productId: product.id,
    productName: product.name,
    imagesCount: product.images?.length || 0,
    imagePathsCount: product.imagePaths?.length || 0,
    addCacheBusting
  });
  
  for (const imageUrl of allImages) {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      const cleanUrl = imageUrl.trim();
      
      // URLs complètes (Firebase Storage en priorité)
      if (cleanUrl.startsWith('https://firebasestorage.googleapis.com')) {
        let finalUrl = cleanUrl;
        
        // ✅ AJOUT CACHE-BUSTING POUR FIREBASE STORAGE
        if (addCacheBusting) {
          try {
            const url = new URL(cleanUrl);
            url.searchParams.set('cb', Date.now().toString());
            finalUrl = url.toString();
          } catch (error) {
            console.warn('Erreur ajout cache-busting:', error);
          }
        }
        
        console.log('✅ URL Firebase Storage trouvée:', {
          original: cleanUrl.substring(0, 100) + '...',
          final: finalUrl.substring(0, 100) + '...'
        });
        
        return finalUrl;
      }
      
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        let finalUrl = cleanUrl;
        
        // ✅ AJOUT CACHE-BUSTING POUR AUTRES URLs
        if (addCacheBusting) {
          try {
            const url = new URL(cleanUrl);
            url.searchParams.set('cb', Date.now().toString());
            finalUrl = url.toString();
          } catch (error) {
            console.warn('Erreur ajout cache-busting:', error);
          }
        }
        
        console.log('🌐 Autre URL complète trouvée:', finalUrl);
        return finalUrl;
      }
      
      // Chemins relatifs
      if (cleanUrl.startsWith('/')) {
        const finalUrl = addCacheBusting 
          ? `${cleanUrl}?cb=${Date.now()}`
          : cleanUrl;
        
        console.log('📁 Chemin relatif trouvé:', finalUrl);
        return finalUrl;
      }
      
      // Chemin sans slash initial
      const finalUrl = addCacheBusting 
        ? `/${cleanUrl}?cb=${Date.now()}`
        : `/${cleanUrl}`;
        
      console.log('📂 Chemin converti:', finalUrl);
      return finalUrl;
    }
  }
  
  // Image par défaut avec cache-busting
  const placeholderUrl = addCacheBusting 
    ? `/images/placeholder-300x300.png?cb=${Date.now()}`
    : '/images/placeholder-300x300.png';
    
  console.log('❌ Aucune image valide, placeholder utilisé:', placeholderUrl);
  return placeholderUrl;
}

/**
 * ✅ NOUVELLE FONCTION - Obtenir l'URL d'image avec cache-busting automatique
 */
export function getProductImageUrlWithCacheBusting(product: Product): string {
  return getProductImageUrl(product, true);
}

/**
 * ✅ FONCTION CORRIGÉE - Vérifier si une URL d'image est valide avec gestion du cache
 */
export function isValidImageUrl(imageUrl: string, bypassCache: boolean = false): boolean {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }
  
  const cleanUrl = imageUrl.trim();
  
  if (!cleanUrl) {
    return false;
  }
  
  // Extensions valides
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];
  const hasValidExtension = validExtensions.some(ext => 
    cleanUrl.toLowerCase().includes(ext)
  );
  
  if (!hasValidExtension && !bypassCache) {
    return false;
  }
  
  // URLs complètes
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    try {
      new URL(cleanUrl);
      return true;
    } catch {
      return false;
    }
  }
  
  // Chemins relatifs
  if (cleanUrl.startsWith('/')) {
    return true;
  }
  
  return true;
}

/**
 * ✅ FONCTION CORRIGÉE - Normaliser l'URL d'image avec cache-busting optionnel
 */
export function normalizeImageUrl(imageUrl: string, addCacheBusting: boolean = false): string {
  if (!imageUrl || typeof imageUrl !== 'string') {
    const placeholder = addCacheBusting 
      ? `/api/placeholder/300/300?cb=${Date.now()}`
      : '/api/placeholder/300/300';
    return placeholder;
  }
  
  const cleanUrl = imageUrl.trim();
  
  if (!cleanUrl) {
    const placeholder = addCacheBusting 
      ? `/api/placeholder/300/300?cb=${Date.now()}`
      : '/api/placeholder/300/300';
    return placeholder;
  }
  
  // URLs complètes avec cache-busting
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    if (addCacheBusting) {
      try {
        const url = new URL(cleanUrl);
        url.searchParams.set('cb', Date.now().toString());
        return url.toString();
      } catch {
        return cleanUrl;
      }
    }
    return cleanUrl;
  }
  
  // Chemins relatifs
  if (cleanUrl.startsWith('/')) {
    return addCacheBusting 
      ? `${cleanUrl}?cb=${Date.now()}`
      : cleanUrl;
  }
  
  // Ajouter slash initial
  return addCacheBusting 
    ? `/${cleanUrl}?cb=${Date.now()}`
    : `/${cleanUrl}`;
}

/**
 * ✅ NOUVELLE FONCTION - Forcer le rechargement d'image en vidant le cache
 */
export function forceImageReload(imageUrl: string): string {
  if (!imageUrl) return imageUrl;
  
  try {
    const url = new URL(imageUrl);
    
    // Supprimer les anciens paramètres de cache
    url.searchParams.delete('cb');
    url.searchParams.delete('t');
    url.searchParams.delete('cache');
    
    // Ajouter nouveau timestamp
    url.searchParams.set('cb', Date.now().toString());
    
    return url.toString();
  } catch {
    // Si ce n'est pas une URL valide, ajouter timestamp simple
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}cb=${Date.now()}`;
  }
}

export function processProductImages(product: Product, forceCacheBusting: boolean = false): {
  processedImages: string[];
  processedImagePaths: string[];
  primaryImage: string;
} {
  const processedImages: string[] = [];
  
  console.log('🔄 Traitement images produit (SOLUTION DEFINITIVE):', {
    productId: product.id,
    productName: product.name,
    forceCacheBusting,
    originalImagesCount: product.images?.length || 0,
    // ❌ On ignore délibérément les imagePaths
    imagePathsIgnored: product.imagePaths?.length || 0
  });
  
  // ✅ TRAITER UNIQUEMENT LES URLs Firebase Storage (images)
  (product.images || []).forEach((imageUrl, index) => {
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      const processedUrl = forceCacheBusting 
        ? forceImageReload(imageUrl.trim())
        : imageUrl.trim();
      processedImages.push(processedUrl);
      
      console.log(`✅ Image Firebase ${index} traitée:`, {
        original: imageUrl.substring(0, 60) + '...',
        processed: processedUrl.substring(0, 60) + '...',
        hasCacheBusting: processedUrl.includes('cb=')
      });
    }
  });
  
  // ❌ IGNORER COMPLÈTEMENT les imagePaths qui causent les conflits
  const processedImagePaths: string[] = []; // VIDE !
  
  // Image principale = première URL Firebase ou placeholder
  const primaryImage = processedImages[0] || 
    (forceCacheBusting 
      ? `/api/placeholder/600/600?cb=${Date.now()}`
      : '/api/placeholder/600/600'
    );
  
  const result = {
    processedImages,
    processedImagePaths,
    primaryImage
  };
  
  console.log('✅ SOLUTION DÉFINITIVE - Images traitées:', {
    productId: product.id,
    processedImagesCount: processedImages.length,
    processedImagePathsCount: 0, // TOUJOURS 0
    primaryImage: primaryImage.substring(0, 80) + '...',
    conflictsAvoided: true
  });
  
  return result;
}

// ===== FONCTIONS UTILITAIRES POUR LES STATISTIQUES MULTI-CATÉGORIES =====

/**
 * NOUVELLE FONCTION : Obtenir les statistiques de répartition des catégories
 */
export async function getCategoryDistributionStats(): Promise<{
  totalProducts: number
  monoCategory: number
  multiCategory: number
  averageCategoriesPerProduct: number
  maxCategoriesPerProduct: number
  categoryDistribution: { [key: number]: number }
}> {
  try {
    console.log('Calcul des statistiques de répartition des catégories...');
    
    const productsRef = collection(db, "products");
    const querySnapshot = await getDocs(productsRef);
    
    if (querySnapshot.empty) {
      return {
        totalProducts: 0,
        monoCategory: 0,
        multiCategory: 0,
        averageCategoriesPerProduct: 0,
        maxCategoriesPerProduct: 0,
        categoryDistribution: {}
      };
    }
    
    const products: Product[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const product = migrateProductToMultiCategories({ ...data, id: doc.id });
        products.push(product);
      } catch (productError) {
        console.error(`Erreur traitement produit stats ${doc.id}:`, productError);
      }
    });
    
    const totalProducts = products.length;
    const monoCategory = products.filter(p => p.categoryIds.length === 1).length;
    const multiCategory = products.filter(p => p.categoryIds.length > 1).length;
    
    const categoryCounts = products.map(p => p.categoryIds.length);
    const averageCategoriesPerProduct = categoryCounts.reduce((sum, count) => sum + count, 0) / totalProducts;
    const maxCategoriesPerProduct = Math.max(...categoryCounts);
    
    const categoryDistribution: { [key: number]: number } = {};
    categoryCounts.forEach(count => {
      categoryDistribution[count] = (categoryDistribution[count] || 0) + 1;
    });
    
    const stats = {
      totalProducts,
      monoCategory,
      multiCategory,
      averageCategoriesPerProduct: Math.round(averageCategoriesPerProduct * 100) / 100,
      maxCategoriesPerProduct,
      categoryDistribution
    };
    
    console.log('Statistiques de répartition calculées:', stats);
    
    return stats;
    
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    return {
      totalProducts: 0,
      monoCategory: 0,
      multiCategory: 0,
      averageCategoriesPerProduct: 0,
      maxCategoriesPerProduct: 0,
      categoryDistribution: {}
    };
  }
}



