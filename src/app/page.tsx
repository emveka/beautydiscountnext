// =================================================================
// 1. CORRECTION PAGE D'ACCUEIL - app/page.tsx
// =================================================================
'use client';

import BannerCarousel from '@/components/BannerCarousel';
import HomeSection from '@/components/HomeSection';
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
    imageUrl: "/banners/longevity-care-fr.webp",
    imageAlt: "Promotion beauté 2",
    linkUrl: "/nouveautes"
  },
];

export default function HomePage() {
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    console.log('Email soumis:', email);
    alert('Merci pour votre inscription !');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ CORRECTION : Ajouter H1 principal (masqué visuellement mais présent pour SEO) */}
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

      {/* ✅ Les HomeSection auront maintenant des H2 automatiques */}
      <HomeSection
        categorySlug="lissages"
        title="Produits de Lissage Professionnel" // ✅ H2 explicite
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-white"
      />

      <HomeSection
        subCategorySlug="kits-mini-lissage"
        title="Kits Mini Lissage" // ✅ H2 explicite
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-gray-50"
      />

      <HomeSection
        subCategorySlug="poudres-decolorantes"
        title="Poudres Décolorantes" // ✅ H2 explicite
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-white"
      />

      <HomeSection
        subCategorySlug="masques-capillaires"
        title="Masques Capillaires Réparateurs" // ✅ H2 explicite
        maxProducts={6}
        showViewMore={true}
        containerClass="bg-gray-50"
      />

      {/* ✅ Section Newsletter avec H2 */}
      <section className="py-16 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Restez informé de nos nouveautés
          </h2>
          <p className="text-pink-100 mb-8 text-lg">
            Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              required
              className="flex-1 px-6 py-4 rounded-lg border-0 focus:ring-4 focus:ring-pink-300 focus:outline-none text-gray-800"
            />
            <button 
              type="submit"
              className="bg-white text-rose-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}