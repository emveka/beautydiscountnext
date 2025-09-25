// next.config.ts - Compatible Next.js 15 avec REGEX CORRIGÉE
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactive les source maps en production pour réduire la taille
  productionBrowserSourceMaps: false,
  
  // Compression GZIP/Brotli (activée par défaut mais explicite)
  compress: true,
  
  // Configuration des images optimisées
  images: {
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permet tous les domaines HTTPS - à restreindre en production
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      // Ajoutez ici vos domaines spécifiques pour plus de sécurité :
       {
         protocol: 'https',
         hostname: 'firebasestorage.googleapis.com',
      },
       {
        protocol: 'https',
         hostname: 'your-cdn-domain.com',
      },
    ],
    // Formats d'images optimisés (WebP en priorité, AVIF si supporté)
    formats: ['image/webp', 'image/avif'],
    // Tailles d'écrans pour le responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Tailles d'images pour les composants
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Durée de cache des images optimisées (7 jours)
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  // Configuration Webpack pour minification avancée
webpack: (config, { dev }) => {
  if (!dev) {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
            enforce: true,
            reuseExistingChunk: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };

    config.resolve.alias = {
      ...config.resolve.alias,
    };
  }

  return config;
},

  // ✅ SOLUTION CORRIGÉE : Redirections pour corriger les images
  async rewrites() {
    return [
      // ✅ REGEX CORRIGÉE POUR NEXT.JS
      {
        source: '/products/:filename*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(.*image.*)',
          },
        ],
        destination: '/images/products/:filename*',
      },
      // Alternative plus simple - intercepter les extensions d'images
      {
        source: '/products/:filename*.jpg',
        destination: '/images/products/:filename*.jpg',
      },
      {
        source: '/products/:filename*.jpeg',
        destination: '/images/products/:filename*.jpeg',
      },
      {
        source: '/products/:filename*.png',
        destination: '/images/products/:filename*.png',
      },
      {
        source: '/products/:filename*.webp',
        destination: '/images/products/:filename*.webp',
      },
      {
        source: '/products/:filename*.avif',
        destination: '/images/products/:filename*.avif',
      },
      {
        source: '/products/:filename*.gif',
        destination: '/images/products/:filename*.gif',
      },
      {
        source: '/products/:filename*.svg',
        destination: '/images/products/:filename*.svg',
      },
      
      // Proxy pour les images placeholder
      {
        source: '/api/placeholder/:size*',
        destination: 'https://via.placeholder.com/:size*',
      },
      {
        source: '/produit/:slug*',
        destination: '/products/:slug*',
      },
      {
        source: '/produits/:slug*',
        destination: '/products/:slug*',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/produit/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      },
      {
        source: '/produits/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      },
    ];
  },

  // Headers optimisés pour le cache et la sécurité
  async headers() {
    return [
      {
        // Appliquer à toutes les routes SAUF les assets
        source: '/((?!_next/static).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      {
        // Cache très long pour les assets Next.js
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache long pour les images
        source: '/(.*\\.(?:jpg|jpeg|png|webp|avif|gif|svg))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Headers spécifiques pour les images redirigées
        source: '/images/products/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=3600',
          },
        ],
      },
    ];
  },

  // Configuration du compilateur optimisée pour Next.js 15
  compiler: {
    // Supprime console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Fonctionnalités expérimentales pour l'optimisation
  experimental: {
    // Optimise les imports de packages
    optimizePackageImports: [
      '@/components', 
      '@/lib', 
      'lucide-react',
      'react',
      'react-dom'
    ],
  },
};

export default nextConfig;