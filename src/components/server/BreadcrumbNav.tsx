// components/server/BreadcrumbNav.tsx
import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

/**
 * Composant BreadcrumbNav - Server Component
 * Navigation en fil d'Ariane avec support Schema.org et responsive mobile
 */
export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className="flex items-center text-xs sm:text-sm overflow-hidden"
    >
      {/* Version Desktop - Breadcrumb complet */}
      <ol className="hidden sm:flex items-center space-x-2 min-w-0 flex-nowrap">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center min-w-0">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            
            {index === items.length - 1 ? (
              <span 
                className="text-gray-900 font-medium" 
                aria-current="page"
                title={item.name}
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title={item.name}
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>

      {/* Version Mobile - Seulement page précédente > page actuelle */}
      <ol className="flex sm:hidden items-center space-x-1 min-w-0 flex-nowrap">
        {items.length > 1 && (
          <>
            {/* Page précédente */}
            <li className="flex items-center min-w-0">
              <Link
                href={items[items.length - 2].href}
                className="text-gray-500 hover:text-gray-700 transition-colors truncate max-w-[140px]"
                title={items[items.length - 2].name}
              >
                {items[items.length - 2].name}
              </Link>
            </li>

            {/* Séparateur */}
            <li className="flex items-center">
              <svg
                className="w-3 h-3 text-gray-400 mx-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </li>

            {/* Page actuelle */}
            <li className="flex items-center min-w-0">
              <span 
                className="text-gray-900 font-medium truncate max-w-[140px]" 
                aria-current="page"
                title={items[items.length - 1].name}
              >
                {items[items.length - 1].name}
              </span>
            </li>
          </>
        )}

        {/* Si une seule page, afficher seulement celle-ci */}
        {items.length === 1 && (
          <li className="flex items-center min-w-0">
            <span 
              className="text-gray-900 font-medium truncate" 
              aria-current="page"
              title={items[0].name}
            >
              {items[0].name}
            </span>
          </li>
        )}
      </ol>
      

      {/* Schema.org structured data pour le breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": `https://beautydiscount.ma${item.href}`
            }))
          })
        }}
      />
    </nav>
  );
}