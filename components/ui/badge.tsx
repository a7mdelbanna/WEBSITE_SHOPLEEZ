'use client';

/**
 * Badge Component
 *
 * Small labels for status, categories, discounts, etc.
 */

import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Badge variants
const badgeVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        // Default - subtle
        default: `bg-[var(--color-border-light)] text-[var(--color-text-secondary)]`,

        // Primary
        primary: `bg-[var(--color-primary)] text-[var(--color-text-on-primary)]`,

        // Primary light - softer version
        'primary-light': `bg-[var(--color-primary-light)] text-[var(--color-primary)]`,

        // Secondary
        secondary: `bg-[var(--color-secondary)] text-[var(--color-text-on-primary)]`,

        // Accent
        accent: `bg-[var(--color-accent)] text-[var(--color-text-on-primary)]`,

        // Discount - for price reductions
        discount: `bg-[var(--color-error)] text-white`,

        // New - for new items
        new: `bg-[var(--color-success)] text-white`,

        // Outline - bordered
        outline: `border border-[var(--color-border)] bg-transparent
                  text-[var(--color-text-secondary)]`,

        // Success
        success: `bg-green-100 text-green-800`,

        // Warning
        warning: `bg-yellow-100 text-yellow-800`,

        // Error
        error: `bg-red-100 text-red-800`,

        // Info
        info: `bg-blue-100 text-blue-800`,
      },
      size: {
        sm: 'h-5 px-2 text-xs rounded',
        md: 'h-6 px-2.5 text-xs rounded-md',
        lg: 'h-7 px-3 text-sm rounded-md',
      },
      rounded: {
        default: '',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'default',
    },
  }
);

// Badge props
export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component
 */
export function Badge({
  className,
  variant,
  size,
  rounded,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, rounded }), className)}
      {...props}
    />
  );
}

/**
 * Discount Badge - specifically for showing discounts
 */
export function DiscountBadge({
  percentage,
  className,
}: {
  percentage: number;
  className?: string;
}) {
  return (
    <Badge variant="discount" size="sm" className={className}>
      -{Math.round(percentage)}%
    </Badge>
  );
}

/**
 * Status Badge - for order status, etc.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'delivered';
  className?: string;
}) {
  const variantMap: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    delivered: 'success',
    cancelled: 'error',
  };

  const labelMap: Record<string, { en: string; ar: string }> = {
    pending: { en: 'Pending', ar: 'قيد الانتظار' },
    processing: { en: 'Processing', ar: 'قيد المعالجة' },
    completed: { en: 'Completed', ar: 'مكتمل' },
    delivered: { en: 'Delivered', ar: 'تم التوصيل' },
    cancelled: { en: 'Cancelled', ar: 'ملغي' },
  };

  // TODO: Use locale from context
  const label = labelMap[status]?.en || status;

  return (
    <Badge variant={variantMap[status]} size="sm" className={className}>
      {label}
    </Badge>
  );
}

// Export variants
export { badgeVariants };
