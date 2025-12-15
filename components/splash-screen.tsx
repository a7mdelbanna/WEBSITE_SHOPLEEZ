'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  duration?: number; // Duration in milliseconds (default: 2000ms)
}

export function SplashScreen({ duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

  // Store-specific configurations
  const storeConfigs: Record<string, {
    name: string;
    primaryColor: string;
  }> = {
    '1': { name: 'الاتحاد', primaryColor: '#f4b324' },
    '20': { name: 'جلالة بلس', primaryColor: '#4CAF50' },
    '22': { name: 'شكاليطه', primaryColor: '#2196F3' },
    '23': { name: 'هافنيا', primaryColor: '#9C27B0' },
  };

  const config = storeConfigs[storeId] || storeConfigs['1'];

  useEffect(() => {
    // Hide splash screen after duration or when app is ready
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    // Mark as loaded immediately
    setIsLoaded(true);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        backgroundColor: config.primaryColor,
        opacity: isLoaded ? 1 : 0,
      }}
    >
      {/* Preloader/Logo - Minimal design without store name */}
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-32 w-32 animate-pulse">
          <Image
            src={`/tenants/store${storeId}/preloader.png`}
            alt="Loading"
            fill
            priority
            className="object-contain"
            onError={(e) => {
              // Fallback to logo if preloader doesn't exist
              const target = e.target as HTMLImageElement;
              target.src = `/tenants/store${storeId}/logo.svg`;
            }}
          />
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-white"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-white"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-white"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
