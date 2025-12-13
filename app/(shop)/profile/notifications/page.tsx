'use client';

/**
 * Notifications Page
 *
 * Displays notification history.
 * Features:
 * - Notification list with type indicators
 * - Title, message, date display
 * - Read/unread status
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
  Bell,
  BellOff,
  Package,
  Gift,
  Tag,
  MessageSquare,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/provider';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { buildUrl, getTokens } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import type { NotificationsModel, NotificationItem } from '@/types/profile';

// Notification type icons
const getNotificationIcon = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case 'order':
      return Package;
    case 'promo':
    case 'offer':
      return Tag;
    case 'reward':
    case 'points':
      return Gift;
    default:
      return MessageSquare;
  }
};

function NotificationCard({
  notification,
  isRTL,
}: {
  notification: NotificationItem;
  isRTL: boolean;
}) {
  const Icon = getNotificationIcon(notification.notificationType);
  const isRead = notification.isRead;

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return '';
    const dateStr = new Date(date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
    return time ? `${dateStr} • ${time}` : dateStr;
  };

  return (
    <div className={cn(
      "flex gap-4 p-4 bg-white rounded-[12px]",
      !isRead && "bg-blue-50/30",
      isRTL && "flex-row-reverse"
    )}>
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        isRead ? "bg-[#F5F5F7]" : "bg-[var(--color-primary)] bg-opacity-10"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          isRead ? "text-[#6B7280]" : "text-[var(--color-primary)]"
        )} />
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "text-[14px] font-semibold text-[#1A1A1A] line-clamp-1",
            !isRead && "font-bold"
          )}>
            {notification.notificationTitle}
          </h3>
          {!isRead && (
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-2" />
          )}
        </div>
        <p className="text-[13px] text-[#6B7280] line-clamp-2 mt-1">
          {notification.notificationMessage || notification.notificationSubTitle}
        </p>
        <p className="text-[11px] text-[#9CA3AF] mt-2">
          {formatDateTime(notification.notificationDate, notification.notificationTime)}
        </p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();
  const { apiClient, storeId } = useApiClient();
  const { accessToken } = getTokens();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', storeId],
    queryFn: async (): Promise<NotificationsModel> => {
      const url = buildUrl(API_ENDPOINTS.notifications.getHistory, storeId);
      const response = await apiClient.get(url);
      return response.data;
    },
    enabled: !!accessToken,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
  const notifications = notificationsData?.data || [];

  // Redirect if not authenticated
  useEffect(() => {
    // Don't redirect while still checking authentication
    if (authLoading) return;

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
            {isRTL ? 'الإشعارات' : 'Notifications'}
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
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px]">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
              <BellOff className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
            </h2>
            <p className="text-[14px] text-[#6B7280] text-center max-w-sm">
              {isRTL
                ? 'ستظهر الإشعارات الجديدة هنا'
                : 'New notifications will appear here'}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.notificationId}
                notification={notification}
                isRTL={isRTL}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
