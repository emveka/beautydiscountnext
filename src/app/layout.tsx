import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter } from 'next/font/google';
import './globals.css';

// Import des composants d'en-tête
import TopHeader from '@/components/TopHeader';
import Header from '@/components/Header';
import MenuNavigation from '@/components/MenuNavigation';
import Footer from '@/components/Footer';

// Import du wrapper client au lieu du provider direct
import CartProviderWrapper from '@/components/providers/CartProviderWrapper';

// ✅ OPTIMISATION GOOGLE TAG MANAGER
import GoogleTagManagerOptimized from '@/components/GoogleTagManagerOptimized';

// Configuration de la police Google Fonts OPTIMISÉE
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // ✅ OPTIMISATION FONT
  preload: true,
  fallback: ['system-ui', 'arial']
});

/**
 * Métadonnées de l'application
 * Optimisation SEO et réseaux sociaux
 */
export const metadata: Metadata = {
  // ✅ Configuration de base pour les URLs
  metadataBase: new URL('https://beautydiscount.ma'),
  
  title: {
    default: 'BeautyDiscount - Fournisseur #1 Beauté au Maroc',
    template: '%s | BeautyDiscount'
  },
  description: 'Découvrez la plus grande sélection de produits de beauté, cosmétiques et soins au Maroc. Prix discount garantis avec livraison rapide.',
  keywords: [
    'beauté',
    'cosmétiques',
    'soins',
    'maquillage',
    'parfums',
    'cheveux',
    'visage',
    'corps',
    'maroc',
    'casablanca',
    'discount',
    'prix réduits'
  ],
  authors: [{ name: 'BeautyDiscount' }],
  creator: 'BeautyDiscount',
  publisher: 'BeautyDiscount',
  
  // ✅ URL canonique par défaut
  alternates: {
    canonical: '/'
  },
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://beautydiscount.ma',
    siteName: 'BeautyDiscount',
    title: 'BeautyDiscount - Fournisseur #1 Beauté au Maroc',
    description: 'Découvrez la plus grande sélection de produits de beauté, cosmétiques et soins au Maroc.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BeautyDiscount - Beauty Store',
      }
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BeautyDiscount - Fournisseur #1 Beauté au Maroc',
    description: 'Découvrez la plus grande sélection de produits de beauté au Maroc.',
    images: ['/twitter-image.jpg'],
    creator: '@beautydiscount',
  },
  
  // Métadonnées de fraîcheur dans other
  other: {
    'og:updated_time': new Date().toISOString(),
    'article:modified_time': new Date().toISOString(),
  },
  
  // Configuration robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification des moteurs de recherche
  verification: {
    google: 'your-google-verification-code',
  },
  
  // Configuration du manifest
  manifest: '/manifest.json',
  
  // Icônes
  icons: {
    icon: '/Beautydiscount Favicon.png',
    shortcut: '/favicon-16x16.png',
  },
};

/**
 * Interface pour les props du RootLayout
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * RootLayout - Layout principal de l'application
 * Version optimisée pour performance Lighthouse
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* ✅ PRELOAD DES RESSOURCES CRITIQUES OPTIMISÉ */}
        <link rel="preload" href="/logos.png" as="image" type="image/png" />
        
        {/* ✅ DNS PREFETCH OPTIMISÉ */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* ✅ STRUCTURED DATA OPTIMISÉ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "BeautyDiscount",
              "description": "Fournisseur #1 de produits de beauté au Maroc",
              "url": "https://beautydiscount.ma",
              "telephone": "+212-771-515-771",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Votre adresse",
                "addressLocality": "Casablanca",
                "addressCountry": "MA"
              },
              "openingHours": "Mo-Sa 09:00-19:00",
              "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
              "currenciesAccepted": "MAD",
              "priceRange": "$$"
            })
          }}
        />
      </head>
      
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        {/* Skip to main content - Accessibilité */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-rose-300 text-black px-4 py-2 rounded-lg font-semibold z-50"
        >
          Aller au contenu principal
        </a>

        {/* CartProviderWrapper au lieu de CartProvider direct */}
        <CartProviderWrapper>
          {/* Structure principale de la page */}
          <div className="min-h-screen flex flex-col">
            
            {/* En-tête de l'application */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
              {/* Bandeau supérieur avec messages */}
              <TopHeader 
                messages={[
                  "BeautyDiscount - Vos meilleures marques à petit prix",
                  "Livraison rapide dans tout le Maroc",
                  "Commandez puis payez à la réception du colis"
                ]}
              />
              
              {/* Header principal avec logo et recherche */}
              <Header />
              
              {/* Navigation principale avec mega menus */}
              <MenuNavigation />
            </header>

            {/* Contenu principal */}
            <main 
              id="main-content"
              className="flex-1"
              role="main"
            >
              {children}
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </CartProviderWrapper>

        {/* ✅ GOOGLE TAG MANAGER OPTIMISÉ */}
        {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleTagManagerOptimized gtmId={process.env.NEXT_PUBLIC_GA_ID} />
        )}

        {/* ✅ VERCEL ANALYTICS OPTIMISÉ */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}