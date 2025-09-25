"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Types pour définir la structure simplifiée du menu
interface SubMenuItem {
  label: string;
  href: string;
}

interface BrandItem {
  name: string;
  href: string;
  logo?: string; // Logo de la marque (optionnel)
}

interface MenuItem {
  label: string;
  href: string;
  isSpecial?: boolean; // Pour les éléments spéciaux comme "PROMOTIONS"
  specialColor?: string; // Couleur spéciale pour les éléments spéciaux
  hasDropdown?: boolean; // Si l'élément a un menu déroulant
  subItems?: SubMenuItem[]; // Liste simple des sous-éléments
  // Nouvelles propriétés pour les marques du menu déroulant
  brands?: BrandItem[]; // Liste des marques pour cette catégorie
}

/**
 * Configuration des marques pour chaque section
 */

// LISSAGES - Marques
const lissagesbrands: BrandItem[] = [
  { name: "Keratin Complex", href: "/marques/keratin-complex" },
  { name: "Brazilian Blowout", href: "/marques/brazilian-blowout" },
  { name: "Coppola", href: "/marques/coppola" },
  { name: "Cadiveu", href: "/marques/cadiveu" },
  { name: "Inoar", href: "/marques/inoar" },
  { name: "Honma Tokyo", href: "/marques/honma-tokyo" },
  { name: "Tahe", href: "/marques/tahe" },
  { name: "Brasil Cacau", href: "/marques/brasil-cacau" },
];

// SOINS CAPILLAIRES - Marques
const soinsCapillairesBrands: BrandItem[] = [
  { name: "Olaplex", href: "/marques/olaplex" },
  { name: "Redken", href: "/marques/redken" },
  { name: "L'Oréal Professionnel", href: "/marques/loreal-professionnel" },
  { name: "Kerastase", href: "/marques/kerastase" },
  { name: "Schwarzkopf", href: "/marques/schwarzkopf" },
  { name: "Matrix", href: "/marques/matrix" },
  { name: "Wella", href: "/marques/wella" },
  { name: "Moroccanoil", href: "/marques/moroccanoil" },
];

// COLORATION - Marques
const colorationBrands: BrandItem[] = [
  { name: "Goldwell", href: "/marques/goldwell" },
  { name: "Schwarzkopf IGORA", href: "/marques/schwarzkopf-igora" },
  { name: "L'Oréal INOA", href: "/marques/loreal-inoa" },
  { name: "Wella Color Touch", href: "/marques/wella-color-touch" },
  { name: "Matrix SoColor", href: "/marques/matrix-socolor" },
  { name: "Redken Chromatics", href: "/marques/redken-chromatics" },
  { name: "Pravana", href: "/marques/pravana" },
  { name: "Manic Panic", href: "/marques/manic-panic" },
];

// COSMÉTIQUE CORÉEN - Marques
const cosmetiqueCoreenBrands: BrandItem[] = [
  { name: "The Ordinary", href: "/marques/the-ordinary" },
  { name: "COSRX", href: "/marques/cosrx" },
  { name: "Innisfree", href: "/marques/innisfree" },
  { name: "Etude House", href: "/marques/etude-house" },
  { name: "Laneige", href: "/marques/laneige" },
  { name: "Dr. Jart+", href: "/marques/dr-jart" },
  { name: "Some By Mi", href: "/marques/some-by-mi" },
  { name: "Beauty of Joseon", href: "/marques/beauty-of-joseon" },
];

// SOINS VISAGE - Marques
const soinsVisageBrands: BrandItem[] = [
  { name: "La Roche-Posay", href: "/marques/la-roche-posay" },
  { name: "Cerave", href: "/marques/cerave" },
  { name: "Vichy", href: "/marques/vichy" },
  { name: "Avène", href: "/marques/avene" },
  { name: "Eucerin", href: "/marques/eucerin" },
  { name: "Nuxe", href: "/marques/nuxe" },
  { name: "Caudalie", href: "/marques/caudalie" },
  { name: "Bioderma", href: "/marques/bioderma" },
];

// ACCESSOIRES - Marques
const accessoiresBrands: BrandItem[] = [
  { name: "GHD", href: "/marques/ghd" },
  { name: "Babyliss", href: "/marques/babyliss" },
  { name: "Remington", href: "/marques/remington" },
  { name: "Dyson", href: "/marques/dyson" },
  { name: "Tangle Teezer", href: "/marques/tangle-teezer" },
  { name: "Denman", href: "/marques/denman" },
  { name: "Mason Pearson", href: "/marques/mason-pearson" },
  { name: "Cloud Nine", href: "/marques/cloud-nine" },
];

// LISSAGES - Sous-catégories
const lissagesSubItems: SubMenuItem[] = [
  { label: "Lissage Brésilien", href: "/categories/lissages/lissage-bresilien" },
  { label: "Lissage au Tanin", href: "/categories/lissages/lissage-au-tanin" },
  { label: "Kits Mini Lissage", href: "/categories/lissages/kits-mini-lissage" },
  { label: "Lisseurs", href: "/categories/lissages/lisseurs" },
  { label: "Pack Lissages", href: "/categories/lissages/pack-lissages" },
];

// SOINS CAPILLAIRES - Sous-catégories
const soinsCapillairesSubItems: SubMenuItem[] = [
  { label: "Shampoings", href: "/categories/soins-capillaires/shampoings" },
  { label: "Masques Capillaires", href: "/categories/soins-capillaires/masques-capillaires" },
  { label: "Huiles & Sérums", href: "/categories/soins-capillaires/huiles-serums" },
  { label: "Sprays Protecteurs", href: "/categories/soins-capillaires/sprays-protecteurs" },
  { label: "Botox Capillaire", href: "/categories/lissages/botox-capillaire" },
  { label: "Packs Soins Capillaires", href: "/categories/soins-capillaires/packs-soins" },
];

// COLORATION - Sous-catégories
const colorationSubItems: SubMenuItem[] = [
  { label: "Couleurs Naturelles", href: "/categories/coloration/couleurs-naturelles" },
  { label: "Colorations Bio", href: "/categories/coloration/colorations-bio" },
  { label: "Poudres Décolorantes", href: "/categories/coloration/poudres-decolorantes" },
  { label: "Crèmes Décolorantes", href: "/categories/coloration/cremes-decolorantes" },
  { label: "Oxydants", href: "/categories/coloration/oxydants" },
];

// COSMÉTIQUE CORÉEN - Sous-catégories
const cosmetiqueCoreenSubItems: SubMenuItem[] = [
  { label: "Nettoyants", href: "/categories/cosmetique-coreen/nettoyants" },
  { label: "Essences & Toners", href: "/categories/cosmetique-coreen/essences" },
  { label: "Sérums", href: "/categories/cosmetique-coreen/serums" },
  { label: "Masques capillaires", href: "/categories/cosmetique-coreen/masque-capillaires" },
  { label: "BB & CC Crèmes", href: "/categories/cosmetique-coreen/bb-cc-cremes" },

];

// SOINS VISAGE - Sous-catégories
const soinsVisageSubItems: SubMenuItem[] = [
  { label: "Nettoyants Doux", href: "/categories/soins-visage/nettoyants-doux" },
  { label: "Démaquillants", href: "/categories/soins-visage/demaquillants" },
  { label: "Crèmes Hydratantes", href: "/categories/soins-visage/cremes-hydratantes" },
  { label: "Sérums", href: "/categories/soins-visage/serums" },
  { label: "Huiles Visage", href: "/categories/soins-visage/huiles-visage" },
  { label: "Crèmes Anti-Rides", href: "/categories/soins-visage/cremes-anti-rides" },
  { label: "Contour des Yeux", href: "/categories/soins-visage/contour-yeux" },
  { label: "Masques Anti-Âge", href: "/categories/soins-visage/masques-anti-age" },
];

