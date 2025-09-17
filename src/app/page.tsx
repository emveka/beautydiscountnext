// =================================================================
// 📱 MOBILE OPTIMIZED - app/page.tsx
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

      {/* 📱 MOBILE: Section Newsletter optimisée */}
      <section className="py-8 sm:py-16 bg-gradient-to-br from-rose-400 via-rose-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-3 sm:px-4">
          {/* 📱 MOBILE: Titre responsive */}
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
            <span className="block sm:hidden">Nos nouveautés</span>
            <span className="hidden sm:block">Restez informé de nos nouveautés</span>
          </h2>
          
          {/* 📱 MOBILE: Description adaptée */}
          <p className="text-pink-100 mb-6 sm:mb-8 text-sm sm:text-lg">
            <span className="block sm:hidden">Offres exclusives par email</span>
            <span className="hidden sm:block">Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives</span>
          </p>
          
          {/* 📱 MOBILE: Formulaire newsletter responsive */}
          <form 
            onSubmit={handleNewsletterSubmit} 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              required
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg border-0 focus:ring-2 sm:focus:ring-4 focus:ring-pink-300 focus:outline-none text-gray-800 text-sm sm:text-base"
            />
            <button 
              type="submit"
              className="bg-white text-rose-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              <span className="block sm:hidden">S&apos;inscrire</span>
              <span className="hidden sm:block">S&apos;inscrire</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}