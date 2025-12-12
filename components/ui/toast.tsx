'use client';

/**
 * Toast Component
 *
 * Displays toast notifications at the bottom of the screen.
 */

import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type Toast, type ToastType } from '@/lib/stores/toast-store';
import { useTranslations } from '@/lib/hooks/use-translations';
import { cn } from '@/lib/utils';

const iconMap: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { isRTL } = useTranslations();
  const removeToast = useToastStore((state) => state.removeToast);
  const [isVisible, setIsVisible] = useState(false);

  const Icon = iconMap[toast.type];
  const message = isRTL && toast.messageAr ? toast.messageAr : toast.message;

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-[12px] px-[16px] py-[12px] rounded-[12px] shadow-lg',
        'bg-white border border-gray-100',
        'transform transition-all duration-200',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <div className={cn('p-[6px] rounded-full', colorMap[toast.type])}>
        <Icon className="w-[16px] h-[16px] text-white" />
      </div>

      <span className="flex-1 text-[14px] text-gray-800 font-medium">
        {message}
      </span>

      <button
        onClick={handleClose}
        className="p-[4px] rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-[16px] h-[16px] text-gray-400" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const { isRTL } = useTranslations();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-[100px] z-[100] flex flex-col gap-[8px]',
        isRTL ? 'left-[24px]' : 'right-[24px]',
        'max-w-[360px] w-full'
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
