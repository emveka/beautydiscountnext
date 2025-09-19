// app/checkout/page.tsx - VERSION MOBILE ULTRA-OPTIMISÉE
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/contexts/CartContext';
import { formatPrice, getProductImageUrl } from '@/lib/firebase-utils';
import { createOrder, type CustomerInfo } from '@/lib/firebase-orders';

// Configuration des villes du Maroc avec frais de livraison
const MOROCCO_CITIES = [
  { name: 'Casablanca', price: 25 },
  { name: 'Rabat', price: 30 },
  { name: 'Marrakech', price: 35 },
  { name: 'Fès', price: 40 },
  { name: 'Tanger', price: 45 },
  { name: 'Agadir', price: 50 },
  { name: 'Meknès', price: 40 },
  { name: 'Oujda', price: 55 },
  { name: 'Kenitra', price: 35 },
  { name: 'Tétouan', price: 45 },
  { name: 'Salé', price: 30 },
  { name: 'Mohammedia', price: 25 },
  { name: 'Khouribga', price: 40 },
  { name: 'El Jadida', price: 35 },
  { name: 'Settat', price: 35 },
  { name: 'Nador', price: 55 },
  { name: 'Safi', price: 40 },
  { name: 'Ksar el-Kebir', price: 45 },
  { name: 'Larache', price: 45 },
  { name: 'Khemisset', price: 35 },
  { name: 'Beni Mellal', price: 45 },
  { name: 'Taza', price: 50 },
  { name: 'Berkane', price: 55 },
  { name: 'Al Hoceima', price: 60 },
  { name: 'Ouarzazate', price: 55 },
  { name: 'Errachidia', price: 60 },
  { name: 'Tiznit', price: 55 },
  { name: 'Essaouira', price: 45 },
  { name: 'Dakhla', price: 80 },
  { name: 'Laâyoune', price: 75 },
  { name: 'Autre ville', price: 50 }
];