// ACCESSOIRES - Sous-catégories
const accessoiresSubItems: SubMenuItem[] = [
  { label: "Brosses et Peignes", href: "/categories/accessoires/brosses-peignes" },
  { label: "Élastiques et Pinces", href: "/categories/accessoires/elastiques-pinces" },
  { label: "Sèche-cheveux", href: "/categories/accessoires/seche-cheveux" },
  { label: "Fers à lisser", href: "/categories/accessoires/fers-lisser" },
  { label: "Fers à boucler", href: "/categories/accessoires/fers-boucler" },
];

/**
 * Configuration du menu principal
 * Structure simplifiée avec liste directe des sous-éléments et marques pour les menus déroulants
 */
const menuItems: MenuItem[] = [
  {
    label: "LISSAGES",
    href: "/categories/lissages",
    hasDropdown: true,
    subItems: lissagesSubItems,
    brands: lissagesbrands,
  },
  {
    label: "SOINS CAPILLAIRES",
    href: "/categories/soins-capillaires",
    hasDropdown: true,
    subItems: soinsCapillairesSubItems,
    brands: soinsCapillairesBrands,
  },
  {
    label: "COSMÉTIQUE CORÉEN",
    href: "/categories/cosmetique-coreen",
    hasDropdown: true,
    subItems: cosmetiqueCoreenSubItems,
    brands: cosmetiqueCoreenBrands,
  },
  {
    label: "SOINS VISAGE",
    href: "/categories/soins-visage",
    hasDropdown: true,
    subItems: soinsVisageSubItems,
    brands: soinsVisageBrands,
  },
  {
    label: "COLORATION",
    href: "/categories/coloration",
    hasDropdown: true,
    subItems: colorationSubItems,
    brands: colorationBrands,
  },
  {
    label: "ACCESSOIRES",
    href: "/categories/accessoires",
    hasDropdown: true,
    subItems: accessoiresSubItems,
    brands: accessoiresBrands,
  },
  {
    label: "ONGLERIE",
    href: "/categories/onglerie",
    // Pas de sous-catégories
  },
  {
    label: "NOUVEAUTÉS",
    href: "/nouveautes",
    isSpecial: true,
    specialColor: "#ff6b6b",
  },
  {
    label: "PROMOTIONS",
    href: "/promotions",
    isSpecial: true,
    specialColor: "#e74c3c",
  },
];

/**
 * Composant MenuNavigation - Navigation principale avec menus déroulants et marques
 * 
 * VERSION RESPONSIVE :
 * - Caché complètement sur mobile (intégré dans le hamburger du Header)
 * - Visible uniquement sur desktop avec fonctionnalités complètes
 * 
 * Fonctionnalités Desktop :
 * - Navigation horizontale avec catégories principales CENTRÉES
 * - Menus déroulants avec structure : 2 colonnes catégories + 2 colonnes marques
 * - Éléments spéciaux (promotions, nouveautés) dans container séparé à droite
 * - Gestion intelligente des timeouts pour une UX fluide
 * - Fermeture automatique au scroll
 */
