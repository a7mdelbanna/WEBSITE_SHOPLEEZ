'use client';

/**
 * Input Component
 *
 * Text input with RTL support and multiple variants.
 */

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useState,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Input variants
const inputVariants = cva(
  // Base styles - using logical properties for RTL
  `w-full rounded-lg border bg-[var(--color-card)] px-4
   text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
   transition-all duration-200
   focus:outline-none focus:ring-2 focus:ring-offset-0
   disabled:cursor-not-allowed disabled:opacity-50`,
  {
    variants: {
      variant: {
        // Default
        default: `border-[var(--color-border)]
                  focus:border-[var(--color-primary)]
                  focus:ring-[var(--color-primary-light)]`,

        // Filled - slightly different background
        filled: `border-transparent bg-[var(--color-background)]
                 focus:border-[var(--color-primary)]
                 focus:ring-[var(--color-primary-light)]`,

        // Error state
        error: `border-[var(--color-error)] bg-red-50
                focus:border-[var(--color-error)]
                focus:ring-red-100`,

        // Success state
        success: `border-[var(--color-success)] bg-green-50
                  focus:border-[var(--color-success)]
                  focus:ring-green-100`,
      },
      inputSize: {
        sm: 'h-9 text-sm',
        md: 'h-11 text-base',
        lg: 'h-13 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

// Input props
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Label for the input */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (shows error variant automatically) */
  error?: string;
  /** Icon at the start of input */
  startIcon?: ReactNode;
  /** Icon at the end of input */
  endIcon?: ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

/**
 * Input component
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type = 'text',
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      fullWidth = true,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    // For password toggle
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    // Auto-generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    // Determine actual variant (error overrides)
    const actualVariant = error ? 'error' : variant;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Start icon */}
          {startIcon && (
            <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {startIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              inputVariants({ variant: actualVariant, inputSize }),
              startIcon && 'ps-10',
              (endIcon || isPassword) && 'pe-10',
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {/* End icon / Password toggle */}
          {(endIcon || isPassword) && (
            <div className="absolute end-3 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <span className="text-[var(--color-text-muted)]">{endIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text (only show if no error) */}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-[var(--color-text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Export variants
export { inputVariants };
