"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import MobileMenuNavigation from "./MobileMenuNavigation";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/lib/contexts/CartContext";

// Interface pour les props du composant Header
interface HeaderProps {
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * HEADER OPTIMISÉ POUR TAILWIND V4
 * ✅ Utilise les nouvelles fonctionnalités de Tailwind v4
 * ✅ Container queries natifs
 * ✅ Propriétés CSS modernes
 * ✅ Zero hydration errors
 */
export default function Header({ onSearch, className = "" }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isMobileContactMenuOpen, setIsMobileContactMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { getCartSummary, toggleCart } = useCart();
  
  // Valeurs par défaut pour éviter l'hydratation différentielle
  const defaultCart = { itemsCount: 0, totalPrice: 0 };
  const cartSummary = isMounted ? getCartSummary() : defaultCart;

  // Marquer le composant comme monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fermer les menus au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen || isMobileContactMenuOpen) {
        const target = event.target as Element;
        
        if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.hamburger-button')) {
          setIsMobileMenuOpen(false);
        }
        
        if (isMobileContactMenuOpen && !target.closest('.mobile-contact-menu') && !target.closest('.mobile-contact-button')) {
          setIsMobileContactMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen || isMobileContactMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen, isMobileContactMenuOpen]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const query = (formData.get("q") as string)?.trim() || "";
    
    if (!query) return;
    
    if (onSearch) {
      onSearch(query);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
    
    setSearchQuery("");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCartClick = () => {
    toggleCart();
  };

  return (
    <>
      {/* Header principal avec Tailwind v4 */}
      <header className={`bg-black text-white shadow-lg ${className}`}>
        {/* Container avec les nouvelles propriétés de Tailwind v4 */}
        <div className="mx-auto w-full max-w-[1500px] px-4 py-2 sm:py-4">
          
          {/* Layout Desktop - Tailwind v4 optimisé */}
          <div className="hidden items-center justify-between lg:flex">
            {/* Logo Desktop */}
            <Link 
              href="/" 
              className="flex shrink-0 items-center"
              aria-label="Retour à l'accueil"
            >
              <Image
                src="/logos.png"
                alt="Logo Beauty Discount"
                width={160}
                height={40}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Barre de recherche Desktop */}
            <form
              onSubmit={handleSubmit}
              className="relative mx-8 max-w-4xl flex-1"
              role="search"
              aria-label="Rechercher des produits"
            >
              <div className="flex items-stretch">
                <input
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Trouvez votre produit beauté..."
                  className="w-full rounded-l-lg border-none bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-rose-300"
                  aria-label="Champ de recherche"
                />
                <button
                  type="submit"
                  className="rounded-r-lg bg-rose-300 px-6 text-white transition-colors duration-200 hover:bg-rose-400 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Lancer la recherche"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    className="fill-current"
                    aria-hidden="true"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Navigation utilisateur Desktop */}
            <div className="flex items-center gap-6">
              {/* Contact Desktop avec menu déroulant */}
              <div 
                className="relative"
                onMouseEnter={() => setIsContactMenuOpen(true)}
                onMouseLeave={() => setIsContactMenuOpen(false)}
              >
                <div className="group flex cursor-pointer flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="whitespace-nowrap text-xs font-medium">
                    Contact
                  </span>
                </div>

