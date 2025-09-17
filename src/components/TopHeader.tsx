"use client";

import { useState, useEffect } from "react";

// Props du composant TopHeader
interface TopHeaderProps {
  messages?: string[];
  className?: string;
}

export default function TopHeader({
  messages = [
    "Beautydiscount |  Vos meilleur marques a petit prix",
    "Livraison Rapide dans tout le maroc",
    "Commandez Puis payez à la réception du colis"
  ],
  className = "",
}: TopHeaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Effet d'alternance entre les messages
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 500); // Attend 500ms avant de changer le message
      
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`text-white ${className}`} style={{ backgroundColor: '#1e1e1e' }}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center py-1">
          <span 
            className={`text-sm font-semibold transition-opacity duration-500 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {messages[currentIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}