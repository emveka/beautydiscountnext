// components/client/SearchBar.tsx - VERSION COMPLÈTE SANS ERREUR D'HYDRATATION
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSearchSuggestions } from '@/lib/firebase-search';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  variant?: 'desktop' | 'mobile';
}

interface Suggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
}

/**
 * SearchBar ultra-optimisé pour Lighthouse
 * SANS ERREURS D'HYDRATATION
 */
export default function SearchBar({
  placeholder = "Rechercher des produits...",
  className = "",
  showSuggestions = true,
  maxSuggestions = 6,
  variant = 'desktop'
}: SearchBarProps) {
  
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const router = useRouter();

  // Fonction optimisée avec cache local
  const fetchSmartSuggestions = useCallback(async (searchTerm: string): Promise<Suggestion[]> => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    try {
      const firebaseSuggestions = await getSearchSuggestions(searchTerm, maxSuggestions);
      
      return firebaseSuggestions.map(suggestion => ({
        text: suggestion,
        type: 'product' as const
      }));
      
    } catch (error) {
      console.error('Erreur suggestions:', error);
      return [];
    }
  }, [maxSuggestions]);

  // Debounce optimisé
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsLoading(true);
        try {
          const results = await fetchSmartSuggestions(searchTerm);
          setSuggestions(results);
          setIsOpen(results.length > 0);
        } catch (error) {
          console.error('Erreur de recherche:', error);
          setSuggestions([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  }, [fetchSmartSuggestions]);

  // Cleanup optimisé
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Gestion clavier optimisée
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
          handleSearch(suggestions[selectedIndex].text);
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

  // Fonction de recherche optimisée
  const handleSearch = async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) return;

    setIsLoading(true);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    try {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      
      // Tracking conditionnel (évite les erreurs)
      if (typeof window !== 'undefined' && 'gtag' in window && window.gtag) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (showSuggestions) {
      debouncedSearch(value);
    }
  };

  const handleInputFocus = () => {
    if (showSuggestions && query.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const searchQuery = (formData.get("q") as string)?.trim() || "";
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  // Composants inline (évite les imports SVG)
  const SearchIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" className="fill-current" aria-hidden="true">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );

  const SmallSearchIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400" aria-hidden="true">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );

  const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );

  const SmallLoadingSpinner = () => (
    <div className="w-3 h-3 border border-gray-400 border-t-rose-500 rounded-full animate-spin" />
  );

  // VERSION DESKTOP
  if (variant === 'desktop') {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <form 
          onSubmit={handleFormSubmit} 
          className="relative max-w-4xl flex-1" 
          role="search"
          aria-label="Rechercher des produits"
        >
          <div className="flex items-stretch">
            <input
              ref={inputRef}
              name="q"
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="w-full rounded-l-lg border-none bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-rose-300"
              aria-label="Champ de recherche"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-r-lg bg-rose-300 px-6 text-white transition-colors duration-200 hover:bg-rose-400 focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
              aria-label="Lancer la recherche"
            >
              {isLoading ? <LoadingSpinner /> : <SearchIcon />}
            </button>
          </div>
        </form>

        {/* Suggestions desktop */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span>Suggestions intelligentes</span>
              {isLoading && (
                <div className="w-3 h-3 border border-gray-300 border-t-rose-400 rounded-full animate-spin" />
              )}
            </div>

            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.text}-${index}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors flex items-center gap-2 ${
                      selectedIndex === index ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:text-rose-600'
                    }`}
                  >
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="flex-1 truncate">{suggestion.text}</span>
                  </button>
                </li>
              ))}
            </ul>

            {query.trim() && !suggestions.some(s => s.text.toLowerCase() === query.toLowerCase()) && (
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
      </div>
    );
  }

  // VERSION MOBILE
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        onSubmit={handleFormSubmit}
        className="relative"
        role="search"
        aria-label="Rechercher des produits"
      >
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              name="q"
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="w-full rounded-full border border-gray-300 bg-white py-1.5 pl-7 pr-7 text-sm text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-rose-300 focus:ring-1 focus:ring-rose-300"
              aria-label="Champ de recherche"
              style={{ fontSize: '16px' }}
              disabled={isLoading}
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 transform">
              {isLoading ? <SmallLoadingSpinner /> : <SmallSearchIcon />}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-300 text-white shadow-sm transition-colors duration-200 hover:bg-rose-400 disabled:opacity-50"
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

      {/* Suggestions mobile */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.text}-${index}`}>
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-rose-50 transition-colors flex items-center gap-2 ${
                    selectedIndex === index ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:text-rose-600'
                  }`}
                >
                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="flex-1 truncate text-xs">{suggestion.text}</span>
                </button>
              </li>
            ))}
          </ul>

          {query.trim() && !suggestions.some(s => s.text.toLowerCase() === query.toLowerCase()) && (
            <>
              <div className="border-t border-gray-100"></div>
              <div className="py-1">
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 font-medium"
                >
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher &quot;{query.trim()}&quot;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}