'use client';

/**
 * Skeleton Component
 *
 * Loading placeholder with pulse animation.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton component
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--color-border-light)]',
        className
      )}
    />
  );
}

/**
 * Text skeleton - for text lines
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            // Make last line shorter for natural look
            i === lines - 1 && lines > 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Circle skeleton - for avatars, icons
 */
export function SkeletonCircle({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
  );
}

/**
 * Image skeleton - for images/thumbnails
 */
export function SkeletonImage({
  aspectRatio = 'square',
  className,
}: {
  aspectRatio?: 'square' | '16/9' | '4/3' | '3/2';
  className?: string;
}) {
  const aspectClasses = {
    square: 'aspect-square',
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
  };

  return (
    <Skeleton className={cn('w-full', aspectClasses[aspectRatio], className)} />
  );
}

/**
 * Card skeleton - for product cards, etc.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border-light)] bg-[var(--color-card)] p-4',
        className
      )}
    >
      <SkeletonImage aspectRatio="square" className="mb-4 rounded-lg" />
      <SkeletonText lines={2} className="mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <SkeletonCircle size="sm" />
      </div>
    </div>
  );
}

/**
 * Product card skeleton grid
 */
export function SkeletonProductGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * List item skeleton
 */
export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)}>
      <SkeletonCircle size="lg" />
      <div className="flex-1">
        <SkeletonText lines={2} />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
