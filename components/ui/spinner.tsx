'use client';

/**
 * Spinner Component
 *
 * A loading spinner with multiple sizes.
 */

import { cn } from '@/lib/utils';

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional class names */
  className?: string;
  /** Color (defaults to current text color) */
  color?: 'primary' | 'secondary' | 'white' | 'current';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-3',
  xl: 'h-12 w-12 border-4',
};

const colorClasses = {
  primary: 'border-[var(--color-primary)]',
  secondary: 'border-[var(--color-secondary)]',
  white: 'border-white',
  current: 'border-current',
};

export function Spinner({
  size = 'md',
  color = 'current',
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function PageSpinner() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <Spinner size="xl" color="primary" />
    </div>
  );
}

/**
 * Overlay spinner (covers parent container)
 */
export function OverlaySpinner() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner size="lg" color="primary" />
    </div>
  );
}
