'use client';

import Image from 'next/image';

interface PreloaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

export function Preloader({ size = 'md', fullScreen = false, message }: PreloaderProps) {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

  const sizeMap = {
    sm: 40,
    md: 80,
    lg: 120,
  };

  const imageSize = sizeMap[size];

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated loader with multiple effects */}
      <div className="relative" style={{ width: imageSize, height: imageSize }}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="h-full w-full rounded-full border-4 border-transparent border-t-primary opacity-30"></div>
        </div>

        {/* Middle rotating ring */}
        <div className="absolute inset-2 animate-spin-reverse">
          <div className="h-full w-full rounded-full border-4 border-transparent border-r-primary opacity-50"></div>
        </div>

        {/* Logo with pulse animation */}
        <div className="absolute inset-4 animate-pulse-subtle">
          <Image
            src={`/tenants/store${storeId}/preloader.png`}
            alt="Loading..."
            fill
            className="object-contain drop-shadow-lg"
            priority
            onError={(e) => {
              // Fallback to logo if preloader doesn't exist
              const target = e.target as HTMLImageElement;
              target.src = `/tenants/store${storeId}/logo.png`;
            }}
          />
        </div>
      </div>

      {message && (
        <p className="animate-fade-in text-center text-sm text-gray-600">{message}</p>
      )}

      {/* Loading dots */}
      <div className="flex gap-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]"></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}

// Skeleton loader for content
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className || 'h-20 w-full'}`} />
  );
}

// Page loader (fullscreen with message)
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return <Preloader size="lg" fullScreen message={message} />;
}

// Inline loader (for buttons, cards, etc.)
export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Preloader size={size} />;
}
