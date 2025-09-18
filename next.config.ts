// next.config.ts - Compatible Next.js 15
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Désactive les source maps en production pour réduire la taille
  productionBrowserSourceMaps: false,
  
  // ✅ Compression GZIP/Brotli (activée par défaut mais explicite)
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

  // ✅ Configuration Webpack pour minification avancée
  webpack: (config, { dev, isServer }) => {
    // Seulement en production
    if (!dev) {
      // Optimisation des chunks pour réduire la taille
      config.optimization = {
        ...config.optimization,
        minimize: true, // Next.js 15 utilise SWC par défaut
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000, // Limite la taille des chunks à 200KB
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              enforce: true,
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

      // Optimisation pour réduire la taille du bundle
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    return config;
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

  // ✅ Headers optimisés pour le cache et la sécurité
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
        // ✅ Cache très long pour les assets Next.js (déjà minifiés)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 an
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

  // ✅ Configuration du compilateur optimisée pour Next.js 15
  compiler: {
    // Supprime console.log en production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ✅ Fonctionnalités expérimentales pour l'optimisation (corrigées pour Next.js 15)
  experimental: {
    // Optimise les imports de packages
    optimizePackageImports: [
      '@/components', 
      '@/lib', 
      'lucide-react',
      'react',
      'react-dom'
    ],
    // Supprimé: esmExternals (cause des avertissements dans Next.js 15)
  },

  // ✅ Métadonnées de base pour éviter les avertissements
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;