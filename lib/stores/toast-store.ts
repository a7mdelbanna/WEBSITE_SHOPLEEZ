'use client';

/**
 * Toast Store
 *
 * Simple zustand store for managing toast notifications.
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  messageAr?: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration (default 3 seconds)
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience functions
export const toast = {
  success: (message: string, messageAr?: string) => {
    useToastStore.getState().addToast({ message, messageAr, type: 'success' });
  },
  error: (message: string, messageAr?: string) => {
    useToastStore.getState().addToast({ message, messageAr, type: 'error' });
  },
  info: (message: string, messageAr?: string) => {
    useToastStore.getState().addToast({ message, messageAr, type: 'info' });
  },
  warning: (message: string, messageAr?: string) => {
    useToastStore.getState().addToast({ message, messageAr, type: 'warning' });
  },
};
