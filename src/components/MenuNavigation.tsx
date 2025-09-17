"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// Types pour définir la structure du menu
interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuCategory {
  title: string;
  items: SubMenuItem[];
}

interface MenuItem {
  label: string;
  href: string;
  isSpecial?: boolean; // Pour les éléments spéciaux comme "PROMOTIONS"
  specialColor?: string; // Couleur spéciale pour les éléments spéciaux
  hasMegaMenu?: boolean; // Si l'élément a un mega menu
  megaMenuCategories?: MenuCategory[]; // Catégories du mega menu
}

/**
 * Configuration des catégories pour chaque section du mega menu
 */

// CATÉGORIE 1 - Menu avec sous-catégories
const categorie1Menu: MenuCategory[] = [
  {
    title: "Lissages",
    items: [
      { label: "Lissage Brésilien", href: "/categories/lissages/lissage-bresilien" },
      { label: "Lissage au Tanin", href: "/categories/lissages/lissage-au-tanin" },
      { label: "Kits Mini Lissage", href: "/categories/lissages/kits-mini-lissage" },
      { label: "Botox Capillaire", href: "/categories/lissages/botox-capillaire" },
      { label: "Lisseurs", href: "/categories/lissages/botox-capillaire" },
      { label: "Pack Lissages", href: "/categories/lissages/botox-capillaire" },
    ]
  },
  
];

// CATÉGORIE 2 - Menu avec sous-catégories
const categorie2Menu: MenuCategory[] = [
  {
    title: "Shampoings",
    items: [
      { label: "Shampoing Sec", href: "/categories/soins-capillaires/shampoing-sec" },
      { label: "Shampoing Hydratant", href: "/categories/soins-capillaires/shampoing-hydratant" },
      { label: "Shampoing Anti-Chute", href: "/categories/soins-capillaires/shampoing-anti-chute" },
    ]
  },
  {
    title: "Masques & Soins",
    items: [
      { label: "Masque Réparateur", href: "/categories/soins-capillaires/masque-reparateur" },
      { label: "Huiles Capillaires", href: "/categories/soins-capillaires/huiles" },
      { label: "Sérums", href: "/categories/soins-capillaires/serums" },
    ]
  },
];

// CATÉGORIE 3 - Menu avec sous-catégories
const categorie3Menu: MenuCategory[] = [
  {
    title: "Colorations Permanentes",
    items: [
      { label: "Couleurs Naturelles", href: "/categories/coloration/couleurs-naturelles" },
      { label: "Couleurs Fashion", href: "/categories/coloration/couleurs-fashion" },
      { label: "Colorations Bio", href: "/categories/coloration/colorations-bio" },
    ]
  },
  {
    title: "Colorations Temporaires",
    items: [
      { label: "Colorations Temporaires", href: "/categories/coloration/temporaires" },
      { label: "Craies Colorantes", href: "/categories/coloration/craies" },
      { label: "Sprays Colorants", href: "/categories/coloration/sprays" },
    ]
  },
  {
    title: "Décolorations",
    items: [
      { label: "Poudres Décolorantes", href: "/categories/coloration/poudres-decolorantes" },
      { label: "Crèmes Décolorantes", href: "/categories/coloration/cremes-decolorantes" },
      { label: "Oxydants", href: "/categories/coloration/oxydants" },
    ]
  }
];

// CATÉGORIE 4 - Menu avec sous-catégories
const categorie4Menu: MenuCategory[] = [
  {
    title: "Soins Visage K-Beauty",
    items: [
      { label: "Nettoyants", href: "/categories/cosmetique-coreen/nettoyants" },
      { label: "Essences & Toners", href: "/categories/cosmetique-coreen/essences" },
      { label: "Sérums", href: "/categories/cosmetique-coreen/serums" },
      { label: "Crèmes Hydratantes", href: "/categories/cosmetique-coreen/cremes" },
    ]
  },
  {
    title: "Masques K-Beauty",
    items: [
      { label: "Masques en Tissu", href: "/categories/cosmetique-coreen/masques-tissu" },
      { label: "Masques à l'Argile", href: "/categories/cosmetique-coreen/masques-argile" },
      { label: "Patches Hydrogel", href: "/categories/cosmetique-coreen/patches" },
    ]
  },
  {
    title: "Maquillage K-Beauty",
    items: [
      { label: "BB & CC Crèmes", href: "/categories/cosmetique-coreen/bb-cc-cremes" },
      { label: "Cushions", href: "/categories/cosmetique-coreen/cushions" },
      { label: "Rouges à Lèvres", href: "/categories/cosmetique-coreen/rouges-levres" },
    ]
  }
];

