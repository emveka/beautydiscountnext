// app/page.tsx
import { Metadata } from "next";
import BannerCarousel from '@/components/BannerCarousel';
import HomeSection from '@/components/server/HomeSection';
import React from 'react';

import ClientInstagram from "@/components/ClientInstagram";

// Métadonnées corrigées
export const metadata: Metadata = {
  // ✅ TITRE RACCOURCI avec mots-clés de la page (56 caractères)
  title: "BeautyDiscount - Lissages & Cosmétiques au Maroc",
  
  // ✅ DESCRIPTION avec mots-clés thématiques
  description: "Découvrez nos lissages, kits mini lissage, poudres décolorantes, masques capillaires et cosmétiques coréen à prix discount au Maroc. Livraison rapide.",
  
  // ✅ MOTS-CLÉS basés sur le contenu réel de la page
  keywords: "lissages, kits mini lissage, poudres décolorantes, masques capillaires, cosmétiques coréen, beauté, maroc, discount, kératine, soins capillaires",
  
  // URL canonique pour la page d'accueil
  alternates: {
    canonical: "https://beautydiscount.ma"
  },

  // ✅ OPEN GRAPH avec titre raccourci
  openGraph: {
    title: "BeautyDiscount - Lissages & Cosmétiques au Maroc",
    description: "Lissages, cosmétiques coréen et soins capillaires à prix discount au Maroc",
    url: "https://beautydiscount.ma",
    type: 'website',
    images: [
      {
        url: "https://beautydiscount.ma/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BeautyDiscount",
      }
    ],
  },

  // ✅ TWITTER CARD avec titre raccourci
  twitter: {
    card: 'summary_large_image',
    title: "BeautyDiscount - Lissages & Cosmétiques au Maroc",
    description: "Lissages et cosmétiques à prix discount au Maroc",
  },

  // Robots
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
};

const homeCarouselSlides = [
  {
    id: 1,
    title: "Banner Beauté 1",
    imageUrl: "/banners/BannerBeautydiscountPoudresdecolorantes.webp",
    imageAlt: "Promotion beauté 1",
    linkUrl: "/promotions"
  },
  {
    id: 2,
    title: "Banner Beauté 2", 
    imageUrl: "/banners/Banner4.webp",
    imageAlt: "Promotion beauté 2",
    linkUrl: "/nouveautes"
  },
  {
    id: 3,
    title: "Banner Beautilux", 
    imageUrl: "/banners/Banner3.webp",
    imageAlt: "Promotion beauté 3",
    linkUrl: "/nouveautes"
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* H1 principal pour SEO */}
      <h1 className="sr-only">
        BeautyDiscount - Lissages & Kératine & Cosmétiques au Maroc.
      </h1>

      {/* Hero Banner Carousel */}
      <section className="w-full">
        <BannerCarousel 
          slides={homeCarouselSlides}
          autoplayInterval={5000}
        />
      </section>

      {/* Sections produits avec H2 présents côté serveur */}
      <HomeSection
        categorySlug="lissages"
        title="Lissages"
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-white"
      />

      <HomeSection
        subCategorySlug="kits-mini-lissage"
        title="Kits Mini Lissage"
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-gray-50"
      />

      <HomeSection
        subCategorySlug="poudres-decolorantes"
        title="Poudres Décolorantes"
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-white"
      />

      <HomeSection
        subCategorySlug="masques-capillaires"
        title="Masques Capillaires Réparateurs"
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-gray-50"
      />

      <HomeSection
        categorySlug="cosmetique-coreen"
        title="Nos Cosmétiques Coréen"
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-gray-50"
      />

      {/* ✅ NOUVEAU : Section contenu textuel pour mots-clés thématiques */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              BeautyDiscount, votre spécialiste beauté au Maroc
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Lissages Professionnels</h3>
              <p>
                Découvrez notre gamme complète de <strong>lissages capillaires</strong> : lissage brésilien, 
                lissage japonais et lissage progressif. Nos <strong>traitements lissage</strong> transforment 
                vos cheveux pour un résultat lisse, brillant et durable. Produits professionnels pour 
                salon et usage domestique.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Soins Capillaires</h3>
              <p>
                Nos <strong>masques capillaires</strong> réparateurs nourrissent en profondeur. 
                <strong>Poudres décolorantes</strong> professionnelles pour éclaircir et préparer 
                la coloration. <strong>Kits mini lissage</strong> complets pour un traitement 
                à domicile parfait.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Cosmétiques Coréens</h3>
              <p>
                Authentiques <strong>cosmétiques coréens</strong> K-beauty pour le visage. 
                <strong>Skincare coréen</strong> avec essences, sérums et masques hydratants. 
                Rituels de <strong>beauté asiatique</strong> pour une peau parfaite et éclatante.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Marques de Qualité</h3>
              <p>
                Sélection de <strong>marques professionnelles</strong> reconnues. Produits 
                <strong>capillaires</strong> et <strong>cosmétiques</strong> de salon. 
                Qualité professionnelle à <strong>prix discount</strong> pour tous.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Livraison Maroc</h3>
              <p>
                <strong>Livraison rapide</strong> dans tout le <strong>Maroc</strong> : 
                Casablanca, Rabat, Marrakech, Fès. Paiement sécurisé et 
                <strong>service client</strong> dédié. Commandez en ligne facilement.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Conseils Beauté</h3>
              <p>
                Guides et <strong>conseils beauté</strong> pour choisir vos produits. 
                <strong>Tutoriels</strong> d&apos;application et <strong>astuces</strong> 
                de professionnels. Transformez votre routine beauté avec nos experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <ClientInstagram />
    </div>
  );
}