'use client';

/**
 * Transactions History Page
 *
 * Displays wallet transaction history.
 * Features:
 * - Transaction list with type, amount, details
 * - Date and time display
 * - Transaction type badges (Credit/Debit)
 * - Empty state
 * - RTL support
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Receipt,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTransactionHistory } from '@/lib/services/profile';
import { useCurrency } from '@/lib/hooks/use-tenant';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import type { TransactionData } from '@/types/profile';
import type { TenantCurrency } from '@/types/tenant';

// Transaction type configuration
const getTransactionConfig = (type: string | undefined) => {
  const isCredit = type?.toLowerCase().includes('credit') || type?.toLowerCase().includes('add');
  return {
    isCredit,
    icon: isCredit ? ArrowDownCircle : ArrowUpCircle,
    colorClass: isCredit ? 'text-green-600' : 'text-red-600',
    bgClass: isCredit ? 'bg-green-50' : 'bg-red-50',
    sign: isCredit ? '+' : '-',
  };
};

function TransactionItem({
  transaction,
  isRTL,
  currency,
  locale,
}: {
  transaction: TransactionData;
  isRTL: boolean;
  currency: TenantCurrency;
  locale: 'en' | 'ar';
}) {
  const config = getTransactionConfig(transaction.transactionType);
  const Icon = config.icon;

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return '';
    const dateStr = new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return time ? `${dateStr} • ${time}` : dateStr;
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 bg-white rounded-[12px]",
      isRTL && "flex-row-reverse"
    )}>
      {/* Icon */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center",
        config.bgClass
      )}>
        <Icon className={cn("w-6 h-6", config.colorClass)} />
      </div>

      {/* Details */}
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <h3 className="text-[14px] font-semibold text-[#1A1A1A] truncate">
          {transaction.details || (isRTL ? 'معاملة' : 'Transaction')}
        </h3>
        <p className="text-[12px] text-[#6B7280] mt-1">
          {formatDateTime(transaction.createdAtDate, transaction.createdAtTime)}
        </p>
      </div>

      {/* Amount */}
      <div className={cn("text-right", isRTL && "text-left")}>
        <span className={cn("text-[16px] font-bold", config.colorClass)}>
          {config.sign}{formatPrice(transaction.amount || 0, currency, locale)}
        </span>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const { isRTL, locale } = useTranslations();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { locale: _, ...currency } = useCurrency();

  // Fetch transactions
  const { data: transactionsData, isLoading } = useTransactionHistory();
  const transactions = transactionsData?.data || [];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      router.push('/profile');
    }
  }, [isAuthenticated, openLoginModal, router]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-[#F5F5F7] px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-[#F0F0F0] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">
            {isRTL ? 'سجل المعاملات' : 'Transactions History'}
          </h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[#6B7280]">
              {isRTL ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px]">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
              <Wallet className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'لا توجد معاملات' : 'No transactions yet'}
            </h2>
            <p className="text-[14px] text-[#6B7280] text-center max-w-sm">
              {isRTL
                ? 'ستظهر معاملات المحفظة هنا'
                : 'Your wallet transactions will appear here'}
            </p>
          </div>
        )}

        {/* Transactions List */}
        {!isLoading && transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isRTL={isRTL}
                currency={currency}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
