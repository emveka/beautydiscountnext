// components/GoogleTagManagerOptimized.tsx - CORRECTION ESLINT
"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface GTMProps {
  gtmId: string;
}

export default function GoogleTagManagerOptimized({ gtmId }: GTMProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        setTimeout(() => setShouldLoad(true), 2000);
      }
    };

    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    const fallbackTimer = setTimeout(() => {
      setShouldLoad(true);
    }, 5000);

    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { 
        once: true, 
        passive: true 
      });
    });

    return () => {
      clearTimeout(fallbackTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [userInteracted]);

  useEffect(() => {
    if (shouldLoad && !window.dataLayer) {
      window.dataLayer = window.dataLayer || [];
      // ✅ CORRECTION: Utiliser rest parameters au lieu d'arguments
      window.gtag = function(...args: unknown[]) {
        window.dataLayer.push(args);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', gtmId, {
        send_page_view: false,
        cookie_flags: 'SameSite=None;Secure',
        custom_map: {},
        linker: { domains: [] },
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
  }, [shouldLoad, gtmId]);

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      <Script
        id="gtm-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtmId}`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('GTM chargé de manière optimisée');
        }}
        onError={() => {
          console.warn('Erreur chargement GTM');
        }}
      />

      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}