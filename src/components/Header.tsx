"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import MobileMenuNavigation from "./MobileMenuNavigation";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/lib/contexts/CartContext";

// Interface pour les props du composant Header
interface HeaderProps {
  onSearch?: (query: string) => void; // Callback optionnel pour gérer la recherche côté parent
  className?: string; // Classes CSS supplémentaires
}

/**
 * Composant Header - En-tête principal avec Contact au-dessus du MenuNavigation
 * 
 * VERSION MOBILE :
 * - Header : Logo + Hamburger + Contact + Mon Panier
 * - Barre de recherche : Affichée sous le header en sticky
 * - Menu mobile : Slide de gauche à droite sous le header
 * 
 * VERSION DESKTOP :
 * - Ligne supérieure : Logo + Recherche + Contact + Panier
 * - MenuNavigation en dessous
 * 
 * ✅ NOUVEAU : Intégration du CartSidebar et compteur dynamique
 */
export default function Header({ onSearch, className = "" }: HeaderProps) {
  // États pour gérer la recherche et le menu mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isMobileContactMenuOpen, setIsMobileContactMenuOpen] = useState(false);

  // ✅ NOUVEAU : Utilisation du contexte panier
  const { getCartSummary, toggleCart } = useCart();
  const cartSummary = getCartSummary();

  /**
   * Fermer le menu mobile quand on clique en dehors
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen || isMobileContactMenuOpen) {
        const target = event.target as Element;
        
        // Fermer le menu de navigation mobile
        if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.hamburger-button')) {
          setIsMobileMenuOpen(false);
        }
        
        // Fermer le menu contact mobile
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

  /**
   * Gestionnaire de soumission du formulaire de recherche
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const query = (formData.get("q") as string)?.trim() || "";
    
    if (!query) return;
    
    // Redirection vers la page de recherche
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
    
    // Réinitialiser le champ de recherche
    setSearchQuery("");
  };

  /**
   * Toggle du menu mobile
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * ✅ NOUVEAU : Gestionnaire d'ouverture du panier
   */
  const handleCartClick = () => {
    toggleCart();
  };

  return (
    <>
      {/* Header principal avec contact au-dessus du menu */}
      <header className={`bg-black text-white shadow-lg ${className}`}>
        <div className="mx-auto py-4" style={{ maxWidth: '1700px', width: '100%' }}>
          
          {/* Layout Desktop - Caché sur mobile */}
          <div className="hidden lg:flex items-center justify-between">
            {/* Logo Desktop */}
            <Link 
              href="/" 
              className="shrink-0 flex items-center"
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
              className="flex-1 max-w-4xl relative mx-8"
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
                  className="w-full px-4 py-3 text-sm text-black bg-white rounded-l-lg border-none outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-gray-500"
                  aria-label="Champ de recherche"
                />
                <button
                  type="submit"
                  className="px-6 bg-rose-300 hover:bg-rose-400 text-white rounded-r-lg transition-colors duration-200 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black"
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
                <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group cursor-pointer">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="text-xs font-medium whitespace-nowrap">
                    Contact
                  </span>
                </div>

                {/* Menu déroulant Contact amélioré */}
                {isContactMenuOpen && (
                  <div className="absolute right-0 top-full w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden">
                    {/* En-tête du menu */}
                    <div className="px-4 pb-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contactez-nous</h3>
                      <p className="text-xs text-gray-500 mt-1">Nous sommes là pour vous aider</p>
                    </div>

                    <div className="py-2">
                      {/* Téléphone */}
                      <a
                        href="tel:+212771515771"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">Appelez-nous</div>
                          <div className="text-sm text-gray-600 font-medium">+212 771 515 771</div>
                          <div className="text-xs text-gray-500">Lun-Sam 9h-19h</div>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/212771515771"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:text-green-700 transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">WhatsApp</div>
                          <div className="text-sm text-gray-600 font-medium">+212 771 515 771</div>
                          <div className="text-xs text-gray-500">Réponse rapide garantie</div>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:contact@beautydiscount.ma"
                        className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 hover:text-rose-700 transition-all duration-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">Email</div>
                          <div className="text-sm text-gray-600 font-medium">contact@beautydiscount.ma</div>
                          <div className="text-xs text-gray-500">Réponse sous 24h</div>
                        </div>
                      </a>
                    </div>

                    {/* Footer du menu */}
                    <div className="px-4 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 text-center">
                        <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Service client disponible maintenant
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ NOUVEAU : Mon Panier Desktop avec compteur */}
              <button
                onClick={handleCartClick}
                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
                aria-label={`Voir mon panier (${cartSummary.itemsCount} article${cartSummary.itemsCount > 1 ? 's' : ''})`}
              >
                <div className="relative">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="group-hover:scale-110 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {/* Badge compteur */}
                  {cartSummary.itemsCount > 0 && (
                    <span className="absolute -right-2 -top-2 bg-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
                      {cartSummary.itemsCount > 99 ? '99+' : cartSummary.itemsCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">
                  Mon Panier
                </span>
              </button>
            </div>
          </div>

          {/* Layout Mobile - Visible uniquement sur mobile */}
          <div className="lg:hidden">
            {/* Ligne principale : Hamburger + Logo + Contact + Panier */}
            <div className="flex items-center justify-between">
              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="hamburger-button p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Ouvrir le menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="space-y-1.5">
                  <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </div>
              </button>

              {/* Logo Mobile - Centré */}
              <Link 
                href="/" 
                className="flex items-center"
                aria-label="Retour à l'accueil"
              >
                <Image
                  src="/logos.png"
                  alt="Logo Beauty Discount"
                  width={120}
                  height={30}
                  className="h-8 w-auto"
                  priority
                />
              </Link>

              {/* Actions Mobile : Contact + Panier */}
              <div className="flex items-center gap-2">
                {/* Contact Mobile avec menu déroulant */}
                <div className="relative">
                  <button
                    onClick={() => setIsMobileContactMenuOpen(!isMobileContactMenuOpen)}
                    className="mobile-contact-button p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Options de contact"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </button>

                  {/* Menu déroulant Contact Mobile */}
                  {isMobileContactMenuOpen && (
                    <div className="mobile-contact-menu absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* Téléphone */}
                      <a
                        href="tel:+212771515771"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Téléphone</div>
                          <div className="text-xs text-gray-500">+212 771 515 771</div>
                        </div>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href="https://wa.me/212771515771"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">WhatsApp</div>
                          <div className="text-xs text-gray-500">+212 771 515 771</div>
                        </div>
                      </a>

                      {/* Email */}
                      <a
                        href="mailto:contact@beautydiscount.ma"
                        onClick={() => setIsMobileContactMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-rose-600">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">Email</div>
                          <div className="text-xs text-gray-500">contact@beautydiscount.ma</div>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* ✅ NOUVEAU : Mon Panier Mobile avec compteur */}
                <button
                  onClick={handleCartClick}
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label={`Voir mon panier (${cartSummary.itemsCount} article${cartSummary.itemsCount > 1 ? 's' : ''})`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  {/* Badge du panier mobile */}
                  {cartSummary.itemsCount > 0 && (
                    <span className="absolute -right-1 -top-1 bg-rose-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] animate-pulse">
                      {cartSummary.itemsCount > 9 ? '9+' : cartSummary.itemsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Barre de recherche Mobile - Version ultra rétrécie */}
      <div className="lg:hidden bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-[1700px] px-4 py-1.5">
          <form
            onSubmit={handleSubmit}
            className="relative"
            role="search"
            aria-label="Rechercher des produits"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-8 pr-8 py-2 text-sm text-black bg-white rounded-full border border-gray-300 outline-none focus:ring-1 focus:ring-rose-300 focus:border-rose-300 placeholder:text-gray-400 shadow-sm"
                  aria-label="Champ de recherche"
                  style={{ fontSize: '16px' }}
                />
                <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2">
                  <svg
                    width="14"
                    height="14"
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
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Effacer la recherche"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                className="w-9 h-9 bg-rose-300 hover:bg-rose-400 text-white rounded-full transition-colors duration-200 flex items-center justify-center shadow-sm"
                aria-label="Lancer la recherche"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
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

      {/* Menu Mobile Slide - Overlay par-dessus le contenu */}
      <div className={`mobile-menu-container lg:hidden fixed left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ top: 'var(--header-height, 140px)' }}>
        <MobileMenuNavigation onLinkClick={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* ✅ NOUVEAU : CartSidebar */}
      <CartSidebar />
    </>
  );
}