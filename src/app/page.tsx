// =================================================================
// 📱 MOBILE OPTIMIZED - app/page.tsx
// =================================================================

import BannerCarousel from '@/components/BannerCarousel';
import HomeSection from '@/components/HomeSection';
import InstagramGallery from '@/components/InstagramGallery';
import React from 'react';

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
      {/* ✅ H1 principal pour SEO */}
      <h1 className="sr-only">
        BeautyDiscount - Boutique produits Capillaires, Cosmétique et beauté au Maroc.
      </h1>

      {/* 📱 MOBILE: Hero Banner Carousel */}
      <section className="w-full">
        <BannerCarousel 
          slides={homeCarouselSlides}
          autoplayInterval={5000}
        />
      </section>

      {/* 📱 MOBILE: Sections produits optimisées avec alternance de couleurs */}
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

      {/* 📱 MOBILE: Instagram Gallery - 6 images sur toute la largeur */}
      <InstagramGallery />
    </div>
  );
}