export default function CheckoutPage() {
  const router = useRouter();
  const { state, clearCart, getCartSummary } = useCart();
  const { items } = state;
  const cartSummary = getCartSummary();

  // État du formulaire
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    phone: ''
  });

  const [selectedCity, setSelectedCity] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({});

  // Mettre à jour le coût de livraison quand la ville change
  useEffect(() => {
    if (selectedCity) {
      const city = MOROCCO_CITIES.find(c => c.name === selectedCity);
      setShippingCost(city ? city.price : 50);
      setFormData(prev => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  // Redirection si panier vide
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items.length, router]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const errors: Partial<CustomerInfo> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!formData.address.trim()) {
      errors.address = 'L\'adresse est requise';
    }

    if (!formData.city.trim()) {
      errors.city = 'La ville est requise';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (!/^(06|07|05)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Numéro de téléphone invalide (format: 06XXXXXXXX)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ FONCTION DE DEBUG AMÉLIORÉE
  const debugCartItems = () => {
    console.log("🔍 DEBUG: Vérification détaillée des articles du panier");
    console.log("📊 Nombre d'articles:", items.length);
    
    items.forEach((item, index) => {
      console.log(`\n📦 Article ${index + 1}:`);
      console.log("  ID:", item.id);
      console.log("  Product:", {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        brandName: item.product.brandName,
        sku: item.product.sku,
        price: item.product.price,
        originalPrice: item.product.originalPrice,
        images: item.product.images,
        imagePaths: item.product.imagePaths
      });
      console.log("  Quantity:", item.quantity);
      
      // ✅ VÉRIFICATIONS CRITIQUES
      const issues = [];
      if (item.product.brandName === undefined) issues.push('brandName undefined');
      if (item.product.originalPrice === undefined) issues.push('originalPrice undefined');
      if (!item.product.images && !item.product.imagePaths) issues.push('aucune image');
      if (!item.product.images?.length && !item.product.imagePaths?.length) issues.push('tableaux d\'images vides');
      
      if (issues.length > 0) {
        console.warn(`  ⚠️ PROBLÈMES DÉTECTÉS: ${issues.join(', ')}`);
      } else {
        console.log("  ✅ Article OK");
      }
    });
    
    console.log("\n📋 Données du formulaire:", formData);
    console.log("🚚 Coût de livraison:", shippingCost);
  };

  // ✅ GESTION DE LA SOUMISSION AVEC DEBUG DÉTAILLÉ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log("❌ Formulaire invalide");
      return;
    }

    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // ✅ DEBUG AUTOMATIQUE AVANT SOUMISSION
    console.log("\n🚀 =================================================");
    console.log("🚀 DÉBUT DE LA CRÉATION DE COMMANDE");
    console.log("🚀 =================================================");
    debugCartItems();

    setIsSubmitting(true);

    try {
      console.log("\n📞 Appel de createOrder...");
      const result = await createOrder(
        formData,
        items,
        shippingCost
      );
      
      console.log("✅ SUCCÈS: Commande créée avec succès:", result);
      
      // Vider le panier
      clearCart();
      
      // Redirection vers la page de succès
      router.push(`/order-success?orderNumber=${result.orderNumber}&orderId=${result.orderId}`);
      
    } catch (error) {
      setIsSubmitting(false);
      
      console.error("\n❌ =================================================");
      console.error("❌ ERREUR LORS DE LA CRÉATION DE COMMANDE");
      console.error("❌ =================================================");
      console.error("🔍 Erreur complète:", error);
      
      if (error instanceof Error) {
        console.error("🔍 Message:", error.message);
        console.error("📚 Stack:", error.stack);
        
        // ✅ GESTION D'ERREURS SPÉCIFIQUES
        let userMessage = 'Une erreur est survenue lors de la création de votre commande.';
        
        if (error.message.includes('Unsupported field value: undefined')) {
          userMessage = 'Erreur de données. Rechargez la page et réessayez.';
          console.error("🐛 UNDEFINED DÉTECTÉ - Voir le code pour correction");
        } else if (error.message.includes('permission')) {
          userMessage = 'Problème de permissions. Contactez le support technique.';
        } else if (error.message.includes('unavailable')) {
          userMessage = 'Service temporairement indisponible. Réessayez dans quelques minutes.';
        } else if (error.message.includes('Firebase')) {
          userMessage = 'Problème de connexion. Vérifiez votre internet et réessayez.';
        } else if (error.message.includes('getTime')) {
          userMessage = 'Erreur de format de date. Rechargez la page et réessayez.';
        }
        
        alert(`${userMessage}\n\nSi le problème persiste, contactez notre support au +212 771 515 771.`);
      } else {
        alert('Erreur inconnue. Contactez notre support.');
      }
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur du champ modifié
    if (formErrors[name as keyof CustomerInfo]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Calcul du total final
  const finalTotal = cartSummary.total + shippingCost;

  // Si panier vide, ne pas afficher la page
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-gray-300 mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto">
              <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 mb-4">Découvrez nos produits de beauté à prix discount</p>
          <Link href="/" className="bg-rose-300 hover:bg-rose-400 text-black font-medium px-6 py-2 rounded-lg transition-colors">
            Retourner aux achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ADAPTATION RESPONSIVE: Desktop utilise la version complète, mobile la version compacte */}
      
      {/* 🖥️ VERSION DESKTOP (≥1024px) - Layout 2 colonnes */}
      <div className="hidden lg:block py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Desktop */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Finaliser ma commande</h1>
            <p className="text-gray-600">Renseignez vos informations pour recevoir vos produits</p>
          </div>

          {/* ✅ BOUTON DE DEBUG EN DÉVELOPPEMENT */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 text-center">
              <button
                onClick={debugCartItems}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                🔍 Debug Cart Items
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulaire de commande Desktop */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Informations de livraison
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Prénom et Nom Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Votre prénom"
                      disabled={isSubmitting}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Adresse Desktop */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse complète *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Numéro, rue, quartier..."
                    disabled={isSubmitting}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>

                {/* Ville Desktop */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez votre ville</option>
                    {MOROCCO_CITIES.map(city => (
                      <option key={city.name} value={city.name}>
                        {city.name} - {city.price} DH de livraison
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                  )}
                </div>

                {/* Téléphone Desktop */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="06 XX XX XX XX"
                    disabled={isSubmitting}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Nous vous appellerons pour confirmer votre commande
                  </p>
                </div>

                {/* Note sur le paiement Desktop */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 7h-2v4H9v2h2v4h2v-4h2v-2h-2V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-900">Paiement à la livraison</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Vous payez en espèces au livreur lors de la réception de votre commande
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton de soumission Desktop */}
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="w-full bg-rose-300 hover:bg-rose-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Création de votre commande...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Confirmer ma commande
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Résumé de commande Desktop */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                Votre commande ({items.length} article{items.length > 1 ? 's' : ''})
              </h2>

              {/* Liste des produits Desktop */}
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const imageUrl = getProductImageUrl(item.product);
                  return (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
                          {item.product.name}
                        </h4>
                        {item.product.brandName && (
                          <p className="text-xs text-rose-600 font-medium uppercase mt-1">
                            {item.product.brandName}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {item.quantity} × {formatPrice(item.product.price)}
                          </span>
                          <span className="font-bold text-rose-600">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totaux Desktop */}
              <div className="border-t border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-base">
                  <span>Sous-total ({cartSummary.itemsCount} articles)</span>
                  <span>{formatPrice(cartSummary.subtotal)}</span>
                </div>

                {cartSummary.savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Économies totales</span>
                    <span>-{formatPrice(cartSummary.savings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base">
                  <span>
                    Livraison 
                    {selectedCity && <span className="text-sm text-gray-500"> ({selectedCity})</span>}
                  </span>
                  <span>
                    {shippingCost > 0 ? formatPrice(shippingCost) : 'Sélectionner ville'}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                  <span>Total à payer</span>
                  <span className="text-rose-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Avantages Desktop */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">✨ Vos avantages</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Paiement à la livraison sécurisé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Livraison dans tout le Maroc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Service client réactif 7j/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Produits 100% authentiques</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Retours sous 24h ouvrées</span>
                  </div>
                </div>
              </div>

              {/* Informations de contact Desktop */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">📞 Besoin d&apos;aide ?</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>WhatsApp: <strong>+212 771 515 771</strong></div>
                  <div>Email: <strong>contact@beautydiscount.ma</strong></div>
                  <div className="text-xs text-gray-500 mt-2">
                    Notre équipe répond rapidement à vos questions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 VERSION MOBILE (<1024px) - Ultra-compact */}
      <div className="lg:hidden">
        {/* 📱 HEADER MOBILE COMPACT */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Finaliser ma commande</h1>
              <p className="text-xs text-gray-500">{items.length} article{items.length > 1 ? 's' : ''} dans votre panier</p>
            </div>
          </div>
        </div>

        {/* ✅ BOUTON DE DEBUG EN DÉVELOPPEMENT MOBILE */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-4 py-2 text-center">
            <button
              onClick={debugCartItems}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              🔍 Debug Cart Items
            </button>
          </div>
        )}

        {/* 📱 CONTENU PRINCIPAL MOBILE */}
        <div className="px-4 py-4 space-y-4 pb-24">
          
          {/* 📱 FORMULAIRE ULTRA-COMPACT */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <h2 className="text-base font-bold text-gray-900">Informations de livraison</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* 📱 Prénom et Nom en ligne */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Prénom"
                    disabled={isSubmitting}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Nom"
                    disabled={isSubmitting}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* 📱 Adresse compacte */}
              <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Numéro, rue, quartier..."
                  disabled={isSubmitting}
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>
                )}
              </div>

              {/* 📱 Ville compacte */}
              <div>
                <label htmlFor="city" className="block text-xs font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select
                  id="city"
                  name="city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm ${formErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={isSubmitting}
                >
                  <option value="">Sélectionnez votre ville</option>
                  {MOROCCO_CITIES.map(city => (
                    <option key={city.name} value={city.name}>
                      {city.name} - {city.price} DH
                    </option>
                  ))}
                </select>
                {formErrors.city && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>
                )}
              </div>

              {/* 📱 Téléphone compact */}
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors text-sm ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="06 XX XX XX XX"
                  disabled={isSubmitting}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Nous vous appellerons pour confirmer
                </p>
              </div>

              {/* 📱 Note paiement ultra-compacte */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 7h-2v4H9v2h2v4h2v-4h2v-2h-2V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <div>
                    <h3 className="font-medium text-blue-900 text-sm">Paiement à la livraison</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Vous payez en espèces au livreur
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* 📱 RÉSUMÉ COMMANDE ULTRA-COMPACT */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                Votre commande
              </h2>
              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                {items.length} article{items.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* 📱 Liste produits ultra-compacte */}
            <div className="space-y-2 mb-4">
              {items.map((item) => {
                const imageUrl = getProductImageUrl(item.product);
                return (
                  <div key={item.id} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={item.product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-gray-900 line-clamp-2 leading-tight">
                        {item.product.name}
                      </h4>
                      {item.product.brandName && (
                        <p className="text-xs text-rose-600 font-medium uppercase">
                          {item.product.brandName}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {item.quantity} × {formatPrice(item.product.price)}
                        </span>
                        <span className="font-bold text-rose-600 text-sm">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 📱 Totaux compacts */}
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{formatPrice(cartSummary.subtotal)}</span>
              </div>

              {cartSummary.savings > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Économies</span>
                  <span>-{formatPrice(cartSummary.savings)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>
                  Livraison
                  {selectedCity && <span className="text-xs text-gray-500 block">({selectedCity})</span>}
                </span>
                <span>
                  {shippingCost > 0 ? formatPrice(shippingCost) : 'Ville requise'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                <span>Total à payer</span>
                <span className="text-rose-600">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* 📱 Avantages ultra-compacts */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">✨ Vos avantages</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Support 7j/7</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Produits authentiques</span>
              </div>
            </div>
          </div>

          {/* 📱 Contact ultra-compact */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm flex items-center gap-2">
              📞 Besoin d&apos;aide ?
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>WhatsApp: <strong>+212 771 515 771</strong></div>
              <div>Email: <strong>contact@beautydiscount.ma</strong></div>
              <div className="text-xs text-gray-500 mt-1">
                Réponse rapide à vos questions
              </div>
            </div>
          </div>

          {/* 📱 Footer sécurité ultra-compact */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm text-center">🔒 Commande 100% sécurisée</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 text-xs">Données protégées</h4>
                <p className="text-gray-600 text-xs leading-tight">Informations sécurisées</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 text-xs">Paiement sûr</h4>
                <p className="text-gray-600 text-xs leading-tight">À la réception</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <svg className="w-4 h-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6c0-1.38-1.12-2.5-2.5-2.5S11 4.62 11 6v1H8c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 0V6c0-.83.67-1.5 1.5-1.5S14 5.17 14 6v1h-3z"/>
                  </svg>
                </div>
                <h4 className="font-medium text-gray-900 text-xs">Livraison rapide</h4>
                <p className="text-gray-600 text-xs leading-tight">Sous 24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📱 BOUTON COMMANDE FIXE EN BAS */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0 || !selectedCity}
            className="w-full bg-rose-300 hover:bg-rose-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Création en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Confirmer ma commande
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}