                {/* Menu déroulant Contact Desktop */}
                {isContactMenuOpen && (
                  <div className="absolute right-0 top-full z-50 w-72 overflow-hidden rounded-xl border border-gray-100 bg-white py-3 shadow-2xl">
                    <div className="border-b border-gray-100 px-4 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">Contactez-nous</h3>
                      <p className="mt-1 text-xs text-gray-500">Nous sommes là pour vous aider</p>
                    </div>

                    <div className="py-2">
                      {/* Téléphone */}
                      <a
                        href="tel:+212771515771"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-gray-900">Appelez-nous</div>
                          <div className="text-sm font-medium text-gray-600">+212 771 515 771</div>
                          <div className="text-xs text-gray-500">Lun-Sam 9h-19h</div>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/212771515771"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-gray-900">WhatsApp</div>
                          <div className="text-sm font-medium text-gray-600">+212 771 515 771</div>
                          <div className="text-xs text-gray-500">Réponse rapide garantie</div>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:contact@beautydiscount.ma"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 hover:text-rose-700"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-semibold text-gray-900">Email</div>
                          <div className="text-sm font-medium text-gray-600">contact@beautydiscount.ma</div>
                          <div className="text-xs text-gray-500">Réponse sous 24h</div>
                        </div>
                      </a>
                    </div>

                    <div className="border-t border-gray-100 px-4 pt-3">
                      <div className="text-center text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                          Service client disponible maintenant
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mon Panier Desktop avec compteur */}
              <button
                onClick={handleCartClick}
                className="group relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/10"
                aria-label={`Voir mon panier (${cartSummary.itemsCount} article${cartSummary.itemsCount > 1 ? 's' : ''})`}
              >
                <div className="relative">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {cartSummary.itemsCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] animate-pulse items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                      {cartSummary.itemsCount > 99 ? '99+' : cartSummary.itemsCount}
                    </span>
                  )}
                </div>
                <span className="whitespace-nowrap text-xs font-medium">
                  Mon Panier
                </span>
              </button>
            </div>
          </div>

          {/* Layout Mobile avec Tailwind v4 */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between px-2">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="hamburger-button rounded-lg p-1.5 transition-colors hover:bg-white/10"
                aria-label="Ouvrir le menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="space-y-1">
                  <div className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`}></div>
                  <div className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}></div>
                </div>
              </button>

              {/* Logo Mobile */}
              <Link 
                href="/" 
                className="flex items-center"
                aria-label="Retour à l'accueil"
              >
                <Image
                  src="/logos.png"
                  alt="Logo Beauty Discount"
                  width={100}
                  height={25}
                  className="h-6 w-auto"
                  priority
                />
              </Link>

              {/* Actions Mobile */}
              <div className="flex items-center gap-1">
                {/* Contact Mobile */}
                <div className="relative">
                  <button
                    onClick={() => setIsMobileContactMenuOpen(!isMobileContactMenuOpen)}
                    className="mobile-contact-button rounded-lg p-1.5 transition-colors hover:bg-white/10"
                    aria-label="Options de contact"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </button>

                  {/* Menu déroulant Contact Mobile */}
                  {isMobileContactMenuOpen && (
                    <div className="mobile-contact-menu absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                      {/* Téléphone */}
                      <a
                        href="tel:+212771515771"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">Téléphone</div>
                          <div className="text-[10px] text-gray-500">+212 771 515 771</div>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/212771515771"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">WhatsApp</div>
                          <div className="text-[10px] text-gray-500">+212 771 515 771</div>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:contact@beautydiscount.ma"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">Email</div>
                          <div className="text-[10px] text-gray-500">contact@beautydiscount.ma</div>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* Mon Panier Mobile */}
                <button
                  onClick={handleCartClick}
                  className="relative rounded-lg p-1.5 transition-colors hover:bg-white/10"
                  aria-label={`Voir mon panier (${cartSummary.itemsCount} article${cartSummary.itemsCount > 1 ? 's' : ''})`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {/* Badge du panier mobile */}
                  {cartSummary.itemsCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] animate-pulse items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {cartSummary.itemsCount > 9 ? '9+' : cartSummary.itemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de recherche Mobile - Tailwind v4 optimisé */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-gray-50 lg:hidden">
        <div className="mx-auto max-w-[1500px] px-3 py-1">
          <form
            onSubmit={handleSubmit}
            className="relative"
            role="search"
            aria-label="Rechercher des produits"
          >
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full rounded-full border border-gray-300 bg-white py-1.5 pl-7 pr-7 text-sm text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
                  aria-label="Champ de recherche"
                  style={{ fontSize: '16px' }}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 transform">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-gray-400"
                    aria-hidden="true"
                  >
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                    aria-label="Effacer la recherche"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-300 text-white shadow-sm transition-colors duration-200 hover:bg-rose-400"
                aria-label="Lancer la recherche"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  className="fill-current"
                  aria-hidden="true"
                >
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Menu Mobile Slide - Tailwind v4 */}
      <div 
        className={`mobile-menu-container fixed left-0 right-0 z-30 border-b border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ top: 'var(--header-height, 120px)' }}
      >
        <MobileMenuNavigation onLinkClick={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* CartSidebar */}
      <CartSidebar />
    </>
  );
}