// CATÉGORIE 5 - Menu avec sous-catégories
const categorie5Menu: MenuCategory[] = [
  {
    title: "Nettoyage Visage",
    items: [
      { label: "Nettoyants Doux", href: "/categories/soins-visage/nettoyants-doux" },
      { label: "Exfoliants", href: "/categories/soins-visage/exfoliants" },
      { label: "Démaquillants", href: "/categories/soins-visage/demaquillants" },
    ]
  },
  {
    title: "Hydratation",
    items: [
      { label: "Crèmes Hydratantes", href: "/categories/soins-visage/cremes-hydratantes" },
      { label: "Sérums", href: "/categories/soins-visage/serums" },
      { label: "Huiles Visage", href: "/categories/soins-visage/huiles-visage" },
    ]
  },
  {
    title: "Anti-Âge",
    items: [
      { label: "Crèmes Anti-Rides", href: "/categories/soins-visage/cremes-anti-rides" },
      { label: "Contour des Yeux", href: "/categories/soins-visage/contour-yeux" },
      { label: "Masques Anti-Âge", href: "/categories/soins-visage/masques-anti-age" },
    ]
  }
];

/**
 * Configuration du menu principal
 * Définit tous les éléments de navigation avec leurs mega menus respectifs
 */
const menuItems: MenuItem[] = [
  {
    label: "LISSAGES",
    href: "/categories/lissages",
    hasMegaMenu: true,
    megaMenuCategories: categorie1Menu,
  },
  {
    label: "SOINS CAPILLAIRES",
    href: "/categories/soins-capillaires",
    hasMegaMenu: true,
    megaMenuCategories: categorie2Menu,
  },
  
  {
    label: "COSMÉTIQUE CORÉEN",
    href: "/categories/cosmetique-coreen",
    hasMegaMenu: true,
    megaMenuCategories: categorie4Menu,
  },
  {
    label: "SOINS VISAGE",
    href: "/categories/soins-visage",
    hasMegaMenu: true,
    megaMenuCategories: categorie5Menu,
  },
  {
    label: "COLORATION",
    href: "/categories/coloration",
    hasMegaMenu: true,
    megaMenuCategories: categorie3Menu,
  },
   {
    label: "ACCESSOIRES",
    href: "/categories/accessoires",
    hasMegaMenu: true,
    megaMenuCategories: categorie3Menu,
  },
  {
    label: "ONGLERIE",
    href: "/categories/onglerie",
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
 * Composant MenuNavigation - Navigation principale avec mega menus
 * 
 * VERSION RESPONSIVE :
 * - Caché complètement sur mobile (intégré dans le hamburger du Header)
 * - Visible uniquement sur desktop avec fonctionnalités complètes
 * 
 * Fonctionnalités Desktop :
 * - Navigation horizontale avec catégories principales CENTRÉES
 * - Mega menus au survol avec sous-catégories
 * - Éléments spéciaux (promotions, nouveautés) dans container séparé à droite
 * - Gestion intelligente des timeouts pour une UX fluide
 * - Fermeture automatique au scroll
 */
export default function MenuNavigation() {
  // États pour gérer l'affichage du mega menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Refs pour gérer les timeouts et éviter les fuites mémoire
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Effet pour fermer le mega menu lors du scroll
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
   * Délai de 200ms pour permettre de passer au mega menu
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
   * Gestion de l'entrée dans le mega menu
   * Annule la fermeture programmée
   */
  const handleMegaMenuEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsMenuVisible(true);
  };

  /**
   * Gestion de la sortie du mega menu
   * Fermeture immédiate
   */
  const handleMegaMenuLeave = () => {
    setIsMenuVisible(false);
    setActiveMenu(null);
    
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  // Trouver l'élément actif pour afficher son mega menu
  const activeItem = menuItems.find(item => item.label === activeMenu);

  return (
    <>
      {/* Navigation principale - Masquée sur mobile, visible sur desktop */}
      <nav className="bg-rose-300 border-b border-rose-100 relative hidden lg:block">
        <div className="mx-auto max-w-[1700px] px-4">
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
                  onMouseEnter={() => item.hasMegaMenu && handleMouseEnter(item.label)}
                >
                  <Link
                    href={item.href}
                    className={`px-3 py-3 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                      activeMenu === item.label && item.hasMegaMenu
                        ? 'bg-rose-400 text-black'
                        : 'text-black hover:bg-rose-400'
                    }`}
                  >
                    {item.label}
                    {item.hasMegaMenu && (
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

      {/* Mega Menu - Visible uniquement sur desktop */}
      {isMenuVisible && activeItem && activeItem.hasMegaMenu && (
        <div 
          className="hidden lg:block absolute left-0 right-0 bg-white mx-auto max-w-[1700px] shadow-2xl border-t-4 border-rose-300 z-40"
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className="mx-auto max-w-[1700px] px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeItem.megaMenuCategories?.map((category, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg border-b-2 border-rose-300 pb-2">
                    {category.title}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          href={subItem.href}
                          className="text-gray-700 hover:text-rose-600 hover:underline transition-colors duration-200 block py-1"
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}