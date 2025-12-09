'use client';

/**
 * Button Component
 *
 * A versatile button component with multiple variants and sizes.
 * Supports RTL and uses theme colors via CSS variables.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

// Button variants using CVA (Class Variance Authority)
const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg
   font-medium transition-all duration-200 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   active:scale-[0.98]`,
  {
    variants: {
      variant: {
        // Primary - uses theme primary color
        primary: `bg-[var(--color-primary)] text-[var(--color-text-on-primary)]
                  hover:bg-[var(--color-primary-hover)]
                  focus-visible:ring-[var(--color-primary)]`,

        // Secondary - uses theme secondary color
        secondary: `bg-[var(--color-secondary)] text-[var(--color-text-on-primary)]
                    hover:bg-[var(--color-secondary-hover)]
                    focus-visible:ring-[var(--color-secondary)]`,

        // Accent - uses theme accent color
        accent: `bg-[var(--color-accent)] text-[var(--color-text-on-primary)]
                 hover:bg-[var(--color-accent-hover)]
                 focus-visible:ring-[var(--color-accent)]`,

        // Outline - bordered with primary color
        outline: `border-2 border-[var(--color-primary)] text-[var(--color-primary)]
                  bg-transparent hover:bg-[var(--color-primary-light)]
                  focus-visible:ring-[var(--color-primary)]`,

        // Ghost - minimal style, transparent background
        ghost: `bg-transparent text-[var(--color-text-primary)]
                hover:bg-[var(--color-border-light)]
                focus-visible:ring-[var(--color-border)]`,

        // Subtle - light background
        subtle: `bg-[var(--color-border-light)] text-[var(--color-text-primary)]
                 hover:bg-[var(--color-border)]
                 focus-visible:ring-[var(--color-border)]`,

        // Destructive - for dangerous actions
        destructive: `bg-[var(--color-error)] text-white
                      hover:bg-red-600
                      focus-visible:ring-[var(--color-error)]`,

        // Success - for positive actions
        success: `bg-[var(--color-success)] text-white
                  hover:bg-green-600
                  focus-visible:ring-[var(--color-success)]`,

        // Link - text-only link style
        link: `text-[var(--color-primary)] underline-offset-4
               hover:underline hover:text-[var(--color-primary-hover)]
               p-0 h-auto`,
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'default',
    },
  }
);

// Button props interface
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** If true, renders as child component (for wrapping links, etc.) */
  asChild?: boolean;
  /** Shows loading spinner and disables button */
  isLoading?: boolean;
  /** Loading text to show when isLoading is true */
  loadingText?: string;
  /** Icon to show before children */
  leftIcon?: ReactNode;
  /** Icon to show after children */
  rightIcon?: ReactNode;
}

/**
 * Button component with variants
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      rounded,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Use Slot for asChild pattern
    const Comp = asChild ? Slot : 'button';

    // Determine if button should be disabled
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth, rounded }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Spinner
            size={size === 'sm' || size === 'icon-sm' ? 'sm' : 'md'}
            className="shrink-0"
          />
        )}

        {/* Left icon (hidden when loading) */}
        {!isLoading && leftIcon && (
          <span className="shrink-0">{leftIcon}</span>
        )}

        {/* Button text */}
        {isLoading && loadingText ? loadingText : children}

        {/* Right icon (hidden when loading) */}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Export variants for use in other components
export { buttonVariants };
