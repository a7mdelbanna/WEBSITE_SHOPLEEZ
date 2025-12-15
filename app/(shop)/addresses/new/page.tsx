'use client';

/**
 * Add New Address Page
 *
 * Standalone address creation page for checkout flow.
 * Extracted from login-modal.tsx address form.
 *
 * Features:
 * - Dynamic mode detection (ByArea vs ByDistance)
 * - City/Area dropdowns or text inputs based on mode
 * - Customer fields (building, floor, apartment)
 * - "For Someone Else" toggle with recipient fields
 * - Full validation matching login modal
 * - RTL support
 * - Navigates back to checkout on success
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Loader2,
  MapPin,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useStoreSettings } from '@/lib/services/store-settings';
import { useProfile } from '@/lib/services/auth';
import {
  useCities,
  useAreas,
  useCreateCustomerAddressByArea,
  useCreateCustomerAddressByDistance,
  useConfirmLocation,
  type City,
  type Area,
  type AddressMode,
} from '@/lib/services/address';
import { MapLocationPicker } from '@/components/maps/map-location-picker';
import { cn } from '@/lib/utils';

export default function AddAddressPage() {
  const router = useRouter();
  const { isRTL, locale } = useTranslations();
  const { isAuthenticated, openLoginModal } = useAuth();
  const { data: profile } = useProfile(isAuthenticated);
  const { data: storeSettings } = useStoreSettings();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal();
      router.push('/checkout');
    }
  }, [isAuthenticated, openLoginModal, router]);

  // Determine address mode from store settings
  const [addressMode, setAddressMode] = useState<AddressMode>('ByArea');

  useEffect(() => {
    if (storeSettings?.deliveryFeeType) {
      setAddressMode(storeSettings.deliveryFeeType as AddressMode);
    }
  }, [storeSettings]);

  // Form state - Address fields
  const [addressName, setAddressName] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [cityText, setCityText] = useState(''); // ByDistance mode
  const [areaText, setAreaText] = useState(''); // ByDistance mode
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Form state - "For Someone Else" toggle
  const [isForOther, setIsForOther] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientLastName, setRecipientLastName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // UI state
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location state (for map picker)
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressIdForConfirmation, setAddressIdForConfirmation] = useState<number | null>(null);
  const [isConfirmingLocation, setIsConfirmingLocation] = useState(false);

  // API hooks
  const { data: cities = [], isLoading: citiesLoading } = useCities(addressMode === 'ByArea');
  const { data: areas = [], isLoading: areasLoading } = useAreas(selectedCity?.id, addressMode === 'ByArea');
  const createAddressByArea = useCreateCustomerAddressByArea();
  const createAddressByDistance = useCreateCustomerAddressByDistance();
  const confirmLocation = useConfirmLocation();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Helper to localize city/area names
  const localize = (item: { en?: string; ar?: string }) => {
    return isRTL ? (item.ar || item.en || '') : (item.en || item.ar || '');
  };

  // Dropdown renderer (copied from login-modal.tsx)
  const renderDropdown = (
    label: string,
    value: City | Area | null,
    items: (City | Area)[],
    onSelect: (item: City | Area) => void,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    loading: boolean,
    placeholder: string
  ) => (
    <div className="relative">
      <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-[52px] rounded-[16px] bg-[var(--color-bg-input)] px-4",
          "flex items-center justify-between",
          "text-[15px] text-[var(--color-gray-900)]",
          "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
          "transition-all"
        )}
      >
        <span className={!value ? "text-[var(--color-gray-400)]" : ""}>
          {value ? localize({ en: (value as any).nameEn || (value as any).name, ar: (value as any).nameAr || (value as any).name }) : placeholder}
        </span>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-gray-500)]" />
        ) : (
          <ChevronDown className={cn("h-5 w-5 text-[var(--color-gray-500)] transition-transform", isOpen && "rotate-180")} />
        )}
      </button>
      {isOpen && items.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-h-[200px] overflow-y-auto rounded-[16px] bg-white shadow-lg border border-[var(--color-border)]">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left text-[15px] hover:bg-[var(--color-gray-50)] transition-colors",
                "first:rounded-t-[16px] last:rounded-b-[16px]",
                isRTL && "text-right"
              )}
            >
              {localize({ en: (item as any).nameEn || item.name, ar: (item as any).nameAr || item.name })}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Validation
  const validateForm = (): { isValid: boolean; error: string } => {
    // Address name required
    if (!addressName.trim()) {
      return { isValid: false, error: isRTL ? 'اسم العنوان مطلوب' : 'Address name is required' };
    }

    // City/Area validation (mode-dependent)
    if (addressMode === 'ByArea') {
      if (!selectedCity) {
        return { isValid: false, error: isRTL ? 'المدينة مطلوبة' : 'City is required' };
      }
      if (!selectedArea) {
        return { isValid: false, error: isRTL ? 'المنطقة مطلوبة' : 'Area is required' };
      }
    } else {
      if (!cityText.trim()) {
        return { isValid: false, error: isRTL ? 'المدينة مطلوبة' : 'City is required' };
      }
      if (!areaText.trim()) {
        return { isValid: false, error: isRTL ? 'المنطقة مطلوبة' : 'Area is required' };
      }
    }

    // Street required
    if (!street.trim()) {
      return { isValid: false, error: isRTL ? 'الشارع مطلوب' : 'Street is required' };
    }

    // Recipient validation (when isForOther = true)
    if (isForOther) {
      if (!recipientName.trim()) {
        return { isValid: false, error: isRTL ? 'اسم المستلم مطلوب' : 'Recipient name is required' };
      }
      if (!recipientLastName.trim()) {
        return { isValid: false, error: isRTL ? 'اسم عائلة المستلم مطلوب' : 'Recipient last name is required' };
      }
      if (!recipientPhone.trim()) {
        return { isValid: false, error: isRTL ? 'رقم هاتف المستلم مطلوب' : 'Recipient phone is required' };
      }
      if (!/^\+?[0-9]{10,15}$/.test(recipientPhone)) {
        return { isValid: false, error: isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number' };
      }
    }

    return { isValid: true, error: '' };
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build request based on mode
      if (addressMode === 'ByArea') {
        // ByArea mode - use IDs
        const request = {
          addressName: addressName.trim(),
          cityId: String(selectedCity!.id),
          areaId: String(selectedArea!.id),
          street: street.trim(),
          building: building.trim(),
          floor: floor.trim(),
          apartment: apartment.trim(),
          deliveryNotes: deliveryNotes.trim(),
          isForMe: !isForOther,
          ...(isForOther && {
            name: recipientName.trim(),
            lastName: recipientLastName.trim(),
            phone: recipientPhone.trim(),
          }),
        };

        const result = await createAddressByArea.mutateAsync(request);

        // NEW: Store addressId and show map picker
        const addressId = result?.data?.addressId || result?.addressId || result?.id;
        console.log('[AddAddress] Address created:', result);
        console.log('[AddAddress] Address ID:', addressId);

        if (addressId) {
          setAddressIdForConfirmation(addressId);
          setShowMapPicker(true); // Show map instead of navigating
        } else {
          console.error('[AddAddress] No addressId in response:', result);
          setError(isRTL ? 'حدث خطأ، لم يتم إرجاع معرف العنوان' : 'Error: No address ID returned');
        }
      } else {
        // ByDistance mode - use text values
        const request = {
          addressName: addressName.trim(),
          cityId: cityText.trim(),
          areaId: areaText.trim(),
          street: street.trim(),
          building: building.trim(),
          floor: floor.trim(),
          apartment: apartment.trim(),
          deliveryNotes: deliveryNotes.trim(),
          isForMe: !isForOther,
          ...(isForOther && {
            name: recipientName.trim(),
            lastName: recipientLastName.trim(),
            phone: recipientPhone.trim(),
          }),
        };

        const result = await createAddressByDistance.mutateAsync(request);

        // NEW: Store addressId and show map picker
        const addressId = result?.data?.addressId || result?.addressId || result?.id;
        console.log('[AddAddress] Address created:', result);
        console.log('[AddAddress] Address ID:', addressId);

        if (addressId) {
          setAddressIdForConfirmation(addressId);
          setShowMapPicker(true); // Show map instead of navigating
        } else {
          console.error('[AddAddress] No addressId in response:', result);
          setError(isRTL ? 'حدث خطأ، لم يتم إرجاع معرف العنوان' : 'Error: No address ID returned');
        }
      }
    } catch (err: any) {
      console.error('Address creation error:', err);
      setError(err?.message || (isRTL ? 'حدث خطأ أثناء إضافة العنوان' : 'Error adding address'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Location confirmation handler
  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      setError(isRTL ? 'يرجى تحديد موقعك على الخريطة' : 'Please select your location on the map');
      return;
    }

    if (!addressIdForConfirmation) {
      setError(isRTL ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
      return;
    }

    setIsConfirmingLocation(true);

    try {
      await confirmLocation.mutateAsync({
        addressId: addressIdForConfirmation,
        locationLat: String(selectedLocation.lat),   // API expects string!
        locationLong: String(selectedLocation.lng),  // API expects string!
      });

      console.log('[AddAddress] Location confirmed successfully');
      // Success - navigate back to checkout
      router.push('/checkout');
    } catch (err: any) {
      console.error('Location confirmation error:', err);
      setError(err?.message || (isRTL ? 'خطأ في تأكيد الموقع' : 'Error confirming location'));
    } finally {
      setIsConfirmingLocation(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-white rounded-2xl px-6 py-6 mx-2 my-2">
        {!showMapPicker ? (
          // View 1: Address Form
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/checkout"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gray-50)] hover:bg-[#ECECEC] transition-colors"
              >
                <BackIcon className="w-5 h-5 text-[var(--color-gray-900)]" />
              </Link>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                <h1 className="text-[28px] font-bold text-[var(--color-gray-900)]">
                  {isRTL ? 'إضافة عنوان جديد' : 'Add New Address'}
                </h1>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[16px]">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Address Name */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">
              {isRTL ? 'اسم العنوان' : 'Address Name'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
              placeholder={isRTL ? 'مثال: المنزل، العمل' : 'e.g., Home, Office'}
              className={cn(
                "w-full h-[52px] rounded-[16px] bg-[var(--color-bg-input)] px-4",
                "text-[15px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                isRTL && "text-right"
              )}
            />
          </div>

          {/* City - Mode-dependent (Dropdown or Text Input) */}
          {addressMode === 'ByArea' ? (
            renderDropdown(
              (isRTL ? 'المدينة' : 'City') + ' *',
              selectedCity,
              cities,
              (city) => {
                setSelectedCity(city as City);
                setSelectedArea(null); // Reset area when city changes
              },
              showCityDropdown,
              setShowCityDropdown,
              citiesLoading,
              isRTL ? 'اختر المدينة' : 'Select city'
            )
          ) : (
            <div>
              <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">
                {isRTL ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cityText}
                onChange={(e) => setCityText(e.target.value)}
                placeholder={isRTL ? 'أدخل اسم المدينة' : 'Enter city name'}
                className={cn(
                  "w-full h-[52px] rounded-[16px] bg-[var(--color-bg-input)] px-4",
                  "text-[15px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                  "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                  isRTL && "text-right"
                )}
              />
            </div>
          )}

          {/* Area - Mode-dependent (Dropdown or Text Input) */}
          {addressMode === 'ByArea' ? (
            renderDropdown(
              (isRTL ? 'المنطقة' : 'Area') + ' *',
              selectedArea,
              areas,
              (area) => setSelectedArea(area as Area),
              showAreaDropdown,
              setShowAreaDropdown,
              areasLoading,
              isRTL ? 'اختر المنطقة' : 'Select area'
            )
          ) : (
            <div>
              <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">
                {isRTL ? 'المنطقة' : 'Area'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={areaText}
                onChange={(e) => setAreaText(e.target.value)}
                placeholder={isRTL ? 'أدخل اسم المنطقة' : 'Enter area name'}
                className={cn(
                  "w-full h-[52px] rounded-[16px] bg-[var(--color-bg-input)] px-4",
                  "text-[15px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                  "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                  isRTL && "text-right"
                )}
              />
            </div>
          )}

          {/* Street */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">
              {isRTL ? 'الشارع' : 'Street'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder={isRTL ? 'أدخل اسم الشارع' : 'Enter street name'}
              className={cn(
                "w-full h-[52px] rounded-[16px] bg-[var(--color-bg-input)] px-4",
                "text-[15px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                isRTL && "text-right"
              )}
            />
          </div>

          {/* Building, Floor, Apartment - Customer only */}
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[var(--color-gray-900)] mb-2">
                {isRTL ? 'المبنى' : 'Building'}
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder={isRTL ? 'رقم' : 'No.'}
                className={cn(
                  "w-full h-[48px] rounded-[12px] bg-[var(--color-bg-input)] px-3",
                  "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                  "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                  isRTL && "text-right"
                )}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[var(--color-gray-900)] mb-2">
                {isRTL ? 'الطابق' : 'Floor'}
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder={isRTL ? 'رقم' : 'No.'}
                className={cn(
                  "w-full h-[48px] rounded-[12px] bg-[var(--color-bg-input)] px-3",
                  "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                  "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                  isRTL && "text-right"
                )}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-medium text-[var(--color-gray-900)] mb-2">
                {isRTL ? 'الشقة' : 'Apartment'}
              </label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder={isRTL ? 'رقم' : 'No.'}
                className={cn(
                  "w-full h-[48px] rounded-[12px] bg-[var(--color-bg-input)] px-3",
                  "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                  "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                  isRTL && "text-right"
                )}
              />
            </div>
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="block text-[14px] font-medium text-[var(--color-gray-900)] mb-2">
              {isRTL ? 'ملاحظات التوصيل' : 'Delivery Notes'}
            </label>
            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder={isRTL ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
              rows={3}
              className={cn(
                "w-full rounded-[16px] bg-[var(--color-bg-input)] px-4 py-3",
                "text-[15px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                "resize-none",
                isRTL && "text-right"
              )}
            />
          </div>

          {/* "For Someone Else" Toggle */}
          <div className="bg-[var(--color-gray-50)] rounded-[16px] p-4">
            <div className={cn("flex items-center justify-between mb-3", isRTL && "flex-row-reverse")}>
              <span className="text-[14px] font-medium text-[var(--color-gray-900)]">
                {isRTL ? 'هذا العنوان لشخص آخر' : "This is someone else's address"}
              </span>
              <button
                type="button"
                onClick={() => setIsForOther(!isForOther)}
                className={cn(
                  "relative w-[44px] h-[24px] rounded-full transition-colors",
                  isForOther ? "bg-[var(--color-primary)]" : "bg-[#D1D5DB]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform shadow-sm",
                    isForOther
                      ? (isRTL ? "left-[2px]" : "right-[2px]")
                      : (isRTL ? "right-[2px]" : "left-[2px]")
                  )}
                />
              </button>
            </div>

            {/* Recipient Fields - shown when toggle is ON */}
            {isForOther && (
              <div className="space-y-3 pt-3 border-t border-[#E5E7EB]">
                <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={isRTL ? 'الاسم الأول *' : 'First Name *'}
                      className={cn(
                        "w-full h-[48px] rounded-[12px] bg-white px-3",
                        "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                        "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                        "border border-[#E5E7EB]",
                        isRTL && "text-right"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={recipientLastName}
                      onChange={(e) => setRecipientLastName(e.target.value)}
                      placeholder={isRTL ? 'اسم العائلة *' : 'Last Name *'}
                      className={cn(
                        "w-full h-[48px] rounded-[12px] bg-white px-3",
                        "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                        "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                        "border border-[#E5E7EB]",
                        isRTL && "text-right"
                      )}
                    />
                  </div>
                </div>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder={isRTL ? 'رقم الهاتف *' : 'Phone Number *'}
                  className={cn(
                    "w-full h-[48px] rounded-[12px] bg-white px-3",
                    "text-[14px] text-[var(--color-gray-900)] placeholder-[var(--color-gray-400)]",
                    "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                    "border border-[#E5E7EB]",
                    isRTL && "text-right"
                  )}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className={cn("flex gap-3 pt-4", isRTL && "flex-row-reverse")}>
            <Link
              href="/checkout"
              className={cn(
                "flex-1 h-[52px] rounded-full",
                "flex items-center justify-center",
                "text-[16px] font-semibold",
                "bg-[var(--color-gray-50)] text-[var(--color-gray-900)]",
                "hover:bg-[#ECECEC] transition-colors"
              )}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 h-[52px] rounded-full",
                "flex items-center justify-center gap-2",
                "text-[16px] font-semibold text-white",
                "bg-[var(--color-primary)]",
                "hover:opacity-90 transition-opacity",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                isRTL ? 'حفظ العنوان' : 'Save Address'
              )}
            </button>
          </div>
        </form>
          </>
        ) : (
          // View 2: Map Picker
          <>
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setShowMapPicker(false)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-gray-50)] hover:bg-[#ECECEC] transition-colors"
              >
                <BackIcon className="w-5 h-5 text-[var(--color-gray-900)]" />
              </button>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[var(--color-primary)]" />
                <h1 className="text-[28px] font-bold text-[var(--color-gray-900)]">
                  {isRTL ? 'حدد موقعك على الخريطة' : 'Select Your Location'}
                </h1>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[16px]">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Map Container */}
            <div className="relative rounded-[20px] overflow-hidden border-2 border-[var(--color-border)] mb-6">
              <MapLocationPicker
                initialCenter={{
                  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT || '30.0444'),
                  lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG || '31.2357'),
                }}
                onLocationSelect={setSelectedLocation}
                selectedLocation={selectedLocation}
                isRTL={isRTL}
              />
            </div>

            {/* Coordinates Display */}
            {selectedLocation && (
              <div className="bg-[var(--color-gray-50)] rounded-[16px] p-4 mb-6">
                <p className="text-[14px] font-medium text-[var(--color-gray-500)] mb-1">
                  {isRTL ? 'الإحداثيات المحددة' : 'Selected Coordinates'}
                </p>
                <p className="text-[16px] font-semibold text-[var(--color-gray-900)]">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
              <button
                onClick={() => setShowMapPicker(false)}
                className="flex-1 h-[52px] rounded-full bg-[var(--color-gray-50)] text-[var(--color-gray-900)] text-[16px] font-semibold hover:bg-[#ECECEC] transition-colors"
              >
                {isRTL ? 'رجوع' : 'Back'}
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation || isConfirmingLocation}
                className="flex-1 h-[52px] rounded-full bg-[var(--color-primary)] text-white text-[16px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConfirmingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isRTL ? 'جاري التأكيد...' : 'Confirming...'}
                  </>
                ) : (
                  isRTL ? 'تأكيد الموقع' : 'Confirm Location'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
