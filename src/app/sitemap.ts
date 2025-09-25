// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// Revalidation du sitemap toutes les 12h
export const revalidate = 43200 // 12h en secondes

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://beautydiscount.ma'

// -- Helpers Firestore --------------------------------------------------------

/**
 * Récupère les slugs des produits actifs
 */
async function getProductSlugs(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, 'products'))
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as { slug?: string; status?: string }
      // ⚠️ Ajuste selon ton type (ex: data.status === "active")
      if (data.slug && typeof data.slug === 'string') {
        return data.slug
      }
      return undefined
    })
    .filter((slug): slug is string => Boolean(slug))
}

/**
 * Récupère les slugs des catégories visibles
 */
async function getCategorySlugs(): Promise<string[]> {
  const snapshot = await getDocs(collection(db, 'categories'))
  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as { slug?: string; visible?: boolean }
      // ⚠️ Ajuste si tu as un champ visible/active
      if (data.slug && typeof data.slug === 'string') {
        return data.slug
      }
      return undefined
    })
    .filter((slug): slug is string => Boolean(slug))
}

// -- Types pratiques ----------------------------------------------------------
type Item = MetadataRoute.Sitemap[number]

// -- Sitemap generator --------------------------------------------------------
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/categories`,      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/promotions`,      lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/search`,          lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/livraison`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/conditions`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const [cats, products] = await Promise.all([getCategorySlugs(), getProductSlugs()])

  const categoryPages = cats.map<Item>((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  const productPages = products.map<Item>((slug) => ({
    url: `${BASE_URL}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
