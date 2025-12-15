'use client';

/**
 * Orders List Page - My Orders History
 *
 * Features:
 * - List all user orders
 * - Order status badges
 * - Order date and total
 * - Quick preview of items
 * - Navigate to order details
 * - RTL support
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Package, ArrowLeft, ArrowRight, Loader2, ShoppingBag,
  Clock, CheckCircle, Truck, XCircle, ChevronRight
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useMyOrders } from '@/lib/services/order';
import { cn } from '@/lib/utils';
import type { OrderStatus, OrderSummary } from '@/types/order';

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, {
  icon: typeof Clock;
  colorClass: string;
  bgClass: string;
  labelEn: string;
  labelAr: string;
}> = {
  Pending: {
    icon: Clock,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    labelEn: 'Pending',
    labelAr: 'قيد الانتظار',
  },
  Confirmed: {
    icon: CheckCircle,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    labelEn: 'Confirmed',
    labelAr: 'تم التأكيد',
  },
  Processing: {
    icon: Package,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
    labelEn: 'Processing',
    labelAr: 'جاري التحضير',
  },
  ReadyForDelivery: {
    icon: Package,
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
    labelEn: 'Ready for Delivery',
    labelAr: 'جاهز للتوصيل',
  },
  OutForDelivery: {
    icon: Truck,
    colorClass: 'text-cyan-600',
    bgClass: 'bg-cyan-50',
    labelEn: 'Out for Delivery',
    labelAr: 'في الطريق',
  },
  Delivered: {
    icon: CheckCircle,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
    labelEn: 'Delivered',
    labelAr: 'تم التوصيل',
  },
  Cancelled: {
    icon: XCircle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
    labelEn: 'Cancelled',
    labelAr: 'ملغي',
  },
  Rejected: {
    icon: XCircle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
    labelEn: 'Rejected',
    labelAr: 'مرفوض',
  },
  Refunded: {
    icon: XCircle,
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-50',
    labelEn: 'Refunded',
    labelAr: 'تم الاسترداد',
  },
};

function OrderStatusBadge({ status, isRTL }: { status: OrderStatus; isRTL: boolean }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium",
      config.bgClass,
      config.colorClass
    )}>
      <Icon className="w-3.5 h-3.5" />
      {isRTL ? config.labelAr : config.labelEn}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();

  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch orders - only enabled when authenticated
  const { data: orders, isLoading, error } = useMyOrders(isAuthenticated);

  // Check for success redirect from checkout
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccessMessage(true);

      // Clear success param from URL without refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Redirect if not authenticated - ONLY after auth loading is complete
  useEffect(() => {
    // Don't redirect while still checking authentication
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('[Orders] User not authenticated, redirecting to home');
      openLoginModal();
      router.push('/');
    }
  }, [isAuthenticated, authLoading, openLoginModal, router]);

  // Format price
  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} ${isRTL ? 'ج.م' : 'EGP'}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gray-50)] hover:bg-[#ECECEC] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[var(--color-gray-900)]" />
          </Link>
          <h1 className="text-[28px] font-bold text-[var(--color-gray-900)]">
            {isRTL ? 'طلباتي' : 'My Orders'}
          </h1>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 rounded-[16px] bg-green-50 border border-green-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-green-900 mb-1">
                {isRTL ? 'تم إتمام الطلب بنجاح!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-[14px] text-green-700">
                {isRTL
                  ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً. يمكنك متابعة حالة الطلب من الأسفل.'
                  : 'Thank you! Your order has been received and will be processed soon. You can track your order status below.'}
              </p>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-green-100 flex items-center justify-center transition-colors"
            >
              <XCircle className="w-5 h-5 text-green-600" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[var(--color-gray-500)]">
              {isRTL ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[var(--color-gray-50)] flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[var(--color-gray-400)]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[var(--color-gray-900)] mb-2">
              {isRTL ? 'لا توجد طلبات' : 'No orders yet'}
            </h2>
            <p className="text-[14px] text-[var(--color-gray-500)] mb-6 text-center max-w-sm">
              {isRTL
                ? 'لم تقم بإجراء أي طلبات بعد. ابدأ التسوق الآن!'
                : 'You haven\'t placed any orders yet. Start shopping now!'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-[var(--color-gray-50)] rounded-[16px] p-5 hover:bg-[#F0F1F3] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Order Icon/Image */}
                  {order.firstItemImage ? (
                    <div className="w-[80px] h-[80px] rounded-[12px] bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={order.firstItemImage}
                        alt="Order"
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-[56px] h-[56px] rounded-[14px] flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'red-50' ? '#FEF2F2' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'green-50' ? '#F0FDF4' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'blue-50' ? '#EFF6FF' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'amber-50' ? '#FFFBEB' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'indigo-50' ? '#EEF2FF' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'purple-50' ? '#FAF5FF' :
                               STATUS_CONFIG[order.status]?.bgClass.replace('bg-', '') === 'cyan-50' ? '#ECFEFF' :
                               '#F5F5F7' }}
                    >
                      <Package className="w-7 h-7"
                        style={{ color: STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'red-600' ? '#DC2626' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'green-600' ? '#16A34A' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'blue-600' ? '#2563EB' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'amber-600' ? '#D97706' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'indigo-600' ? '#4F46E5' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'purple-600' ? '#9333EA' :
                                 STATUS_CONFIG[order.status]?.colorClass.replace('text-', '') === 'cyan-600' ? '#0891B2' :
                                 '#6B7280' }}
                      />
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-[16px] font-semibold text-[var(--color-gray-900)]">
                          {order.orderNumber}
                        </h3>
                        <p className="text-[13px] text-[var(--color-gray-500)]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} isRTL={isRTL} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[13px] text-[var(--color-gray-500)]">
                        {order.itemCount} {isRTL ? (order.itemCount === 1 ? 'منتج' : 'منتجات') : (order.itemCount === 1 ? 'item' : 'items')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[16px] font-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {formatPrice(order.total)}
                        </span>
                        <ChevronRight className={cn(
                          "w-5 h-5 text-[var(--color-gray-400)]",
                          isRTL && "rotate-180"
                        )} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
