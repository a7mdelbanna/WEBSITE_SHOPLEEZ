'use client';

/**
 * Order Details Page
 *
 * Features:
 * - Order status timeline
 * - Order items list
 * - Delivery address
 * - Payment info
 * - Order summary
 * - Tip/Rating options (for delivered orders)
 * - Cancel option (for pending orders)
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import {
  Package, ArrowLeft, ArrowRight, Loader2, MapPin,
  Clock, CheckCircle, Truck, XCircle, CreditCard,
  Star, Gift, Phone, AlertCircle, ShoppingBag
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  useOrderDetails,
  useCancelOrder,
  useLeaveTip,
  useRateOrder,
} from '@/lib/services/order';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, {
  icon: typeof Clock;
  colorClass: string;
  bgClass: string;
  labelEn: string;
  labelAr: string;
}> = {
  Pending: { icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-50', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
  Confirmed: { icon: CheckCircle, colorClass: 'text-blue-600', bgClass: 'bg-blue-50', labelEn: 'Confirmed', labelAr: 'تم التأكيد' },
  Processing: { icon: Package, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50', labelEn: 'Processing', labelAr: 'جاري التحضير' },
  ReadyForDelivery: { icon: Package, colorClass: 'text-purple-600', bgClass: 'bg-purple-50', labelEn: 'Ready', labelAr: 'جاهز' },
  OutForDelivery: { icon: Truck, colorClass: 'text-cyan-600', bgClass: 'bg-cyan-50', labelEn: 'On the way', labelAr: 'في الطريق' },
  Delivered: { icon: CheckCircle, colorClass: 'text-green-600', bgClass: 'bg-green-50', labelEn: 'Delivered', labelAr: 'تم التوصيل' },
  Cancelled: { icon: XCircle, colorClass: 'text-red-600', bgClass: 'bg-red-50', labelEn: 'Cancelled', labelAr: 'ملغي' },
  Rejected: { icon: XCircle, colorClass: 'text-red-600', bgClass: 'bg-red-50', labelEn: 'Rejected', labelAr: 'مرفوض' },
  Refunded: { icon: XCircle, colorClass: 'text-gray-600', bgClass: 'bg-gray-50', labelEn: 'Refunded', labelAr: 'تم الاسترداد' },
};

// Status order for timeline
const STATUS_ORDER: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'ReadyForDelivery',
  'OutForDelivery',
  'Delivered',
];

// Tip presets
const TIP_PRESETS = [5, 10, 15, 20];

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isRTL } = useTranslations();
  const { isAuthenticated, openLoginModal } = useAuth();

  const orderId = params.id ? parseInt(params.id as string, 10) : null;

  // Fetch order details
  const { data: order, isLoading, error } = useOrderDetails(orderId);

  // Mutations
  const cancelOrder = useCancelOrder();
  const leaveTip = useLeaveTip();
  const rateOrder = useRateOrder();

  // State
  const [showTipSection, setShowTipSection] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showRatingSection, setShowRatingSection] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status index for timeline
  const getStatusIndex = (status: OrderStatus) => {
    return STATUS_ORDER.indexOf(status);
  };

  // Handle cancel order
  const handleCancelOrder = async () => {
    if (!orderId) return;
    if (!confirm(isRTL ? 'هل تريد إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder.mutateAsync(orderId);
      router.refresh();
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle tip submission
  const handleSubmitTip = async () => {
    if (!orderId || !selectedTip) return;

    try {
      await leaveTip.mutateAsync({ orderId, tipAmount: selectedTip });
      setShowTipSection(false);
      setSelectedTip(null);
    } catch (error) {
      console.error('Failed to leave tip:', error);
    }
  };

  // Handle rating submission
  const handleSubmitRating = async () => {
    if (!orderId || rating === 0) return;

    try {
      await rateOrder.mutateAsync({ orderId, rating, review: review.trim() || undefined });
      setShowRatingSection(false);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Failed to rate order:', error);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const canCancel = order && ['Pending', 'Confirmed'].includes(order.status);
  const isDelivered = order?.status === 'Delivered';
  const canTip = isDelivered && !order.tip;
  const canRate = isDelivered && !order.rating;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[#6B7280]">
              {isRTL ? 'جاري تحميل الطلب...' : 'Loading order...'}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!order) {
    return (
      <AppShell>
        <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-16 h-16 text-[#9CA3AF] mb-4" />
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-2">
              {isRTL ? 'الطلب غير موجود' : 'Order not found'}
            </h2>
            <Link
              href="/orders"
              className="mt-4 px-6 py-3 rounded-full text-white font-medium"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isRTL ? 'العودة للطلبات' : 'Back to Orders'}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusConfig.icon;

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
            >
              <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <div>
              <h1 className="text-[24px] font-bold text-[#1A1A1A]">
                {order.orderNumber}
              </h1>
              <p className="text-[13px] text-[#6B7280]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium",
            statusConfig.bgClass,
            statusConfig.colorClass
          )}>
            <StatusIcon className="w-4 h-4" />
            {isRTL ? statusConfig.labelAr : statusConfig.labelEn}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Status Timeline */}
            {!['Cancelled', 'Rejected', 'Refunded'].includes(order.status) && (
              <div className="bg-[#F9FAFB] rounded-[16px] p-5">
                <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
                  {isRTL ? 'حالة الطلب' : 'Order Status'}
                </h2>

                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-3 left-3 right-3 h-[2px] bg-[#E5E5E5]" />
                  <div
                    className="absolute top-3 h-[2px] transition-all duration-500"
                    style={{
                      left: '12px',
                      width: `calc(${(currentStatusIndex / (STATUS_ORDER.length - 1)) * 100}% - 24px)`,
                      backgroundColor: 'var(--color-primary)',
                    }}
                  />

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {STATUS_ORDER.map((status, index) => {
                      const config = STATUS_CONFIG[status];
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <div key={status} className="flex flex-col items-center">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
                              isCompleted
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                : "border-[#E5E5E5] bg-white"
                            )}
                          >
                            {isCompleted && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={cn(
                            "text-[11px] mt-2 text-center max-w-[60px]",
                            isCurrent ? "font-medium text-[#1A1A1A]" : "text-[#9CA3AF]"
                          )}>
                            {isRTL ? config.labelAr : config.labelEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
                {isRTL ? 'المنتجات' : 'Items'} ({order.itemCount})
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${item.itemId}-${index}`} className="flex gap-4 p-3 bg-white rounded-[12px]">
                    <div className="w-[70px] h-[70px] rounded-[8px] bg-[#F5F5F7] overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={isRTL ? item.nameAr : item.name}
                          width={70}
                          height={70}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-[#D1D5DB]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-2">
                        {isRTL ? item.nameAr : item.name}
                      </h3>
                      {(item.unitName || item.flavorName) && (
                        <p className="text-[12px] text-[#6B7280] mt-0.5">
                          {item.unitName && (isRTL ? item.unitNameAr : item.unitName)}
                          {item.flavorName && ` - ${isRTL ? item.flavorNameAr : item.flavorName}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[13px] text-[#6B7280]">
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </span>
                        <span className="text-[14px] font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                  {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
                </h2>
              </div>

              <div className="bg-white rounded-[12px] p-4">
                <p className="text-[14px] font-medium text-[#1A1A1A]">
                  {order.address.addressTitle}
                </p>
                <p className="text-[13px] text-[#6B7280] mt-1">
                  {order.address.fullAddress}
                </p>
              </div>
            </div>

            {/* Order Note */}
            {order.note && (
              <div className="bg-[#F9FAFB] rounded-[16px] p-5">
                <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-3">
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </h2>
                <p className="text-[14px] text-[#6B7280] bg-white rounded-[12px] p-4">
                  {order.note}
                </p>
              </div>
            )}

            {/* Tip Section (for delivered orders) */}
            {canTip && (
              <div className="bg-[#F9FAFB] rounded-[16px] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                    {isRTL ? 'إكرامية للمندوب' : 'Tip Your Driver'}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {TIP_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedTip(amount)}
                      className={cn(
                        "h-[42px] px-5 rounded-full text-[14px] font-medium transition-colors",
                        selectedTip === amount
                          ? "text-white"
                          : "bg-white border border-[#E5E5E5] text-[#1A1A1A]"
                      )}
                      style={selectedTip === amount ? { backgroundColor: 'var(--color-primary)' } : undefined}
                    >
                      {formatPrice(amount)}
                    </button>
                  ))}
                </div>

                {selectedTip && (
                  <button
                    onClick={handleSubmitTip}
                    disabled={leaveTip.isPending}
                    className="w-full h-[48px] rounded-full text-white font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {leaveTip.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      isRTL ? `إرسال ${formatPrice(selectedTip)} إكرامية` : `Send ${formatPrice(selectedTip)} Tip`
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Rating Section (for delivered orders) */}
            {canRate && (
              <div className="bg-[#F9FAFB] rounded-[16px] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                    {isRTL ? 'قيم طلبك' : 'Rate Your Order'}
                  </h2>
                </div>

                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-[#E5E5E5]"
                        )}
                      />
                    </button>
                  ))}
                </div>

                {rating > 0 && (
                  <>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder={isRTL ? 'أضف تعليقاً (اختياري)' : 'Add a comment (optional)'}
                      rows={3}
                      className="w-full p-3 rounded-[12px] border border-[#E5E5E5] text-[14px] mb-4 resize-none"
                    />

                    <button
                      onClick={handleSubmitRating}
                      disabled={rateOrder.isPending}
                      className="w-full h-[48px] rounded-full text-white font-medium disabled:opacity-50"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {rateOrder.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        isRTL ? 'إرسال التقييم' : 'Submit Rating'
                      )}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Cancel Button */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="w-full h-[52px] rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isCancelling ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  isRTL ? 'إلغاء الطلب' : 'Cancel Order'
                )}
              </button>
            )}
          </div>

          {/* Order Summary - Fixed Sidebar */}
          <div className="w-[320px] flex-shrink-0">
            <div className="sticky top-4 bg-[#F9FAFB] rounded-[20px] p-6">
              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-4">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              <div className="space-y-3 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#6B7280]">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium text-[#1A1A1A]">{formatPrice(order.subtotal)}</span>
                </div>

                {/* Discount */}
                {order.discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">{isRTL ? 'الخصم' : 'Discount'}</span>
                    <span className="font-medium text-green-600">-{formatPrice(order.discount)}</span>
                  </div>
                )}

                {/* Coupon */}
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">{isRTL ? 'خصم الكوبون' : 'Coupon'}</span>
                    <span className="font-medium text-green-600">-{formatPrice(order.couponDiscount)}</span>
                  </div>
                )}

                {/* Delivery */}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#6B7280]">{isRTL ? 'التوصيل' : 'Delivery'}</span>
                  <span className="font-medium text-[#1A1A1A]">
                    {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : (isRTL ? 'مجاني' : 'Free')}
                  </span>
                </div>

                {/* Tip */}
                {order.tip > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">{isRTL ? 'إكرامية' : 'Tip'}</span>
                    <span className="font-medium text-[#1A1A1A]">{formatPrice(order.tip)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[16px] font-bold text-[#1A1A1A]">
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span className="text-[20px] font-bold" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="flex items-center gap-3 p-4 bg-white rounded-[12px]">
                <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#6B7280]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280]">
                    {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                  </p>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">
                    {(order.paymentMethod === 'CashOnDelivery' || order.paymentMethod === 'CashOnDeliver')
                      ? (isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery')
                      : order.paymentMethod}
                  </p>
                </div>
                {order.isPaid && (
                  <span className="ml-auto px-2 py-1 bg-green-50 text-green-600 text-[11px] font-medium rounded-full">
                    {isRTL ? 'مدفوع' : 'Paid'}
                  </span>
                )}
              </div>

              {/* Existing Rating */}
              {order.rating && (
                <div className="mt-4 p-4 bg-white rounded-[12px]">
                  <p className="text-[12px] text-[#6B7280] mb-2">
                    {isRTL ? 'تقييمك' : 'Your Rating'}
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= order.rating!
                            ? "fill-amber-400 text-amber-400"
                            : "text-[#E5E5E5]"
                        )}
                      />
                    ))}
                  </div>
                  {order.review && (
                    <p className="text-[13px] text-[#6B7280] mt-2">
                      "{order.review}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
