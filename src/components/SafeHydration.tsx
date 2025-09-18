// components/SafeHydration.tsx
'use client';

import { useState, useEffect } from 'react';

interface SafeHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function SafeHydration({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-4 w-full" />
}: SafeHydrationProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}