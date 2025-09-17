// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // Redirections pour compatibilité ou migration d'URLs
  async rewrites() {
    return [
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
        permanent: true, // 308
      },
      {
        source: '/produits/:slug*',
        destination: '/products/:slug*',
        permanent: true, // 308
      },
    ];
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Empêche l'intégration dans une iframe
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Empêche le sniffing MIME
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on', // Optimise la résolution DNS
          },
        ],
      },
      {
        // Cache long pour les images
        source: '/(.*\\.(?:jpg|jpeg|png|webp|avif|gif|svg))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 an
          },
        ],
      },
      {
        // Cache pour les assets JS/CSS
        source: '/(.*\\.(?:js|css|woff|woff2|ttf|otf))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configuration du compilateur
  compiler: {
    // Supprime console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Fonctionnalités expérimentales
  experimental: {
    // Optimise les imports de packages
    optimizePackageImports: [
      '@/components', 
      '@/lib', 
      'lucide-react'
    ],
  },
};

export default nextConfig;