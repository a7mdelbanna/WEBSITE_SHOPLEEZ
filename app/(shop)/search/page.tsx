'use client';

/**
 * Search Results Page
 *
 * Features:
 * - Full-page search with pagination
 * - Product grid display
 * - Empty state handling
 * - Loading states
 * - RTL support
 */

import { Suspense } from 'react';
import { AppShell } from '@/components/layout';
import { SearchResultsContent } from '@/components/search/search-results-content';
import { Loader2 } from 'lucide-react';

function SearchPageSkeleton() {
  return (
    <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchResultsContent />
      </Suspense>
    </AppShell>
  );
}
