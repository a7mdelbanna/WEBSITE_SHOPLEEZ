'use client';

/**
 * Login Modal Component
 *
 * Multi-step authentication flow matching Flutter app EXACTLY:
 *
 * NEW USER FLOW:
 *   Phone → Create Password → Registration (name) → Add Address → Confirm Location → Success
 *
 * EXISTING USER FLOW:
 *   Phone → Password/OTP Verification → Success
 *
 * Design specs from Design System:
 * - Gray input background (#F0F0F0)
 * - Brand color buttons
 * - 20px border radius
 * - RTL support
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Phone, ArrowLeft, ArrowRight, Loader2, CheckCircle2,
  Eye, EyeOff, Lock, User, MapPin, ChevronDown, Navigation
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/modal';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useStoreSettings } from '@/lib/services/store-settings';
import {
  useLoginByPhone,
  useVerifyOtp,
  useResendOtp,
  useRegisterUser,
} from '@/lib/services/auth';
import {
  useCities,
  useAreas,
  useCreateAddress,
  useConfirmLocation,
  type City,
  type Area,
} from '@/lib/services/address';
import { cn } from '@/lib/utils';

// Steps in the auth flow - matching Flutter exactly
type Step =
  | 'phone'            // Enter phone number
  | 'otp'              // Enter OTP code (when OTP auth enabled)
  | 'password'         // Enter password (when OTP auth disabled, user exists)
  | 'create-password'  // Create new password (when OTP auth disabled, new user)
  | 'register'         // Enter name details (firstName, lastName)
  | 'add-address'      // Enter address (city, area, street, detailed address) - NEW
  | 'confirm-location' // Confirm location on map with lat/lng - NEW
  | 'success';         // Success state

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth();
  const { t, isRTL, localize } = useTranslations();

  // Fetch store settings to determine auth flow (OTP vs Password)
  const { data: storeSettings } = useStoreSettings();
  const useOtpAuth = storeSettings?.enableOTPAuthentication ?? true;

  // Step state
  const [step, setStep] = useState<Step>('phone');

  // Phone & Auth state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Address state
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [street, setStreet] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [addressId, setAddressId] = useState<number | null>(null);

  // Location state (for confirm-location step)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // Mutations
  const loginByPhone = useLoginByPhone();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const registerUser = useRegisterUser();
  const createAddress = useCreateAddress();
  const confirmLocation = useConfirmLocation();

  // Queries
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: areas = [], isLoading: areasLoading } = useAreas(selectedCity?.id || null);

  // Reset state when modal closes
  useEffect(() => {
    if (!loginModalOpen) {
      const timer = setTimeout(() => {
        setStep('phone');
        setPhoneNumber('');
        setOtp('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setFirstName('');
        setLastName('');
        setSelectedCity(null);
        setSelectedArea(null);
        setStreet('');
        setDetailedAddress('');
        setAddressId(null);
        setUserLocation(null);
        setError('');
        setResendTimer(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loginModalOpen]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ============== STEP HANDLERS ==============

  /**
   * Step 1: Phone submission
   */
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setError(isRTL ? 'يرجى إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return;
    }

    try {
      const result = await loginByPhone.mutateAsync({ phoneNumber });
      console.log('[LoginModal] Login result:', result);

      const tokens = result.data;
      const message = result.result?.message || '';

      if (tokens?.accessToken && tokens?.refreshToken) {
        login({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn || 3600 });
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      } else if (message.includes('OTP send Successfully') || message.includes('OTP')) {
        setStep(useOtpAuth ? 'otp' : 'password');
        if (useOtpAuth) setResendTimer(60);
      }
    } catch (err: any) {
      const errorMessage = err?.message || '';
      const errorData = err?.data;

      console.log('[LoginModal] Login error:', { errorMessage, errorData });

      if (errorData?.isVerified === false || errorMessage.toLowerCase().includes('not verified') || errorMessage.toLowerCase().includes('not veified')) {
        setStep(useOtpAuth ? 'otp' : 'password');
        if (useOtpAuth) setResendTimer(60);
        return;
      }

      if (errorMessage.toLowerCase().includes('not found') || errorMessage.includes('لم يتم العثور') || errorMessage.toLowerCase().includes('user was not found')) {
        setStep(useOtpAuth ? 'register' : 'create-password');
        return;
      }

      setError(errorMessage || t('errors.generic'));
    }
  };

  /**
   * Step 2a: Password verification
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 4) {
      setError(isRTL ? 'كلمة المرور مطلوبة' : 'Password is required');
      return;
    }

    try {
      const result = await verifyOtp.mutateAsync({ phoneNumber, otp: password, password });
      console.log('[LoginModal] Password verification result:', result);

      const tokens = result.data;
      if (tokens?.accessToken && tokens?.refreshToken) {
        login({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn || 3600 });
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      } else {
        const loginResult = await loginByPhone.mutateAsync({ phoneNumber });
        const loginTokens = loginResult.data;
        if (loginTokens?.accessToken && loginTokens?.refreshToken) {
          login({ accessToken: loginTokens.accessToken, refreshToken: loginTokens.refreshToken, expiresIn: loginTokens.expiresIn || 3600 });
        }
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      }
    } catch (err: any) {
      console.log('[LoginModal] Password error:', err);
      setError(err?.message || (isRTL ? 'كلمة المرور غير صحيحة' : 'Invalid password'));
    }
  };

  /**
   * Step 2b: OTP verification
   */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError(isRTL ? 'يرجى إدخال رمز التحقق' : 'Please enter the verification code');
      return;
    }

    try {
      const result = await verifyOtp.mutateAsync({ phoneNumber, otp });
      console.log('[LoginModal] OTP result:', result);

      const data = result.data;
      if (data?.isNewUser) {
        setStep('register');
      } else if (data?.accessToken && data?.refreshToken) {
        login({ accessToken: data.accessToken, refreshToken: data.refreshToken, expiresIn: data.expiresIn || 3600 });
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      }
    } catch (err: any) {
      console.log('[LoginModal] OTP error:', err);
      setError(err?.message || (isRTL ? 'رمز التحقق غير صحيح' : 'Invalid verification code'));
    }
  };

  /**
   * Step 3: Create Password (new user)
   */
  const handleCreatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 8) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setStep('register');
  };

  /**
   * Step 4: Registration (name fields only)
   * After this, go to add-address step
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError(isRTL ? 'يرجى إدخال الاسم الأول والأخير' : 'Please enter first and last name');
      return;
    }

    const registrationPassword = password || 'DefaultPass123!';

    try {
      const result = await registerUser.mutateAsync({
        phoneNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: registrationPassword,
      });

      console.log('[LoginModal] Registration result:', result);

      const tokens = result.data;
      if (tokens?.accessToken && tokens?.refreshToken) {
        login({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn || 3600 });
        // After registration, go to add-address step (matching Flutter flow)
        setStep('add-address');
      } else {
        await new Promise(resolve => setTimeout(resolve, 100));
        setStep('add-address');
      }
    } catch (err: any) {
      console.log('[LoginModal] Registration error:', err);
      setError(err?.message || t('errors.generic'));
    }
  };

  /**
   * Step 5: Add Address
   * Collect city, area, street, detailed address
   */
  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCity) {
      setError(isRTL ? 'يرجى اختيار المدينة' : 'Please select a city');
      return;
    }
    if (!selectedArea) {
      setError(isRTL ? 'يرجى اختيار المنطقة' : 'Please select an area');
      return;
    }
    if (!detailedAddress.trim()) {
      setError(isRTL ? 'يرجى إدخال العنوان التفصيلي' : 'Please enter detailed address');
      return;
    }

    try {
      const result = await createAddress.mutateAsync({
        addressName: isRTL ? 'عنواني' : 'My address',
        cityId: String(selectedCity.id),
        areaId: String(selectedArea.id),
        street: street.trim() || detailedAddress.trim(),
        detailedAddress: detailedAddress.trim(),
        isForMe: true,
      });

      console.log('[LoginModal] Address created:', result);
      setAddressId(result.addressId);

      // Go to confirm location step
      setStep('confirm-location');
    } catch (err: any) {
      console.log('[LoginModal] Address error:', err);
      setError(err?.message || t('errors.generic'));
    }
  };

  /**
   * Step 6: Confirm Location
   * Get user's GPS location and send to API
   */
  const handleGetLocation = useCallback(() => {
    setIsLocating(true);
    setError('');

    if (!navigator.geolocation) {
      setError(isRTL ? 'الموقع غير مدعوم في متصفحك' : 'Geolocation is not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.log('[LoginModal] Geolocation error:', err);
        setError(isRTL ? 'تعذر الحصول على موقعك' : 'Could not get your location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isRTL]);

  const handleConfirmLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userLocation) {
      setError(isRTL ? 'يرجى تحديد موقعك أولاً' : 'Please get your location first');
      return;
    }

    if (!addressId) {
      setError(isRTL ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
      return;
    }

    try {
      await confirmLocation.mutateAsync({
        addressId,
        locationLat: String(userLocation.lat),
        locationLong: String(userLocation.lng),
      });

      console.log('[LoginModal] Location confirmed!');
      setStep('success');
      setTimeout(closeLoginModal, 1500);
    } catch (err: any) {
      console.log('[LoginModal] Confirm location error:', err);
      setError(err?.message || t('errors.generic'));
    }
  };

  /**
   * Skip location confirmation (optional)
   */
  const handleSkipLocation = () => {
    setStep('success');
    setTimeout(closeLoginModal, 1500);
  };

  /**
   * Resend OTP
   */
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp.mutateAsync(phoneNumber);
      setResendTimer(60);
      setError('');
    } catch (err: any) {
      setError(err?.message || t('errors.generic'));
    }
  };

  /**
   * Go back handler
   */
  const handleBack = () => {
    setError('');
    switch (step) {
      case 'otp':
      case 'password':
        setStep('phone');
        setOtp('');
        setPassword('');
        break;
      case 'create-password':
        setStep('phone');
        setPassword('');
        setConfirmPassword('');
        break;
      case 'register':
        setStep(useOtpAuth ? 'otp' : 'create-password');
        break;
      case 'add-address':
        setStep('register');
        break;
      case 'confirm-location':
        setStep('add-address');
        break;
    }
  };

  const isLoading = loginByPhone.isPending || verifyOtp.isPending || registerUser.isPending || createAddress.isPending || confirmLocation.isPending;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // ============== RENDER ==============

  const getStepTitle = () => {
    switch (step) {
      case 'phone': return t('auth.login');
      case 'otp': return t('auth.otp');
      case 'password': return isRTL ? 'أدخل كلمة المرور' : 'Enter Password';
      case 'create-password': return isRTL ? 'إنشاء كلمة المرور' : 'Create Password';
      case 'register': return t('auth.register');
      case 'add-address': return isRTL ? 'إضافة عنوان' : 'Add Address';
      case 'confirm-location': return isRTL ? 'تأكيد الموقع' : 'Confirm Location';
      case 'success': return '';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'otp': return t('auth.otpSent');
      case 'password': return isRTL ? 'يرجى إدخال كلمة المرور للمتابعة' : 'Please enter your password to continue';
      case 'create-password': return isRTL ? 'أنشئ كلمة مرور لحسابك الجديد' : 'Create a password for your new account';
      case 'add-address': return isRTL ? 'أضف عنوان التوصيل الخاص بك' : 'Add your delivery address';
      case 'confirm-location': return isRTL ? 'حدد موقعك الدقيق على الخريطة' : 'Confirm your exact location';
      default: return undefined;
    }
  };

  // Dropdown helper for city/area selection
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
      <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-[52px] rounded-[16px] bg-[#F0F0F0] px-4",
          "flex items-center justify-between",
          "text-[15px] text-[#1A1A1A]",
          "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
          "transition-all"
        )}
      >
        <span className={!value ? "text-[#9CA3AF]" : ""}>
          {value ? localize({ en: (value as any).nameEn || (value as any).name, ar: (value as any).nameAr || (value as any).name }) : placeholder}
        </span>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-[#6B7280]" />
        ) : (
          <ChevronDown className={cn("h-5 w-5 text-[#6B7280] transition-transform", isOpen && "rotate-180")} />
        )}
      </button>
      {isOpen && items.length > 0 && (
        <div className="absolute z-50 mt-2 w-full max-h-[200px] overflow-y-auto rounded-[16px] bg-white shadow-lg border border-[#E5E5E5]">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left text-[15px] hover:bg-[#F5F5F5] transition-colors",
                "first:rounded-t-[16px] last:rounded-b-[16px]"
              )}
            >
              {localize({ en: (item as any).nameEn || item.name, ar: (item as any).nameAr || item.name })}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={loginModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent size="sm" className="p-0 overflow-hidden rounded-[20px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <DialogHeader className="mb-0">
            {step !== 'phone' && step !== 'success' && (
              <button
                onClick={handleBack}
                className={cn(
                  "absolute top-4 flex h-10 w-10 items-center justify-center rounded-full",
                  "bg-[#F0F0F0] hover:bg-[#E8E8E8] transition-colors",
                  isRTL ? "right-4" : "left-4"
                )}
              >
                <BackIcon className="h-5 w-5 text-[#1A1A1A]" />
              </button>
            )}
            <DialogTitle className="text-center text-[22px] font-bold text-[#1A1A1A]">
              {getStepTitle()}
            </DialogTitle>
            {getStepDescription() && (
              <DialogDescription className="text-center text-[14px] text-[#6B7280] mt-2">
                {getStepDescription()}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Phone Step */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{t('auth.phone')}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}>
                    <Phone className="h-5 w-5" />
                    <span className="text-[15px] font-medium">+20</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('auth.phonePlaceholder')}
                    className={cn(
                      "w-full h-[52px] rounded-full bg-[#F0F0F0]",
                      "text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF]",
                      "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                      isRTL ? "pr-[100px] pl-4" : "pl-[100px] pr-4"
                    )}
                    dir="ltr"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className={cn(
                  "w-full h-[52px] rounded-full text-white text-[16px] font-semibold",
                  "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                )}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.next')}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2 text-center">{t('auth.otpPlaceholder')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full h-[52px] rounded-full bg-[#F0F0F0] text-[24px] text-[#1A1A1A] text-center tracking-[0.5em] font-bold placeholder-[#D0D0D0] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  dir="ltr"
                  autoFocus
                  maxLength={6}
                />
              </div>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-[13px] text-[#6B7280]">{t('auth.resendOtp')} ({resendTimer}s)</p>
                ) : (
                  <button type="button" onClick={handleResendOtp} disabled={resendOtp.isPending} className="text-[13px] font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                    {resendOtp.isPending ? <Loader2 className="h-4 w-4 animate-spin inline" /> : t('auth.resendOtp')}
                  </button>
                )}
              </div>
              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={isLoading || otp.length < 4} className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('auth.verifyOtp')}
              </button>
            </form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><Lock className="h-5 w-5" /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                    className={cn("w-full h-[52px] rounded-full bg-[#F0F0F0] text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]", isRTL ? "pr-[52px] pl-[52px]" : "pl-[52px] pr-[52px]")}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn("absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#6B7280]", isRTL ? "left-2" : "right-2")}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={isLoading || !password} className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRTL ? 'تأكيد' : 'Submit')}
              </button>
            </form>
          )}

          {/* Create Password Step */}
          {step === 'create-password' && (
            <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><Lock className="h-5 w-5" /></div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'} className={cn("w-full h-[52px] rounded-full bg-[#F0F0F0] text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]", isRTL ? "pr-[52px] pl-[52px]" : "pl-[52px] pr-[52px]")} autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={cn("absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#6B7280]", isRTL ? "left-2" : "right-2")}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
                {password && password.length < 8 && <p className="text-[12px] text-red-500 mt-1">{isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'}</p>}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><Lock className="h-5 w-5" /></div>
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter password'} className={cn("w-full h-[52px] rounded-full bg-[#F0F0F0] text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]", isRTL ? "pr-[52px] pl-[52px]" : "pl-[52px] pr-[52px]")} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={cn("absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#6B7280]", isRTL ? "left-2" : "right-2")}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
                {confirmPassword && password !== confirmPassword && <p className="text-[12px] text-red-500 mt-1">{isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}</p>}
              </div>
              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={!password || password.length < 8 || password !== confirmPassword} className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>{t('common.next')}</button>
            </form>
          )}

          {/* Registration Step */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'الاسم الأول' : 'First Name'}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><User className="h-5 w-5" /></div>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={isRTL ? 'أدخل اسمك الأول' : 'Enter first name'} className={cn("w-full h-[52px] rounded-full bg-[#F0F0F0] text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]", isRTL ? "pr-[52px] pl-4" : "pl-[52px] pr-4")} autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'الاسم الأخير' : 'Last Name'}</label>
                <div className="relative">
                  <div className={cn("absolute top-1/2 -translate-y-1/2 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><User className="h-5 w-5" /></div>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={isRTL ? 'أدخل اسمك الأخير' : 'Enter last name'} className={cn("w-full h-[52px] rounded-full bg-[#F0F0F0] text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]", isRTL ? "pr-[52px] pl-4" : "pl-[52px] pr-4")} />
                </div>
              </div>
              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
              <button type="submit" disabled={isLoading || !firstName.trim() || !lastName.trim()} className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--color-primary)' }}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.next')}
              </button>
            </form>
          )}

          {/* Add Address Step */}
          {step === 'add-address' && (
            <form onSubmit={handleAddAddressSubmit} className="space-y-4">
              {/* City Dropdown */}
              {renderDropdown(
                isRTL ? 'المدينة' : 'City',
                selectedCity,
                cities,
                (city) => {
                  setSelectedCity(city as City);
                  setSelectedArea(null);
                },
                showCityDropdown,
                setShowCityDropdown,
                citiesLoading,
                isRTL ? 'اختر المدينة' : 'Select city'
              )}

              {/* Area Dropdown */}
              {renderDropdown(
                isRTL ? 'المنطقة' : 'Area',
                selectedArea,
                areas,
                (area) => setSelectedArea(area as Area),
                showAreaDropdown,
                setShowAreaDropdown,
                areasLoading,
                isRTL ? 'اختر المنطقة' : 'Select area'
              )}

              {/* Street (optional) */}
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'الشارع (اختياري)' : 'Street (optional)'}</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={isRTL ? 'اسم الشارع' : 'Street name'}
                  className="w-full h-[52px] rounded-[16px] bg-[#F0F0F0] px-4 text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">{isRTL ? 'العنوان التفصيلي' : 'Detailed Address'}</label>
                <div className="relative">
                  <div className={cn("absolute top-4 text-[#6B7280]", isRTL ? "right-4" : "left-4")}><MapPin className="h-5 w-5" /></div>
                  <textarea
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder={isRTL ? 'رقم المبنى، الطابق، شقة، علامة مميزة...' : 'Building number, floor, apartment, landmark...'}
                    rows={3}
                    className={cn(
                      "w-full rounded-[16px] bg-[#F0F0F0] py-3 text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none",
                      isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                    )}
                  />
                </div>
              </div>

              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !selectedCity || !selectedArea || !detailedAddress.trim()}
                className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.next')}
              </button>
            </form>
          )}

          {/* Confirm Location Step */}
          {step === 'confirm-location' && (
            <form onSubmit={handleConfirmLocationSubmit} className="space-y-4">
              {/* Map placeholder / Location status */}
              <div className="bg-[#F0F0F0] rounded-[20px] p-6 flex flex-col items-center justify-center min-h-[200px]">
                {userLocation ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-[16px] font-semibold text-[#1A1A1A] mb-2">
                      {isRTL ? 'تم تحديد موقعك' : 'Location detected'}
                    </p>
                    <p className="text-[13px] text-[#6B7280] text-center">
                      {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#E5E5E5] flex items-center justify-center mb-4">
                      <Navigation className="h-8 w-8 text-[#6B7280]" />
                    </div>
                    <p className="text-[14px] text-[#6B7280] text-center mb-4">
                      {isRTL ? 'اضغط على الزر أدناه لتحديد موقعك' : 'Click the button below to get your location'}
                    </p>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="px-6 py-3 rounded-full text-white text-[14px] font-medium flex items-center gap-2"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {isLocating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Navigation className="h-5 w-5" />
                      )}
                      {isRTL ? 'تحديد موقعي' : 'Get My Location'}
                    </button>
                  </>
                )}
              </div>

              {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !userLocation}
                className="w-full h-[52px] rounded-full text-white text-[16px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isRTL ? 'تأكيد الموقع' : 'Confirm Location')}
              </button>

              {/* Skip button */}
              <button
                type="button"
                onClick={handleSkipLocation}
                className="w-full h-[44px] rounded-full text-[#6B7280] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors"
              >
                {isRTL ? 'تخطي الآن' : 'Skip for now'}
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <p className="text-[18px] font-semibold text-[#1A1A1A]">
                {isRTL ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
