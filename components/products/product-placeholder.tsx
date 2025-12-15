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
      {/* Decorative pattern - visible dots */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-primary) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, var(--color-primary-light) 100%)'
        }}
      />

      {/* Store logo - visible and branded */}
      <div className={`relative ${logoSizes[logoSize]} opacity-75 transition-transform duration-300 hover:scale-105`}>
        <Image
          src={logoPath}
          alt={tenant.name}
          fill
          className="object-contain drop-shadow-lg"
          sizes="200px"
          unoptimized
        />
      </div>
    </div>
  );
}
