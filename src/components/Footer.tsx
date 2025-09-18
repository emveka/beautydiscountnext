"use client";

import Link from 'next/link';
import Image from 'next/image';

/**
 * Composant Footer - Pied de page responsive 2 colonnes mobile
 * 
 * Configuration responsive :
 * - Mobile (0px+) : 2 colonnes (grid-cols-2)
 * - Medium (768px+) : 4 colonnes (md:grid-cols-4)
 * - Large (1024px+) : 4 colonnes maintenues (lg:grid-cols-4)
 */
export default function Footer() {
  return (
    <footer className="bg-black text-white">
      
      {/* Section principale du footer - GRILLE 2 COLONNES MOBILE */}
      <div className="mx-auto max-w-[1500px] px-3 sm:px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          
          {/* Colonne 1: À propos - Optimisée mobile */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logos.png"
                alt="OverClock Gaming"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Votre fournisseur gaming #1 au Maroc. Nous proposons les meilleures 
              configurations gaming, composants et périphériques des marques leaders.
            </p>
            
            {/* Réseaux sociaux - Plus compacts sur mobile */}
            <div className="flex space-x-3 sm:space-x-4">
              <Link 
                href="https://facebook.com/beautydiscount"
                className="text-gray-400 hover:text-rose-300 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </Link>
              
              <Link 
                href="https://instagram.com/beautydiscount"
                className="text-gray-400 hover:text-rose-300 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.35-.904c.456.559 1.146.933 1.918.933.77 0 1.462-.374 1.918-.933l1.35.904c-.757.933-1.908 1.529-3.205 1.529z"/>
                </svg>
              </Link>
              
              <Link 
                href="https://youtube.com/beautydiscount"
                className="text-gray-400 hover:text-rose-300 transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Colonne 2: Navigation - Texte plus petit mobile */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-bold text-rose-300">Navigation</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link href="/pc-gamers" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Lissages</Link></li>
              <li><Link href="/composants" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Soins Capillaires</Link></li>
              <li><Link href="/peripheriques" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Cosmétique Coréen</Link></li>
              <li><Link href="/setup-gamers" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Soins Visage</Link></li>
              <li><Link href="/consoles" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Coloration</Link></li>
              <li><Link href="/promotions" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Onglerie</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Service Client - Texte plus petit mobile */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-bold text-rose-300">Service</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li><Link href="/contact" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Contactez nous</Link></li>
              <li><Link href="/livraison" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Livraison et Retours</Link></li>
              <li><Link href="/retours" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Partenariat</Link></li>
              <li><Link href="/garantie" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Paiements</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-300 hover:text-rose-300 transition-colors text-xs sm:text-sm">Termes et Conditions</Link></li>
            </ul>
          </div>

          {/* Colonne 4: Contact Info - Optimisée mobile */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-lg font-bold text-rose-300">Contact</h3>
            <div className="space-y-2 sm:space-y-3">
              
              {/* Téléphone - Icônes plus petites mobile */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span className="text-gray-300 text-xs sm:text-sm">+212 7 71 51 57 71</span>
              </div>
              
              {/* Email - Texte tronqué sur mobile */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span className="text-gray-300 text-xs sm:text-sm break-all">
                  <span className="hidden sm:inline">contact@beautydiscount.ma</span>
                  <span className="sm:hidden">contact@beautydiscount.ma</span>
                </span>
              </div>
              
              {/* Adresse - Simplifié mobile */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-300 text-xs sm:text-sm">
                  <span className="hidden sm:block">Casablanca, Maroc</span>
                  <span className="sm:hidden">Casablanca, Maroc</span>
                </span>
              </div>
              
              {/* Horaires - Simplifié mobile */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="text-gray-300 text-xs sm:text-sm">
                  <span className="hidden sm:block">Lun-Sam: 9h-18h</span>
                  <span className="sm:hidden">9h-19h</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* Footer bottom - Responsive mobile */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col space-y-3 sm:space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            
            {/* Copyright */}
            <div className="text-xs sm:text-sm text-gray-400 text-center md:text-left">
              © 2024 Beautydiscount.ma | Tous droits réservés.
            </div>

            {/* Liens légaux - Wrap sur mobile */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6">
              <Link 
                href="/mentions-legales" 
                className="text-xs sm:text-sm text-gray-400 hover:text-rose-300 transition-colors whitespace-nowrap"
              >
                Mentions Légales
              </Link>
              <Link 
                href="/cgv" 
                className="text-xs sm:text-sm text-gray-400 hover:text-rose-300 transition-colors"
              >
                CGV
              </Link>
              <Link 
                href="/politique-confidentialite" 
                className="text-xs sm:text-sm text-gray-400 hover:text-rose-300 transition-colors whitespace-nowrap"
              >
                Confidentialité
              </Link>
              <Link 
                href="/cookies" 
                className="text-xs sm:text-sm text-gray-400 hover:text-rose-300 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>

          {/* Mention développeur */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Développé avec ❤️ pour la communauté beauty marocaine
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}