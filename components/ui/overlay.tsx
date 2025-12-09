'use client';

/**
 * Overlay Component - Reusable dimming overlay
 *
 * Used by:
 * - Search focus state
 * - Product detail modal
 * - Any modal/dialog
 *
 * Design: Semi-transparent black background with fade animation
 */

import { cn } from '@/lib/utils';

interface OverlayProps {
  isVisible: boolean;
  onClick?: () => void;
  className?: string;
  zIndex?: number;
}

export function Overlay({
  isVisible,
  onClick,
  className,
  zIndex = 40,
}: OverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/60 animate-fade-in',
        className
      )}
      style={{ zIndex }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

export default Overlay;
