'use client';

/**
 * Checkout Page - Matching Flutter Checkout Flow
 *
 * Features:
 * - Address selection from saved addresses
 * - Add new address option
 * - Delivery fee display based on address
 * - Coupon code input
 * - Tip selection (if enabled)
 * - Payment method selection
 * - Order summary
 * - Place order functionality
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, MapPin, Plus, Loader2,
  CreditCard, Wallet, Banknote, Tag, Gift, AlertCircle,
  Check, ChevronDown, Pencil, ShoppingBag
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCart, useApplyCoupon, useSyncCartBeforeCheckout } from '@/lib/services/cart';
import { useMyAddresses } from '@/lib/services/address';
import { useStoreSettings } from '@/lib/services/store-settings';
import {
  useGetValidOrderId,
  useCheckout,
  useCheckoutInfo,
  useDeliveryFee,
} from '@/lib/services/order';
import { cn } from '@/lib/utils';
import type { Address } from '@/lib/services/address';
import type { CheckoutRequest } from '@/types/order';

// Tip presets in EGP
const TIP_PRESETS = [0, 5, 10, 15, 20];

// Payment methods (3 = Cash on Delivery)
const PAYMENT_METHODS = [
  { id: 3, key: 'cod', icon: Banknote, labelEn: 'Cash on Delivery', labelAr: 'الدفع عند الاستلام' },
  // { id: 1, key: 'card', icon: CreditCard, labelEn: 'Credit Card', labelAr: 'بطاقة ائتمان' },
  // { id: 2, key: 'wallet', icon: Wallet, labelEn: 'E-Wallet', labelAr: 'المحفظة' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslations();
  const { isAuthenticated, user, openLoginModal } = useAuth();

  // Fetch data
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useMyAddresses();
  const { data: storeSettings } = useStoreSettings();
  const { data: checkoutInfo, isLoading: checkoutInfoLoading } = useCheckoutInfo();

  // Mutations
  const getValidOrderId = useGetValidOrderId();
  const checkout = useCheckout();
  const applyCoupon = useApplyCoupon();
  const syncCart = useSyncCartBeforeCheckout();

  // State
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(3); // Default COD
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Get delivery fee for selected address
  const { data: deliveryFeeData } = useDeliveryFee(selectedAddressId);

  // Check if tips are enabled
  const tipsEnabled = storeSettings?.enableDeliveryTips ?? false;

  // Set default address on load
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

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

  // Get selected address
  const selectedAddress = addresses?.find(a => a.id === selectedAddressId);

  // Calculate totals
  const subtotal = checkoutInfo?.subtotal || cart?.summary?.subtotal || 0;
  const discount = checkoutInfo?.discount || cart?.summary?.discount || 0;
  const couponDiscount = couponApplied ? (checkoutInfo?.couponDiscount || cart?.summary?.couponDiscount || 0) : 0;
  const deliveryFee = deliveryFeeData?.deliveryFee || checkoutInfo?.deliveryFee || 0;
  const tip = selectedTip || (customTip ? parseFloat(customTip) || 0 : 0);
  const total = subtotal - discount - couponDiscount + deliveryFee + tip;

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponError('');
    try {
      await applyCoupon.mutateAsync(couponCode.trim());
      setCouponApplied(true);
    } catch (error: any) {
      setCouponError(error.message || (isRTL ? 'الكوبون غير صالح' : 'Invalid coupon code'));
    }
  };

  // Handle tip selection
  const handleTipSelect = (amount: number) => {
    setSelectedTip(amount);
    setCustomTip('');
  };

  // Handle custom tip
  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    setSelectedTip(0);
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setSubmitError(isRTL ? 'يرجى اختيار عنوان التوصيل' : 'Please select a delivery address');
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setSubmitError(isRTL ? 'السلة فارغة' : 'Cart is empty');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Step 1: CRITICAL - Sync cart with server before checkout (Flutter parity)
      console.log('[Checkout] Step 1: Syncing cart with server...');
      await syncCart.mutateAsync(cart.items);
      console.log('[Checkout] Cart synced successfully');

      // Step 2: Get valid order ID
      const orderId = await getValidOrderId.mutateAsync();
      console.log('[Checkout] Got valid order ID:', orderId);

      // Step 3: Prepare checkout request
      const checkoutRequest: CheckoutRequest = {
        id: orderId,
        addressId: selectedAddressId,
        orderEznMemo: orderNote.trim() || undefined,
        orderTipVal: tip,
        couponDisVal: couponDiscount,
        deliveryFee: deliveryFee,
        paymentMethod: paymentMethod,
        inviteeDisVal: 0, // Not used for now
        finalAmount: total,
      };

      console.log('[Checkout] Submitting order:', checkoutRequest);

      // Step 4: Submit checkout
      const result = await checkout.mutateAsync(checkoutRequest);
      console.log('[Checkout] Order placed:', result);

      // Step 5: Navigate to success page
      router.push(`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber || ''}`);
    } catch (error: any) {
      console.error('[Checkout] Error:', error);
      setSubmitError(error.message || (isRTL ? 'حدث خطأ أثناء إتمام الطلب' : 'Failed to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const isLoading = cartLoading || addressesLoading || checkoutInfoLoading;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            <p className="mt-4 text-[#6B7280]">
              {isRTL ? 'جاري التحميل...' : 'Loading checkout...'}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/cart"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-[28px] font-bold text-[#1A1A1A]">
            {isRTL ? 'إتمام الطلب' : 'Checkout'}
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                    {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
                  </h2>
                </div>
                <Link
                  href="/addresses"
                  className="text-[13px] font-medium hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {isRTL ? 'إدارة العناوين' : 'Manage addresses'}
                </Link>
              </div>

              {/* Address Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-[12px] border border-[#E5E5E5] hover:border-[var(--color-primary)] transition-colors"
                >
                  {selectedAddress ? (
                    <div className="flex-1 text-left">
                      <p className="text-[14px] font-medium text-[#1A1A1A]">
                        {selectedAddress.addressName}
                      </p>
                      <p className="text-[13px] text-[#6B7280] mt-0.5">
                        {selectedAddress.street}
                        {selectedAddress.areaName && `, ${selectedAddress.areaName}`}
                        {selectedAddress.cityName && `, ${selectedAddress.cityName}`}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[14px] text-[#9CA3AF]">
                      {isRTL ? 'اختر عنوان التوصيل' : 'Select delivery address'}
                    </span>
                  )}
                  <ChevronDown className={cn(
                    "w-5 h-5 text-[#6B7280] transition-transform",
                    showAddressDropdown && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Menu */}
                {showAddressDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[12px] border border-[#E5E5E5] shadow-lg z-10 overflow-hidden">
                    {addresses?.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => {
                          setSelectedAddressId(address.id);
                          setShowAddressDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 text-left hover:bg-[#F5F5F7] transition-colors",
                          selectedAddressId === address.id && "bg-[#F5F5F7]"
                        )}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-[#6B7280]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-[#1A1A1A]">
                            {address.addressName}
                          </p>
                          <p className="text-[13px] text-[#6B7280] truncate">
                            {address.street}
                            {address.areaName && `, ${address.areaName}`}
                          </p>
                        </div>
                        {selectedAddressId === address.id && (
                          <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </button>
                    ))}

                    {/* Add New Address */}
                    <Link
                      href="/addresses/new"
                      className="flex items-center gap-3 p-4 border-t border-[#E5E5E5] hover:bg-[#F5F5F7] transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary-light, #E8F5E9)' }}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="text-[14px] font-medium">
                        {isRTL ? 'إضافة عنوان جديد' : 'Add new address'}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Section */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                  {isRTL ? 'كود الخصم' : 'Discount Code'}
                </h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                  }}
                  placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter coupon code'}
                  disabled={couponApplied}
                  className={cn(
                    "flex-1 h-[48px] px-4 rounded-[10px] border text-[14px] outline-none transition-colors",
                    "focus:border-[var(--color-primary)]",
                    couponApplied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-[#E5E5E5]"
                  )}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || couponApplied || applyCoupon.isPending}
                  className={cn(
                    "h-[48px] px-6 rounded-[10px] text-[14px] font-medium transition-colors",
                    couponApplied
                      ? "bg-green-500 text-white"
                      : "bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
                  )}
                >
                  {applyCoupon.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : couponApplied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    isRTL ? 'تطبيق' : 'Apply'
                  )}
                </button>
              </div>

              {couponError && (
                <p className="mt-2 text-[13px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {couponError}
                </p>
              )}

              {couponApplied && (
                <p className="mt-2 text-[13px] text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  {isRTL ? 'تم تطبيق الكوبون بنجاح' : 'Coupon applied successfully'}
                </p>
              )}
            </div>

            {/* Tip Section (if enabled) */}
            {tipsEnabled && (
              <div className="bg-[#F9FAFB] rounded-[16px] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                    {isRTL ? 'إكرامية التوصيل' : 'Delivery Tip'}
                  </h2>
                </div>

                <p className="text-[13px] text-[#6B7280] mb-4">
                  {isRTL
                    ? 'أضف إكرامية لمندوب التوصيل'
                    : 'Add a tip for your delivery driver'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {TIP_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleTipSelect(amount)}
                      className={cn(
                        "h-[42px] px-5 rounded-full text-[14px] font-medium transition-colors",
                        selectedTip === amount && !customTip
                          ? "text-white"
                          : "bg-white border border-[#E5E5E5] text-[#1A1A1A] hover:border-[var(--color-primary)]"
                      )}
                      style={
                        selectedTip === amount && !customTip
                          ? { backgroundColor: 'var(--color-primary)' }
                          : undefined
                      }
                    >
                      {amount === 0
                        ? (isRTL ? 'بدون' : 'No tip')
                        : formatPrice(amount)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[#6B7280]">
                    {isRTL ? 'مبلغ آخر:' : 'Custom:'}
                  </span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => handleCustomTipChange(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-[100px] h-[42px] px-3 rounded-[10px] border border-[#E5E5E5] text-[14px] text-center outline-none focus:border-[var(--color-primary)]"
                  />
                  <span className="text-[14px] text-[#6B7280]">
                    {isRTL ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Method Section */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                  {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                </h2>
              </div>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-[12px] border transition-colors",
                        paymentMethod === method.id
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-light,#E8F5E9)]"
                          : "border-[#E5E5E5] bg-white hover:border-[var(--color-primary)]"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        paymentMethod === method.id
                          ? "bg-[var(--color-primary)]"
                          : "bg-[#F0F0F0]"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          paymentMethod === method.id ? "text-white" : "text-[#6B7280]"
                        )} />
                      </div>
                      <span className="text-[14px] font-medium text-[#1A1A1A]">
                        {isRTL ? method.labelAr : method.labelEn}
                      </span>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 ml-auto" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Note Section */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Pencil className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-[16px] font-semibold text-[#1A1A1A]">
                  {isRTL ? 'ملاحظات الطلب' : 'Order Notes'}
                </h2>
              </div>

              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder={isRTL ? 'أضف ملاحظات للطلب (اختياري)' : 'Add notes for your order (optional)'}
                rows={3}
                className="w-full p-4 rounded-[12px] border border-[#E5E5E5] text-[14px] outline-none focus:border-[var(--color-primary)] resize-none"
              />
            </div>
          </div>

          {/* Order Summary - Fixed Sidebar */}
          <div className="w-[320px] flex-shrink-0">
            <div className="sticky top-4 bg-[#F9FAFB] rounded-[20px] p-6">
              <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-4">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h2>

              {/* Cart Items Preview */}
              <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
                {cart?.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-[50px] h-[50px] rounded-[8px] bg-white overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={isRTL ? item.nameAr : item.name}
                          width={50}
                          height={50}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-[#D1D5DB]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">
                        {isRTL ? item.nameAr : item.name}
                      </p>
                      <p className="text-[12px] text-[#6B7280]">
                        x{item.quantity}
                      </p>
                    </div>
                    <span className="text-[13px] font-medium text-[#1A1A1A]">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
                {cart?.items && cart.items.length > 3 && (
                  <p className="text-[12px] text-[#6B7280] text-center pt-2">
                    {isRTL
                      ? `+ ${cart.items.length - 3} منتجات أخرى`
                      : `+ ${cart.items.length - 3} more items`}
                  </p>
                )}
              </div>

              <div className="border-t border-[#E5E5E5] pt-4 space-y-3 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#6B7280]">
                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span className="font-medium text-[#1A1A1A]">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">
                      {isRTL ? 'الخصم' : 'Discount'}
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}

                {/* Coupon Discount */}
                {couponApplied && couponDiscount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">
                      {isRTL ? 'خصم الكوبون' : 'Coupon'}
                    </span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(couponDiscount)}
                    </span>
                  </div>
                )}

                {/* Delivery Fee */}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#6B7280]">
                    {isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}
                  </span>
                  <span className="font-medium text-[#1A1A1A]">
                    {deliveryFee > 0 ? formatPrice(deliveryFee) : (isRTL ? 'مجاني' : 'Free')}
                  </span>
                </div>

                {/* Tip */}
                {tipsEnabled && tip > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#6B7280]">
                      {isRTL ? 'الإكرامية' : 'Tip'}
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {formatPrice(tip)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-[#E5E5E5] pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[16px] font-bold text-[#1A1A1A]">
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span
                    className="text-[20px] font-bold"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mb-4 p-3 rounded-[10px] bg-red-50 text-red-600 text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !selectedAddressId}
                className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isRTL ? 'جاري إتمام الطلب...' : 'Placing order...'}
                  </>
                ) : (
                  isRTL ? 'تأكيد الطلب' : 'Place Order'
                )}
              </button>

              {/* Back to Cart Link */}
              <Link
                href="/cart"
                className="block text-center mt-4 text-[14px] text-[#6B7280] hover:text-[var(--color-primary)] transition-colors"
              >
                {isRTL ? 'العودة للسلة' : 'Back to Cart'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
