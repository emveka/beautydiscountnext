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
  onLinkClick: () => void;
}

/**
 * 📱 MOBILE OPTIMIZED: Configuration des catégories compactées
 */
const lissagesMenu: MenuCategory[] = [
  {
    title: "Lissages",
    items: [
      { label: "Lissage Brésilien", href: "/categories/lissages/lissage-bresilien" },
      { label: "Lissage au Tanin", href: "/categories/lissages/lissage-au-tanin" },
      { label: "Kits Mini Lissage", href: "/categories/lissages/kits-mini-lissage" },
      { label: "Botox Capillaire", href: "/categories/lissages/botox-capillaire" },
      { label: "Lisseurs", href: "/categories/lissages/lisseurs" },
      { label: "Pack Lissages", href: "/categories/lissages/pack-lissages" },
    ]
  },
];

const soinsCapillairesMenu: MenuCategory[] = [
  {
    title: "Soins Capillaires",
    items: [
      { label: "Shampoings", href: "/categories/soins-capillaires/shampoings" },
      { label: "Masques", href: "/categories/soins-capillaires/masques" },
      { label: "Huiles et Sérums", href: "/categories/soins-capillaires/huiles-serums" },
      { label: "Sprays Protecteurs", href: "/categories/soins-capillaires/sprays-protecteurs" },
      { label: "Packs soins", href: "/categories/soins-capillaires/packs-soins" },
    ]
  },
];

const cosmetiqueCoreenMenu: MenuCategory[] = [
  {
    title: "Cosmétique Coréen",
    items: [
      { label: "Nettoyants", href: "/categories/cosmetique-coreen/nettoyants" },
      { label: "Essences & Toners", href: "/categories/cosmetique-coreen/essences" },
      { label: "Sérums", href: "/categories/cosmetique-coreen/serums" },
      { label: "Crèmes Hydratantes", href: "/categories/cosmetique-coreen/cremes" },
    ]
  },
];

/**
 * 📱 MOBILE: Configuration du menu compactée
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
 * 📱 MOBILE OPTIMIZED MobileMenuNavigation - Version ultra compacte
 * 
 * Améliorations mobile :
 * - Padding réduit de moitié partout
 * - Tailles de texte plus petites
 * - Espacement vertical réduit
 * - Icônes plus petites
 * - Hauteur d'éléments réduite
 */
export default function MobileMenuNavigation({ onLinkClick }: MobileMenuNavigationProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (itemLabel: string) => {
    setOpenAccordion(openAccordion === itemLabel ? null : itemLabel);
  };

  const handleLinkClick = () => {
    setOpenAccordion(null);
    onLinkClick();
  };

  return (
    <div className="py-1"> {/* 📱 RÉDUIT: py-2 → py-1 */}
      {/* 📱 MOBILE: Liste des catégories compactée */}
      <div className="space-y-0"> {/* 📱 RÉDUIT: space-y-1 → space-y-0 */}
        {mobileMenuItems.map((item) => (
          <div key={item.label} className="border-b border-gray-100 last:border-b-0">
            
            {/* 📱 MOBILE: Élément principal de menu compacté */}
            <div>
              {item.hasMegaMenu ? (
                // 📱 MOBILE: Accordéon compacté
                <button
                  onClick={() => toggleAccordion(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-rose-50 transition-colors" 
                  // 📱 RÉDUIT: px-4 py-4 → px-3 py-2.5
                >
                  <span 
                    className={`font-medium text-gray-800 text-sm ${  // 📱 AJOUTÉ: text-sm
                      item.isSpecial ? 'font-bold' : ''
                    }`}
                    style={item.isSpecial ? { color: item.specialColor } : {}}
                  >
                    {item.label}
                  </span>
                  
                  {/* 📱 MOBILE: Flèche d'accordéon plus petite */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${  // 📱 RÉDUIT: w-5 h-5 → w-4 h-4
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
                // 📱 MOBILE: Lien direct compacté
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`block px-3 py-2.5 font-medium transition-colors hover:bg-rose-50 text-sm ${  // 📱 RÉDUIT: px-4 py-4 → px-3 py-2.5, AJOUTÉ: text-sm
                    item.isSpecial 
                      ? 'font-bold' 
                      : 'text-gray-800'
                  }`}
                  style={item.isSpecial ? { color: item.specialColor } : {}}
                >
                  {item.label}
                  {item.isSpecial && (
                    <span 
                      className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full"  // 📱 RÉDUIT: ml-2 px-2 py-1 text-xs → ml-1.5 px-1.5 py-0.5 text-[10px]
                      style={{ backgroundColor: item.specialColor }}
                    >
                      HOT
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* 📱 MOBILE: Contenu de l'accordéon compacté */}
            {item.hasMegaMenu && openAccordion === item.label && (
              <div className="bg-gray-50 border-l-4 border-rose-300">
                <div className="py-1"> {/* 📱 RÉDUIT: py-2 → py-1 */}
                  
                  {/* 📱 MOBILE: Lien vers la catégorie principale compacté */}
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className="block px-6 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"  // 📱 RÉDUIT: px-8 py-2 text-sm → px-6 py-1.5 text-xs
                  >
                    Voir tous les {item.label}
                  </Link>
                  
                  {/* 📱 MOBILE: Sous-catégories compactées */}
                  {item.megaMenuCategories?.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mt-2"> {/* 📱 RÉDUIT: mt-3 → mt-2 */}
                      <h4 className="px-6 py-0.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"> {/* 📱 RÉDUIT: px-8 py-1 text-xs → px-6 py-0.5 text-[10px] */}
                        {category.title}
                      </h4>
                      <div className="space-y-0">
                        {category.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            onClick={handleLinkClick}
                            className="block px-6 py-1.5 text-xs text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"  // 📱 RÉDUIT: px-8 py-2 text-sm → px-6 py-1.5 text-xs
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

      {/* 📱 MOBILE: Section de fermeture compactée */}
      <div className="border-t border-gray-200 mt-2 pt-2"> {/* 📱 RÉDUIT: mt-4 pt-4 → mt-2 pt-2 */}
        <button
          onClick={handleLinkClick}
          className="w-full px-3 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors text-center"  // 📱 RÉDUIT: px-4 py-3 text-sm → px-3 py-2 text-xs
        >
          Fermer le menu
        </button>
      </div>
    </div>
  );
}