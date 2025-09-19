"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Types pour définir la structure simplifiée du menu
interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href: string;
  isSpecial?: boolean; // Pour les éléments spéciaux comme "PROMOTIONS"
  specialColor?: string; // Couleur spéciale pour les éléments spéciaux
  hasDropdown?: boolean; // Si l'élément a un menu déroulant
  subItems?: SubMenuItem[]; // Liste simple des sous-éléments
}

/**
 * Configuration des sous-catégories pour chaque section
 * Structure simplifiée : juste une liste de liens par catégorie
 */

// LISSAGES - Sous-catégories
const lissagesSubItems: SubMenuItem[] = [
  { label: "Lissage Brésilien", href: "/categories/lissages/lissage-bresilien" },
  { label: "Lissage au Tanin", href: "/categories/lissages/lissage-au-tanin" },
  { label: "Kits Mini Lissage", href: "/categories/lissages/kits-mini-lissage" },
  { label: "Botox Capillaire", href: "/categories/lissages/botox-capillaire" },
  { label: "Lisseurs", href: "/categories/lissages/lisseurs" },
  { label: "Pack Lissages", href: "/categories/lissages/pack-lissages" },
];

// SOINS CAPILLAIRES - Sous-catégories
const soinsCapillairesSubItems: SubMenuItem[] = [
  { label: "Shampoings", href: "/categories/soins-capillaires/shampoings" },
  { label: "Masques Réparateur", href: "/categories/soins-capillaires/masques" },
  { label: "Huiles & Sérums", href: "/categories/soins-capillaires/huiles-serums" },
  { label: "Sprays Protecteurs", href: "/categories/soins-capillaires/sprays-protecteurs" },
  { label: "Packs Soins Capillaires", href: "/categories/soins-capillaires/packs-soins" },
];

// COLORATION - Sous-catégories
const colorationSubItems: SubMenuItem[] = [
  { label: "Couleurs Naturelles", href: "/categories/coloration/couleurs-naturelles" },
  { label: "Couleurs Fashion", href: "/categories/coloration/couleurs-fashion" },
  { label: "Colorations Bio", href: "/categories/coloration/colorations-bio" },
  { label: "Colorations Temporaires", href: "/categories/coloration/temporaires" },
  { label: "Craies Colorantes", href: "/categories/coloration/craies" },
  { label: "Sprays Colorants", href: "/categories/coloration/sprays" },
  { label: "Poudres Décolorantes", href: "/categories/coloration/poudres-decolorantes" },
  { label: "Crèmes Décolorantes", href: "/categories/coloration/cremes-decolorantes" },
  { label: "Oxydants", href: "/categories/coloration/oxydants" },
];

// COSMÉTIQUE CORÉEN - Sous-catégories
const cosmetiqueCoreenSubItems: SubMenuItem[] = [
  { label: "Nettoyants", href: "/categories/cosmetique-coreen/nettoyants" },
  { label: "Essences & Toners", href: "/categories/cosmetique-coreen/essences" },
  { label: "Sérums", href: "/categories/cosmetique-coreen/serums" },
  { label: "Crèmes Hydratantes", href: "/categories/cosmetique-coreen/cremes" },
  { label: "Masques en Tissu", href: "/categories/cosmetique-coreen/masques-tissu" },
  { label: "Masques à l'Argile", href: "/categories/cosmetique-coreen/masques-argile" },
  { label: "Patches Hydrogel", href: "/categories/cosmetique-coreen/patches" },
  { label: "BB & CC Crèmes", href: "/categories/cosmetique-coreen/bb-cc-cremes" },
  { label: "Cushions", href: "/categories/cosmetique-coreen/cushions" },
  { label: "Rouges à Lèvres", href: "/categories/cosmetique-coreen/rouges-levres" },
];

// SOINS VISAGE - Sous-catégories
const soinsVisageSubItems: SubMenuItem[] = [
  { label: "Nettoyants Doux", href: "/categories/soins-visage/nettoyants-doux" },
  { label: "Exfoliants", href: "/categories/soins-visage/exfoliants" },
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
 * Structure simplifiée avec liste directe des sous-éléments
 */
const menuItems: MenuItem[] = [
  {
    label: "LISSAGES",
    href: "/categories/lissages",
    hasDropdown: true,
    subItems: lissagesSubItems,
  },
  {
    label: "SOINS CAPILLAIRES",
    href: "/categories/soins-capillaires",
    hasDropdown: true,
    subItems: soinsCapillairesSubItems,
  },
  {
    label: "COSMÉTIQUE CORÉEN",
    href: "/categories/cosmetique-coreen",
    hasDropdown: true,
    subItems: cosmetiqueCoreenSubItems,
  },
  {
    label: "SOINS VISAGE",
    href: "/categories/soins-visage",
    hasDropdown: true,
    subItems: soinsVisageSubItems,
  },
  {
    label: "COLORATION",
    href: "/categories/coloration",
    hasDropdown: true,
    subItems: colorationSubItems,
  },
  {
    label: "ACCESSOIRES",
    href: "/categories/accessoires",
    hasDropdown: true,
    subItems: accessoiresSubItems,
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
 * Composant MenuNavigation - Navigation principale avec menus déroulants simplifiés
 * 
 * VERSION RESPONSIVE :
 * - Caché complètement sur mobile (intégré dans le hamburger du Header)
 * - Visible uniquement sur desktop avec fonctionnalités complètes
 * 
 * Fonctionnalités Desktop :
 * - Navigation horizontale avec catégories principales CENTRÉES
 * - Menus déroulants simples au survol avec liste de sous-catégories
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
                    className={`px-3 py-3 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
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
                  className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 whitespace-nowrap hover:scale-105 shadow-md"
                  style={{ backgroundColor: item.specialColor }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Déroulant Simplifié - Visible uniquement sur desktop */}
      {isMenuVisible && activeItem && activeItem.hasDropdown && activeItem.subItems && (
        <div 
          className="hidden lg:block absolute left-0 right-0 bg-white mx-auto max-w-[1500px] shadow-xl border-t-4 border-rose-300 z-40"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-6">
            {/* Liste simple des sous-catégories en colonnes */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {activeItem.subItems.map((subItem, index) => (
                <Link
                  key={index}
                  href={subItem.href}
                  className="text-gray-900 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 block py-2 px-3 rounded-md text-[16px] font-medium"
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}