'use client';

/**
 * Confirm Dialog Component
 *
 * A beautifully styled confirmation dialog that fits the Shopleez design system.
 * Replaces the default browser confirm() with a themed modal.
 */

import { type ReactNode } from 'react';
import { Trash2, AlertTriangle, HelpCircle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './modal';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'question';

interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled */
  onCancel?: () => void;
  /** Visual variant */
  variant?: ConfirmVariant;
  /** Whether confirm action is loading */
  isLoading?: boolean;
  /** RTL mode */
  isRTL?: boolean;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: typeof Trash2;
    iconBg: string;
    iconColor: string;
    confirmBg: string;
    confirmHover: string;
  }
> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    confirmBg: 'bg-red-500',
    confirmHover: 'hover:bg-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    confirmBg: 'bg-amber-500',
    confirmHover: 'hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    confirmBg: 'bg-blue-500',
    confirmHover: 'hover:bg-blue-600',
  },
  question: {
    icon: HelpCircle,
    iconBg: 'bg-[var(--color-primary)]/10',
    iconColor: 'text-[var(--color-primary)]',
    confirmBg: 'bg-[var(--color-primary)]',
    confirmHover: 'hover:opacity-90',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false,
  isRTL = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Default texts based on RTL
  const defaultConfirmText = isRTL ? 'تأكيد' : 'Confirm';
  const defaultCancelText = isRTL ? 'إلغاء' : 'Cancel';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" showClose={false} className="p-0 overflow-hidden">
        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                config.iconBg
              )}
            >
              <Icon className={cn('w-8 h-8', config.iconColor)} />
            </div>
          </div>

          {/* Title & Description */}
          <DialogHeader className="mb-0 text-center">
            <DialogTitle className="text-[20px] font-bold text-[#1A1A1A] text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-[#6B7280] mt-2 text-center">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Footer with buttons */}
        <DialogFooter className="mt-0 p-4 bg-[#F9FAFB] border-t border-[#E5E5E5] flex-row gap-3">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className={cn(
              'flex-1 h-[48px] rounded-[12px] text-[15px] font-semibold',
              'bg-white border border-[#E5E5E5] text-[#1A1A1A]',
              'hover:bg-[#F5F5F5] transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {cancelText || defaultCancelText}
          </button>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 h-[48px] rounded-[12px] text-[15px] font-semibold text-white',
              config.confirmBg,
              config.confirmHover,
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText || defaultConfirmText
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for managing confirm dialog state
 */
import { useState, useCallback } from 'react';

interface UseConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isRTL?: boolean;
}

export function useConfirmDialog(options: UseConfirmDialogOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<(() => void) | null>(null);

  const confirm = useCallback((onConfirm: () => void) => {
    setPendingConfirm(() => onConfirm);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    pendingConfirm?.();
    setIsOpen(false);
    setPendingConfirm(null);
  }, [pendingConfirm]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setPendingConfirm(null);
  }, []);

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        isRTL={options.isRTL}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [isOpen, options, handleConfirm, handleCancel]
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
    isOpen,
    setIsOpen,
  };
}
