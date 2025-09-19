// components/client/SearchBar.tsx - COMPOSANT DE RECHERCHE SIMPLE
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean; // ✅ OPTIONNEL : Suggestions en temps réel
  maxSuggestions?: number;
}

// ✅ SUGGESTIONS SIMPLES PRÉDÉFINIES (optionnel)
const POPULAR_SEARCHES = [
  "Lissage brésilien",
  "Masque capillaire",
  "Poudre décolorante",
  "Cosmétique coréen",
  "Kit mini lissage",
  "Shampoing",
  "Soin visage",
  "Maquillage"
];

/**
 * 🔍 COMPOSANT SEARCHBAR SIMPLE & ÉLÉGANT
 * 
 * FONCTIONNALITÉS :
 * ✅ Recherche en temps réel avec suggestions optionnelles
 * ✅ Style cohérent avec le thème BeautyDiscount (rose/gris)
 * ✅ Mobile-first responsive
 * ✅ Navigation vers /search?q=terme
 * ✅ Gestion clavier (Enter, Escape, flèches)
 * ✅ Animation smooth et UX soignée
 * ✅ Intégration facile dans Header
 */
export default function SearchBar({
  placeholder = "Rechercher des produits...",
  className = "",
  showSuggestions = true,
  maxSuggestions = 5
}: SearchBarProps) {
  
  // 🎯 ÉTATS DU COMPOSANT
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  // 🎯 REFS POUR LA GESTION FOCUS
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  // 🎯 SUGGESTIONS FILTRÉES
  const suggestions = showSuggestions && query.trim().length >= 2
    ? POPULAR_SEARCHES
        .filter(search => 
          search.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, maxSuggestions)
    : [];

  // 🎯 FERMER LES SUGGESTIONS SI CLIC EXTÉRIEUR
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 GESTION DES TOUCHES CLAVIER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex]);
        } else if (query.trim()) {
          handleSearch(query);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // 🎯 FONCTION DE RECHERCHE
  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      return;
    }

    setIsLoading(true);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    try {
      // ✅ NAVIGATION VERS LA PAGE DE RÉSULTATS
      const searchUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`;
      router.push(searchUrl);
      
      // 📊 TRACKING OPTIONNEL (pour analytics)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search', {
          search_term: trimmedQuery,
          event_category: 'engagement'
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 GESTION INPUT CHANGE
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    // Ouvrir suggestions si query >= 2 caractères
    if (showSuggestions && value.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // 🎯 GESTION FOCUS INPUT
  const handleInputFocus = () => {
    if (showSuggestions && query.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // 🎯 SÉLECTION D'UNE SUGGESTION
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-md ${className}`}
    >
      {/* 🎯 CHAMP DE RECHERCHE PRINCIPAL */}
      <div className="relative">
        
        {/* Input de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`
            w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-3 sm:pr-4
            text-sm sm:text-base
            bg-white border border-gray-300 rounded-lg
            placeholder-gray-500 text-gray-900
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500
            transition-all duration-200
            ${isLoading ? 'bg-gray-50' : 'bg-white'}
          `}
          disabled={isLoading}
        />

        {/* Icône de recherche / Loading */}
        <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />
          ) : (
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>

        {/* Bouton Clear (si du texte) */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
            aria-label="Effacer la recherche"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* 🎯 DROPDOWN DES SUGGESTIONS */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          
          {/* En-tête suggestions */}
          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
            Suggestions populaires
          </div>

          {/* Liste des suggestions */}
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full text-left px-3 py-2 text-sm
                    hover:bg-rose-50 transition-colors
                    flex items-center gap-2
                    ${selectedIndex === index 
                      ? 'bg-rose-50 text-rose-700' 
                      : 'text-gray-700 hover:text-rose-600'
                    }
                  `}
                >
                  {/* Icône suggestion */}
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  {/* Texte avec highlighting */}
                  <span className="flex-1 truncate">
                    {suggestion}
                  </span>
                  
                  {/* Icône flèche */}
                  <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {/* Action principale si query différente des suggestions */}
          {query.trim() && !suggestions.includes(query.trim()) && (
            <>
              <div className="border-t border-gray-100"></div>
              <div className="py-1">
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher &quot;{query.trim()}&quot;
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 🎯 MESSAGE SI AUCUNE SUGGESTION */}
      {isOpen && showSuggestions && query.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Aucune suggestion trouvée
            <div className="mt-2">
              <button
                onClick={() => handleSearch(query)}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Rechercher &quot;{query.trim()}&quot;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎯 TYPES POUR TYPESCRIPT (si nécessaire)
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/* ✅ UTILISATION DANS HEADER :

import SearchBar from '@/components/client/SearchBar';

// Dans ton Header.tsx :
<SearchBar 
  placeholder="Rechercher des produits..." 
  className="hidden sm:block flex-1 max-w-md mx-4"
  showSuggestions={true}
  maxSuggestions={5}
/>

// Version mobile (dans menu hamburger ou séparé) :
<SearchBar 
  placeholder="Que cherchez-vous ?" 
  className="w-full"
  showSuggestions={false} // Plus simple sur mobile
/>

*/