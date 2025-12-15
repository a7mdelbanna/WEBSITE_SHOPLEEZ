'use client';

/**
 * ProductPlaceholder Component
 *
 * Beautiful placeholder for products without images
 * Uses the store's logo with a subtle branded background
 * Works for all stores (multi-tenant support)
 *
 * Features:
 * - Centered store logo
 * - Gradient background matching store colors
 * - Responsive sizing
 * - RTL support
 */

import Image from 'next/image';
import { useTenant } from '@/lib/hooks/use-tenant';

interface ProductPlaceholderProps {
  className?: string;
  aspectRatio?: 'square' | '3/4' | '4/3';
  logoSize?: 'sm' | 'md' | 'lg';
}

export function ProductPlaceholder({
  className = '',
  aspectRatio = 'square',
  logoSize = 'md'
}: ProductPlaceholderProps) {
  const { tenant } = useTenant();

  // Get store ID from environment
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || '1';

  // Logo path from tenant assets
  const logoPath = `/tenants/store${storeId}/logo.png`;

  // Logo size mapping
  const logoSizes = {
    sm: 'w-[60px] h-[60px]',
    md: 'w-[100px] h-[100px]',
    lg: 'w-[140px] h-[140px]'
  };

  // Aspect ratio mapping
  const aspectRatios = {
    square: 'aspect-square',
    '3/4': 'aspect-[3/4]',
    '4/3': 'aspect-[4/3]'
  };

  return (
    <div
      className={`
        relative overflow-hidden flex items-center justify-center
        ${aspectRatios[aspectRatio]}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-page) 100%)'
      }}
    >
      {/* Decorative pattern - subtle dots */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Store logo */}
      <div className={`relative ${logoSizes[logoSize]} opacity-40 grayscale`}>
        <Image
          src={logoPath}
          alt={tenant.name}
          fill
          className="object-contain"
          sizes="200px"
          unoptimized
        />
      </div>
    </div>
  );
}
