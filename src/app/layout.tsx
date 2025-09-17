import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import des composants d'en-tête
import TopHeader from '@/components/TopHeader';
import Header from '@/components/Header';
import MenuNavigation from '@/components/MenuNavigation';
import Footer from '@/components/Footer';

// ✅ CORRIGÉ : Import du wrapper client au lieu du provider direct
import CartProviderWrapper from '@/components/providers/CartProviderWrapper';

// Configuration de la police Google Fonts
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

/**
 * Métadonnées de l'application
 * Optimisation SEO et réseaux sociaux
 */
export const metadata: Metadata = {
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
 * 
 * ✅ CORRIGÉ : Utilisation du wrapper client pour éviter l'erreur "client-only"
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr" className={`${inter.variable} scroll-smooth`}>
      <head>
        {/* Preload des ressources critiques */}
        <link rel="preload" href="/logos.png" as="image" />
        
        {/* DNS Prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Structured Data - Organisation */}
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

        {/* ✅ CORRIGÉ : CartProviderWrapper au lieu de CartProvider direct */}
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

        {/* Scripts d'analytics et de performance */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
            
            {/* Facebook Pixel (optionnel) */}
            {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
                    fbq('track', 'PageView');
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}