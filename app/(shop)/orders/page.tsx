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

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  const { isRTL } = useTranslations();
  const { isAuthenticated, openLoginModal } = useAuth();

  // Fetch orders
  const { data: orders, isLoading, error } = useMyOrders();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      router.push('/');
    }
  }, [isAuthenticated, openLoginModal, router]);

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
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-[28px] font-bold text-[#1A1A1A]">
            {isRTL ? 'طلباتي' : 'My Orders'}
          </h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[#6B7280]">
              {isRTL ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-[#9CA3AF]" />
            </div>
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'لا توجد طلبات' : 'No orders yet'}
            </h2>
            <p className="text-[14px] text-[#6B7280] mb-6 text-center max-w-sm">
              {isRTL
                ? 'لم تقم بإجراء أي طلبات بعد. ابدأ التسوق الآن!'
                : 'You haven\'t placed any orders yet. Start shopping now!'}
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
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
                className="block bg-[#F9FAFB] rounded-[16px] p-5 hover:bg-[#F0F1F3] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Order Image */}
                  <div className="w-[80px] h-[80px] rounded-[12px] bg-white overflow-hidden flex-shrink-0">
                    {order.firstItemImage ? (
                      <Image
                        src={order.firstItemImage}
                        alt="Order"
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-[#D1D5DB]" />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#1A1A1A]">
                          {order.orderNumber}
                        </h3>
                        <p className="text-[13px] text-[#6B7280]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} isRTL={isRTL} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[13px] text-[#6B7280]">
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
                          "w-5 h-5 text-[#9CA3AF]",
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
