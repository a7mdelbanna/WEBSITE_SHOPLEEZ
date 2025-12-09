'use client';

/**
 * Card Component
 *
 * A flexible card container with multiple variants.
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card variants
const cardVariants = cva(
  // Base styles
  'rounded-xl bg-[var(--color-card)] transition-all duration-200',
  {
    variants: {
      variant: {
        // Default - subtle shadow
        default: 'shadow-sm border border-[var(--color-border-light)]',

        // Elevated - more prominent shadow
        elevated: 'shadow-md hover:shadow-lg',

        // Outlined - border only
        outlined: 'border border-[var(--color-border)]',

        // Flat - no shadow or border
        flat: '',

        // Interactive - clickable card with hover effect
        interactive: `shadow-sm border border-[var(--color-border-light)]
                      cursor-pointer hover:shadow-md hover:border-[var(--color-border)]
                      active:scale-[0.99]`,

        // Highlighted - primary color accent
        highlighted: `border-2 border-[var(--color-primary)]
                      shadow-sm shadow-[var(--color-primary-light)]`,
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

// Card props
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card - main container
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/**
 * CardHeader - top section of card
 */
export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

/**
 * CardTitle - card heading
 */
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight text-[var(--color-text-primary)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

/**
 * CardDescription - subtitle/description
 */
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--color-text-secondary)]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/**
 * CardContent - main content area
 */
export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

/**
 * CardFooter - bottom section
 */
export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Export variants for customization
export { cardVariants };
