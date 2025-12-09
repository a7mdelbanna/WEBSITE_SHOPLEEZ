/**
 * Utility for merging Tailwind CSS classes
 *
 * Uses clsx for conditional classes and tailwind-merge
 * to handle conflicting Tailwind classes correctly.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