export default function MenuNavigation() {
  // États pour gérer l'affichage du menu déroulant
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Refs pour gérer les timeouts et éviter les fuites mémoire
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Effet pour fermer le menu déroulant lors du scroll
   * Améliore l'UX en évitant que le menu reste ouvert pendant la navigation
   */
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuVisible) {
        setIsMenuVisible(false);
        setActiveMenu(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuVisible]);

  /**
   * Nettoyage des timeouts pour éviter les fuites mémoire
   */
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  /**
   * Gestion de l'entrée de la souris sur un élément de menu
   * Délai de 150ms pour éviter l'ouverture accidentelle
   */
  const handleMouseEnter = (itemLabel: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(itemLabel);
      setIsMenuVisible(true);
    }, 150);
  };

  /**
   * Gestion de la sortie de la souris du menu principal
   * Délai de 200ms pour permettre de passer au menu déroulant
   */
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    leaveTimeoutRef.current = setTimeout(() => {
      setIsMenuVisible(false);
      setActiveMenu(null);
    }, 200);
  };

  /**
   * Gestion de l'entrée dans le menu déroulant
   * Annule la fermeture programmée
   */
  const handleDropdownEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsMenuVisible(true);
  };

  /**
   * Gestion de la sortie du menu déroulant
   * Fermeture immédiate
   */
  const handleDropdownLeave = () => {
    setIsMenuVisible(false);
    setActiveMenu(null);
    
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Trouver l'élément actif pour afficher son menu déroulant
  const activeItem = menuItems.find(item => item.label === activeMenu);

  return (
    <>
      {/* Navigation principale - Masquée sur mobile, visible sur desktop */}
      <nav className="bg-rose-300 border-b border-rose-100 relative hidden lg:block">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center justify-between">
            
            {/* Menus principaux répartis sur la largeur disponible */}
            <div 
              className="flex items-center justify-between flex-1 mr-6"
              onMouseLeave={handleMouseLeave}
            >
              {menuItems.filter(item => !item.isSpecial).map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.label)}
                >
                  <Link
                    href={item.href}
                    className={`px-3 py-1.5 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                      activeMenu === item.label && item.hasDropdown
                        ? 'bg-rose-400 text-black'
                        : 'text-black hover:bg-rose-400'
                    }`}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <svg 
                        className="w-4 h-4 ml-1" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                  </Link>
                </div>
              ))}
            </div>

            {/* Éléments spéciaux à droite */}
            <div className="flex items-center space-x-3">
              {menuItems.filter(item => item.isSpecial).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-6 py-1.5 text-sm font-bold text-white transition-all duration-200 whitespace-nowrap hover:scale-105 shadow-md"
                  style={{ backgroundColor: item.specialColor }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Déroulant avec Marques - Structure 4 colonnes (2 catégories + 2 marques) */}
      {isMenuVisible && activeItem && activeItem.hasDropdown && activeItem.subItems && (
        <div 
          className="hidden lg:block absolute left-0 right-0 bg-white mx-auto max-w-[1500px] shadow-xl border-t-4 border-rose-300 z-40"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <div className="mx-auto max-w-[1500px] px-6 py-8">
            
            {/* Structure en 4 colonnes : 2 pour catégories + 2 pour marques */}
            <div className="grid grid-cols-4 gap-8">
              
              {/* COLONNE 1 : Première moitié des catégories */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-rose-200 pb-2">
                  {activeItem.label}
                </h3>
                {activeItem.subItems.slice(0, Math.ceil(activeItem.subItems.length / 2)).map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className="text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 block py-2 px-3 rounded-md text-sm font-medium hover:translate-x-1"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>

              {/* COLONNE 2 : Deuxième moitié des catégories */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-transparent mb-4 border-b border-transparent pb-2">
                  &nbsp;
                </h3>
                {activeItem.subItems.slice(Math.ceil(activeItem.subItems.length / 2)).map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className="text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 block py-2 px-3 rounded-md text-sm font-medium hover:translate-x-1"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>

              {/* COLONNE 3 : Première moitié des marques */}
              {activeItem.brands && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-rose-200 pb-2">
                    Par Marques
                  </h3>
                  {activeItem.brands.slice(0, Math.ceil(activeItem.brands.length / 2)).map((brand, index) => (
                    <Link
                      key={index}
                      href={brand.href}
                      className="text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 block py-2 px-3 rounded-md text-sm font-medium hover:translate-x-1 border-l-2 border-transparent hover:border-rose-400"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* COLONNE 4 : Deuxième moitié des marques */}
              {activeItem.brands && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-transparent mb-4 border-b border-transparent pb-2">
                    &nbsp;
                  </h3>
                  {activeItem.brands.slice(Math.ceil(activeItem.brands.length / 2)).map((brand, index) => (
                    <Link
                      key={index}
                      href={brand.href}
                      className="text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 block py-2 px-3 rounded-md text-sm font-medium hover:translate-x-1 border-l-2 border-transparent hover:border-rose-400"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}