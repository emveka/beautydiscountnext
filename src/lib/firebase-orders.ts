// lib/firebase-orders.ts - VERSION CORRIGÉE ANTI-UNDEFINED
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import type { CartItem } from "./contexts/CartContext";

// Types pour les commandes
export type OrderStatus = 
  | "Commande Reçue" 
  | "Commande Confirmée" 
  | "Commande Expédiée" 
  | "Commande Livrée" 
  | "Commande Retournée" 
  | "Commande Annulée";

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phone: string;
}

// ✅ INTERFACE SÉCURISÉE - tous les champs critiques sont obligatoires
export interface OrderItem {
  productId: string;
  productName: string;
  productSlug: string;
  brandName: string;      // ✅ Toujours une string (peut être vide)
  sku: string;
  price: number;
  originalPrice: number;  // ✅ Toujours un number
  quantity: number;
  subtotal: number;
  imageUrl: string;       // ✅ Toujours une string (peut être placeholder)
}

export interface OrderTotals {
  subtotal: number;
  shippingCost: number;
  total: number;
  savings: number;
}

export interface Order {
  id?: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  
  customer: CustomerInfo;
  items: OrderItem[];
  totals: OrderTotals;
  
  notes: string;
  trackingNumber: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  order: Order;
}

interface FirebaseError extends Error {
  code: string;
}

function isFirebaseError(error: unknown): error is FirebaseError {
  return error instanceof Error && 'code' in error;
}

/**
 * ✅ FONCTION DE NETTOYAGE RENFORCÉE
 */
function sanitizeForFirestore(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return null; // Firestore accepte null mais pas undefined
  }
  
  if (obj instanceof Date || (obj && typeof obj === 'object' && 'seconds' in obj)) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj
      .map(item => sanitizeForFirestore(item))
      .filter(item => item !== null && item !== undefined);
  }
  
  if (obj && typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = sanitizeForFirestore(value);
      
      if (cleanedValue !== undefined && cleanedValue !== null) {
        cleaned[key] = cleanedValue;
      } else if (cleanedValue === null) {
        // Garder les null explicites mais pas les undefined
        cleaned[key] = null;
      }
      // Les undefined sont complètement ignorés
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * ✅ VALIDATION STRICTE ANTI-UNDEFINED
 */
function findUndefinedInObject(obj: unknown, path = 'root'): string[] {
  const undefinedPaths: string[] = [];
  
  if (obj === undefined) {
    undefinedPaths.push(path);
    return undefinedPaths;
  }
  
  if (obj === null || typeof obj !== 'object') {
    return undefinedPaths;
  }
  
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      undefinedPaths.push(...findUndefinedInObject(item, `${path}[${index}]`));
    });
  } else if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      undefinedPaths.push(...findUndefinedInObject(value, `${path}.${key}`));
    });
  }
  
  return undefinedPaths;
}

/**
 * Génère un numéro de commande unique
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    console.log("🔄 Génération du numéro de commande...");
    
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    
    let nextNumber = 1001;
    
    if (!querySnapshot.empty) {
      const lastOrder = querySnapshot.docs[0].data();
      const lastOrderNumber = lastOrder.orderNumber;
      
      const match = lastOrderNumber.match(/BD-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        nextNumber = lastNumber + 1;
      }
    }
    
    const newOrderNumber = `BD-${nextNumber}`;
    console.log("✅ Nouveau numéro généré:", newOrderNumber);
    return newOrderNumber;
    
  } catch (error) {
    console.error("⚠️ Erreur génération numéro:", error);
    const timestamp = Date.now().toString().slice(-4);
    return `BD-${timestamp}`;
  }
}

/**
 * ✅ CONVERSION SÉCURISÉE DES ARTICLES - ANTI-UNDEFINED
 */
