'use client';

/**
 * AppShell Component - Exact Samokat Style
 *
 * Key features:
 * - Gray background (#F5F5F5)
 * - White rounded containers for sidebar and content areas
 * - Proper spacing and padding
 */

import { useState, type ReactNode } from 'react';
import { useLocalization } from '@/lib/hooks/use-tenant';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar, MobileSidebar } from './sidebar';
import type { CategoryNavItem } from '@/types/category';

interface AppShellProps {
  children: ReactNode;
  categories?: CategoryNavItem[];
  activeCategoryId?: number;
  cartCount?: number;
  hideSidebar?: boolean;
}

export function AppShell({
  children,
  categories,
  activeCategoryId,
  cartCount = 0,
  hideSidebar = false,
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header - sticky white bar */}
      <Header
        onMenuClick={() => setIsMobileSidebarOpen(true)}
        cartCount={cartCount}
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
