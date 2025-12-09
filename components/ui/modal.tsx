'use client';

/**
 * Modal/Dialog Component
 *
 * Using Radix UI Dialog for accessibility.
 * Supports RTL and uses theme colors.
 */

import { forwardRef, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Root
const Dialog = DialogPrimitive.Root;

// Trigger
const DialogTrigger = DialogPrimitive.Trigger;

// Portal
const DialogPortal = DialogPrimitive.Portal;

// Close button
const DialogClose = DialogPrimitive.Close;

/**
 * Dialog Overlay - backdrop
 */
const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[var(--z-modal)] bg-black/50 backdrop-blur-sm',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Dialog Content - the modal panel
 */
const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Show close button */
    showClose?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  }
>(({ className, children, showClose = true, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]',
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Position & size
          'fixed start-1/2 top-1/2 z-[var(--z-modal)] w-full -translate-x-1/2 -translate-y-1/2',
          // RTL fix for centering
          'rtl:translate-x-1/2',
          // Styling
          'rounded-xl bg-[var(--color-card)] p-6 shadow-xl',
          // Animation
          'data-[state=open]:animate-scale-in',
          // Size
          sizeClasses[size],
          // Max height with scroll
          size !== 'full' && 'max-h-[calc(100vh-4rem)] overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}

        {/* Close button */}
        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              'absolute end-4 top-4 rounded-full p-1.5',
              'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-border-light)]',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Dialog Header
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mb-4 flex flex-col gap-1.5 text-center sm:text-start', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Dialog Footer
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Dialog Title
 */
const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold text-[var(--color-text-primary)]',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Dialog Description
 */
const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[var(--color-text-secondary)]', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