export function convertCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  console.log("🔄 Conversion sécurisée des articles...");
  
  const orderItems = cartItems.map((item, index) => {
    console.log(`🔍 Traitement article ${index + 1}:`, {
      name: item.product.name,
      brandName: item.product.brandName,
      brandId: item.product.brandId,
      originalPrice: item.product.originalPrice,
      price: item.product.price,
      images: item.product.images?.length,
      imagePaths: item.product.imagePaths?.length
    });

    // ✅ GARANTIE ANTI-UNDEFINED - Valeurs par défaut strictes
    const productId = String(item.product.id || '');
    const productName = String(item.product.name || 'Produit sans nom');
    const productSlug = String(item.product.slug || '');
    
    // ✅ BrandName avec fallback multiple
    let brandName = '';
    if (item.product.brandName && item.product.brandName.trim()) {
      brandName = String(item.product.brandName.trim());
    } else if (item.product.brandId && item.product.brandId.trim()) {
      brandName = String(item.product.brandId.trim());
    }
    // Sinon reste une chaîne vide (jamais undefined)
    
    const sku = String(item.product.sku || productId);
    const price = Number(item.product.price) || 0;
    
    // ✅ OriginalPrice avec fallback intelligent
    let originalPrice = price; // Par défaut = prix actuel
    if (typeof item.product.originalPrice === 'number' && item.product.originalPrice > 0) {
      originalPrice = item.product.originalPrice;
    }
    
    const quantity = Number(item.quantity) || 1;
    const subtotal = price * quantity;
    
    // ✅ ImageUrl avec fallback sécurisé
    let imageUrl = '/api/placeholder/300/300'; // Valeur par défaut
    const allImages = [
      ...(Array.isArray(item.product.images) ? item.product.images : []),
      ...(Array.isArray(item.product.imagePaths) ? item.product.imagePaths : [])
    ];
    
    for (const img of allImages) {
      if (img && typeof img === 'string' && img.trim()) {
        const cleanImg = img.trim();
        if (cleanImg.startsWith('http') || cleanImg.startsWith('/')) {
          imageUrl = cleanImg;
          break;
        } else {
          imageUrl = `/${cleanImg}`;
          break;
        }
      }
    }
    
    // ✅ CRÉATION DE L'OBJET FINAL SÉCURISÉ
    const orderItem: OrderItem = {
      productId,
      productName,
      productSlug,
      brandName,      // ✅ String (peut être vide mais jamais undefined)
      sku,
      price,
      originalPrice,  // ✅ Number (jamais undefined)
      quantity,
      subtotal,
      imageUrl        // ✅ String (jamais undefined)
    };
    
    // ✅ VÉRIFICATION DE SÉCURITÉ FINALE
    Object.entries(orderItem).forEach(([key, value]) => {
      if (value === undefined) {
        console.error(`❌ ERREUR CRITIQUE: ${key} est undefined pour ${productName}`);
        throw new Error(`Valeur undefined détectée: ${key} pour le produit ${productName}`);
      }
    });
    
    console.log(`✅ Article ${index + 1} converti avec succès:`, {
      name: productName,
      brandName,
      originalPrice,
      imageUrl,
      hasUndefined: Object.values(orderItem).some(v => v === undefined)
    });
    
    return orderItem;
  });
  
  console.log("✅ Tous les articles convertis:", orderItems.length);
  return orderItems;
}

/**
 * Calcule les totaux de la commande
 */
export function calculateOrderTotals(
  orderItems: OrderItem[], 
  shippingCost: number
): OrderTotals {
  const subtotal = orderItems.reduce((total, item) => total + item.subtotal, 0);
  
  const savings = orderItems.reduce((total, item) => {
    if (item.originalPrice > item.price) {
      return total + ((item.originalPrice - item.price) * item.quantity);
    }
    return total;
  }, 0);
  
  const total = subtotal + shippingCost;
  
  return {
    subtotal,
    shippingCost,
    total,
    savings
  };
}

/**
 * ✅ CRÉATION DE COMMANDE SÉCURISÉE
 */
