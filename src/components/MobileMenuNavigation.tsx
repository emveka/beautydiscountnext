"use client";

import Link from "next/link";
import { useState } from "react";

// Types pour définir la structure du menu mobile
interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuCategory {
  title: string;
  items: SubMenuItem[];
}

interface MobileMenuItem {
  label: string;
  href: string;
  isSpecial?: boolean;
  specialColor?: string;
  hasMegaMenu?: boolean;
  megaMenuCategories?: MenuCategory[];
}

interface MobileMenuNavigationProps {
  onLinkClick: () => void; // Callback pour fermer le menu quand on clique sur un lien
}

/**
 * Configuration des catégories - Identique au MenuNavigation principal
 * Simplifié pour correspondre à votre thème beauté
 */
const lissagesMenu: MenuCategory[] = [
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

const soinsCapillairesMenu: MenuCategory[] = [
  {
    title: "Soins Capillaires",
    items: [
      { label: "Shampoings", href: "/categories/soins-capillaires/shampoing-sec" },
      { label: "Masques", href: "/categories/soins-capillaires/shampoing-hydratant" },
      { label: "Huiles et Sérums", href: "/categories/soins-capillaires/shampoing-anti-chute" },
      { label: "Sprays Protecteurs", href: "/categories/soins-capillaires/shampoing-anti-chute" },
      { label: "Packs soins capillaires", href: "/categories/soins-capillaires/shampoing-anti-chute" },
      
    ]
  },
];

const cosmetiqueCoreenMenu: MenuCategory[] = [
  {
    title: "Cosmetique Coréen",
    items: [
      { label: "Nettoyants", href: "/categories/cosmetique-coreen/nettoyants" },
      { label: "Essences & Toners", href: "/categories/cosmetique-coreen/essences" },
      { label: "Sérums", href: "/categories/cosmetique-coreen/serums" },
      { label: "Crèmes Hydratantes", href: "/categories/cosmetique-coreen/cremes" },
    ]
  },
  
];

/**
 * Configuration du menu mobile - Version minimaliste
 * Utilise les couleurs de votre thème rose
 */
const mobileMenuItems: MobileMenuItem[] = [
  {
    label: "LISSAGES",
    href: "/categories/lissages",
    hasMegaMenu: true,
    megaMenuCategories: lissagesMenu,
  },
  {
    label: "SOINS CAPILLAIRES",
    href: "/categories/soins-capillaires",
    hasMegaMenu: true,
    megaMenuCategories: soinsCapillairesMenu,
  },
  {
    label: "ONGLERIE",
    href: "/categories/onglerie",
  },
  {
    label: "COSMÉTIQUE CORÉEN",
    href: "/categories/cosmetique-coreen",
    hasMegaMenu: true,
    megaMenuCategories: cosmetiqueCoreenMenu,
  },
  {
    label: "SOINS VISAGE",
    href: "/categories/soins-visage",
  },
  {
    label: "COLORATION",
    href: "/categories/coloration",
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
 * Composant MobileMenuNavigation - Version minimaliste et épurée
 * 
 * Fonctionnalités simplifiées :
 * - Design minimaliste avec couleurs du thème rose
 * - Accordéons simples pour les catégories avec sous-menus
 * - Animation fluide d'ouverture/fermeture
 * - Éléments spéciaux (promotions/nouveautés) mis en évidence
 * - Fermeture automatique lors du clic sur un lien
 */
export default function MobileMenuNavigation({ onLinkClick }: MobileMenuNavigationProps) {
  // État pour gérer quel accordéon est ouvert
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  /**
   * Toggle d'un accordéon
   * Si l'accordéon est déjà ouvert, on le ferme, sinon on l'ouvre
   */
  const toggleAccordion = (itemLabel: string) => {
    setOpenAccordion(openAccordion === itemLabel ? null : itemLabel);
  };

  /**
   * Gestion du clic sur un lien - ferme le menu
   */
  const handleLinkClick = () => {
    setOpenAccordion(null); // Ferme tous les accordéons
    onLinkClick(); // Ferme le menu principal
  };

  return (
    <div className="py-2">
      {/* Liste des catégories */}
      <div className="space-y-1">
        {mobileMenuItems.map((item) => (
          <div key={item.label} className="border-b border-gray-100 last:border-b-0">
            
            {/* Élément principal de menu */}
            <div>
              {item.hasMegaMenu ? (
                // Accordéon pour les éléments avec sous-menu
                <button
                  onClick={() => toggleAccordion(item.label)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-rose-50 transition-colors"
                >
                  <span 
                    className={`font-medium text-gray-800 ${
                      item.isSpecial ? 'font-bold' : ''
                    }`}
                    style={item.isSpecial ? { color: item.specialColor } : {}}
                  >
                    {item.label}
                  </span>
                  
                  {/* Flèche d'accordéon */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openAccordion === item.label ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                // Lien direct pour les éléments sans sous-menu
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-4 py-4 font-medium transition-colors hover:bg-rose-50 ${
                    item.isSpecial 
                      ? 'font-bold' 
                      : 'text-gray-800'
                  }`}
                  style={item.isSpecial ? { color: item.specialColor } : {}}
                >
                  {item.label}
                  {item.isSpecial && (
                    <span 
                      className="ml-2 px-2 py-1 text-xs font-bold text-white rounded-full"
                      style={{ backgroundColor: item.specialColor }}
                    >
                      HOT
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Contenu de l'accordéon - Sous-catégories */}
            {item.hasMegaMenu && openAccordion === item.label && (
              <div className="bg-gray-50 border-l-4 border-rose-300">
                <div className="py-2">
                  
                  {/* Lien vers la catégorie principale */}
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="block px-8 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    Voir tous les {item.label}
                  </Link>
                  
                  {/* Sous-catégories */}
                  {item.megaMenuCategories?.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mt-3">
                      <h4 className="px-8 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {category.title}
                      </h4>
                      <div className="space-y-0">
                        {category.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            onClick={handleLinkClick}
                            className="block px-8 py-2 text-sm text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}