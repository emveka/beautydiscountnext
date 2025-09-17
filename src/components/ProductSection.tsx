"use client";

import React, { useState } from "react";
import Image from "next/image";

/**
 * Interface simple pour un produit
 */
interface SimpleProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  brand?: string;
}

/**
 * Interface pour une catégorie
 */
interface SimpleCategory {
  id: string;
  name: string;
  products: SimpleProduct[];
}

/**
 * Props du composant
 */
interface CategoryProductsProps {
  title?: string;
  categories: SimpleCategory[];
}

/**
 * Composant simple pour afficher des produits par catégorie
 */
const CategoryProducts: React.FC<CategoryProductsProps> = ({
  title = "Nos Produits",
  categories = []
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(
    categories.length > 0 ? categories[0].id : ""
  );

  // Trouver la catégorie active
  const currentCategory = categories.find(cat => cat.id === activeCategory);
  const products = currentCategory?.products || [];

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-500">Aucun produit disponible</p>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Titre principal */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Boutons des catégories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-rose-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Titre de la catégorie active */}
        {currentCategory && (
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800">
              {currentCategory.name}
            </h3>
            <p className="text-gray-600 mt-2">
              {products.length} produit{products.length > 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Grille des produits */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Image du produit */}
              <div className="aspect-square bg-gray-100 p-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/api/placeholder/300/300';
                  }}
                />
              </div>

              {/* Informations produit */}
              <div className="p-4">
                {/* Marque */}
                {product.brand && (
                  <p className="text-xs text-gray-500 mb-2 uppercase font-medium">
                    {product.brand}
                  </p>
                )}

                {/* Nom du produit */}
                <h4 className="font-semibold text-sm text-gray-900 mb-3 line-clamp-2">
                  {product.name}
                </h4>

                {/* Prix */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {product.oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.oldPrice.toLocaleString()} dh
                      </span>
                    )}
                    <span className="text-lg font-bold text-rose-600">
                      {product.price.toLocaleString()} dh
                    </span>
                  </div>

                  {/* Badge de réduction */}
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si pas de produits */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit dans cette catégorie</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProducts;