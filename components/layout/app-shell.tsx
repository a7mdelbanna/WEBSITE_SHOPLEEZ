'use client';

/**
 * AppShell Component - Exact Samokat Style
 *
 * Key features:
 * - Gray background (#F5F5F5)
 * - White rounded containers for sidebar and content areas
 * - Proper spacing and padding
 * - LOCAL-FIRST: Cart data comes from local store, not API
 */

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar, MobileSidebar } from './sidebar';
import { FloatingCartButton } from '@/components/cart/floating-cart-button';
import { ToastContainer } from '@/components/ui/toast';
import type { CategoryNavItem } from '@/types/category';

interface AppShellProps {
  children: ReactNode;
  categories?: CategoryNavItem[];
  activeCategoryId?: number;
  hideSidebar?: boolean;
}

export function AppShell({
  children,
  categories,
  activeCategoryId,
  hideSidebar = false,
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // LOCAL-FIRST: Cart data is handled by FloatingCart inside Header
  // No API call needed here anymore

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header - sticky white bar with FloatingCart */}
      <Header
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main area with padding */}
      <div className="px-[12px] pt-[12px]">
        <div className="flex gap-[12px]">
        {/* Mobile sidebar overlay */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          categories={categories}
          activeCategoryId={activeCategoryId}
        />

        {/* Desktop sidebar - white rounded container */}
        {!hideSidebar && (
          <aside className="hidden lg:block shrink-0">
            <div className="sticky top-[76px] w-[252px] bg-white rounded-[20px] overflow-hidden">
              <Sidebar
                categories={categories}
                activeCategoryId={activeCategoryId}
              />
            </div>
          </aside>
        )}

        {/* Main content - white rounded container */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

/**
 * Simple layout without sidebars (for auth pages, etc.)
 */
export function SimpleShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">{children}</main>
    </div>
  );
}

/**
 * Content container with max-width and padding
 */
export function ContentContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 py-6 lg:px-6', className)}>
      {children}
    </div>
  );
}