export async function createOrder(
  customerInfo: CustomerInfo,
  cartItems: CartItem[],
  shippingCost: number,
  notes?: string
): Promise<CreateOrderResult> {
  try {
    console.log("🚀 Début création commande sécurisée...");
    
    // Vérifications préliminaires
    if (!db) {
      throw new Error("Firebase non configuré");
    }
    
    if (!customerInfo?.firstName || !customerInfo?.lastName) {
      throw new Error("Informations client incomplètes");
    }
    
    if (!cartItems?.length) {
      throw new Error("Panier vide");
    }
    
    // Génération du numéro de commande
    const orderNumber = await generateOrderNumber();
    
    // ✅ CONVERSION SÉCURISÉE DES ARTICLES
    const orderItems = convertCartItemsToOrderItems(cartItems);
    
    // Calcul des totaux
    const totals = calculateOrderTotals(orderItems, shippingCost);
    
    // ✅ CONSTRUCTION DE L'OBJET COMMANDE SÉCURISÉ
    const now = new Date();
    
    const orderData = {
      orderNumber: String(orderNumber),
      status: "Commande Reçue" as OrderStatus,
      customer: {
        firstName: String(customerInfo.firstName || ''),
        lastName: String(customerInfo.lastName || ''),
        address: String(customerInfo.address || ''),
        city: String(customerInfo.city || ''),
        phone: String(customerInfo.phone || '')
      },
      items: orderItems, // Déjà sécurisés
      totals: totals,
      notes: String(notes || ''),
      trackingNumber: '' // String vide, jamais undefined
    };
    
    // ✅ NETTOYAGE ANTI-UNDEFINED
    const sanitizedData = sanitizeForFirestore(orderData);
    
    // ✅ VÉRIFICATION FINALE STRICTE
    const undefinedPaths = findUndefinedInObject(sanitizedData);
    if (undefinedPaths.length > 0) {
      console.error("❌ VALEURS UNDEFINED DÉTECTÉES:", undefinedPaths);
      throw new Error(`Données contenant des undefined: ${undefinedPaths.join(', ')}`);
    }
    
    console.log("✅ Aucun undefined détecté - Envoi à Firestore...");
    
    // Création des timestamps Firestore
    const createdAt = Timestamp.fromDate(now);
    const updatedAt = Timestamp.fromDate(now);
    
    const firestoreData = {
      ...(sanitizedData as Record<string, unknown>),
      createdAt,
      updatedAt
    };
    
    // Ajout du document
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, firestoreData);
    
    console.log("🎉 Commande créée avec succès:", docRef.id);
    
    // Création de l'objet de retour
    const completeOrder: Order = {
      id: docRef.id,
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    
    return {
      orderId: docRef.id,
      orderNumber,
      order: completeOrder
    };
    
  } catch (error) {
    console.error("❌ Erreur création commande:", error);
    
    if (isFirebaseError(error)) {
      switch (error.code) {
        case 'permission-denied':
          throw new Error("Permissions insuffisantes");
        case 'unavailable':
          throw new Error("Service temporairement indisponible");
        default:
          throw new Error(`Erreur Firebase: ${error.message}`);
      }
    }
    
    if (error instanceof Error) {
      if (error.message.includes('undefined')) {
        throw new Error("Erreur de données. Rechargez la page et réessayez.");
      }
      throw new Error(`Erreur: ${error.message}`);
    }
    
    throw new Error("Erreur inconnue");
  }
}

// Autres fonctions inchangées...
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return null;
    }
    
    const data = orderSnap.data();
    
    return {
      id: orderSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      ...(data.estimatedDeliveryDate && {
        estimatedDeliveryDate: data.estimatedDeliveryDate.toDate()
      }),
      ...(data.actualDeliveryDate && {
        actualDeliveryDate: data.actualDeliveryDate.toDate()
      })
    } as Order;
    
  } catch (error) {
    console.error("Erreur récupération commande:", error);
    return null;
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("orderNumber", "==", orderNumber));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const docData = querySnapshot.docs[0];
    const data = docData.data();
    
    return {
      id: docData.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      ...(data.estimatedDeliveryDate && {
        estimatedDeliveryDate: data.estimatedDeliveryDate.toDate()
      }),
      ...(data.actualDeliveryDate && {
        actualDeliveryDate: data.actualDeliveryDate.toDate()
      })
    } as Order;
    
  } catch (error) {
    console.error("Erreur récupération commande par numéro:", error);
    return null;
  }
}

export async function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus,
  trackingNumber?: string
): Promise<boolean> {
  try {
    const orderRef = doc(db, "orders", orderId);
    
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    switch (newStatus) {
      case "Commande Expédiée":
        if (trackingNumber) {
          updateData.trackingNumber = trackingNumber;
        }
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
        updateData.estimatedDeliveryDate = Timestamp.fromDate(estimatedDelivery);
        break;
        
      case "Commande Livrée":
        updateData.actualDeliveryDate = Timestamp.fromDate(new Date());
        break;
    }
    
    await updateDoc(orderRef, updateData);
    return true;
    
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    return false;
  }
}

export async function getRecentOrders(limitCount: number = 20): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      orderBy("createdAt", "desc"), 
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(docData => {
      const data = docData.data();
      return {
        id: docData.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        ...(data.estimatedDeliveryDate && {
          estimatedDeliveryDate: data.estimatedDeliveryDate.toDate()
        }),
        ...(data.actualDeliveryDate && {
          actualDeliveryDate: data.actualDeliveryDate.toDate()
        })
      } as Order;
    });
    
  } catch (error) {
    console.error("Erreur récupération commandes récentes:", error);
    return [];
  }
}