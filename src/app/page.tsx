// app/page.tsx
import { Metadata } from "next";
import BannerCarousel from '@/components/BannerCarousel';
import HomeSection from '@/components/server/HomeSection';
import InstagramGallery from '@/components/InstagramGallery';
import React from 'react';

// Métadonnées avec Canonical Tag
export const metadata: Metadata = {
  title: "BeautyDiscount - Boutique produits Capillaires, Cosmétique et beauté au Maroc",
  description: "Découvrez notre sélection de produits capillaires, cosmétiques et de beauté à prix discount au Maroc. Lissages, soins, maquillage et plus encore.",
  keywords: "beauté, cosmétiques, capillaire, lissage, maroc, discount, soins",
  
  // URL canonique pour la page d'accueil
  alternates: {
    canonical: "https://beautydiscount.ma"
  },

  // Open Graph
  openGraph: {
    title: "BeautyDiscount - Boutique beauté au Maroc",
    description: "Produits de beauté à prix discount au Maroc",
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

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: "BeautyDiscount - Boutique beauté au Maroc",
    description: "Produits de beauté à prix discount au Maroc",
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
        BeautyDiscount - Boutique produits Capillaires, Cosmétique et beauté au Maroc.
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

      {/* Instagram Gallery */}
      <InstagramGallery />
    </div>
  );
}