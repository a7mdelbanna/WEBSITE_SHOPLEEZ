'use client';

/**
 * Login Modal Component
 *
 * Multi-step authentication flow:
 * 1. Phone number entry
 * 2. OTP verification
 * 3. Registration (if new user)
 *
 * Design specs from Design System:
 * - Gray input background (#F0F0F0)
 * - Brand color buttons
 * - 20px border radius
 * - RTL support
 */

import { useState, useEffect, useCallback } from 'react';
import { Phone, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/modal';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTranslations } from '@/lib/hooks/use-translations';
import {
  useLoginByPhone,
  useVerifyOtp,
  useResendOtp,
  useRegisterUser,
} from '@/lib/services/auth';
import { cn } from '@/lib/utils';

type Step = 'phone' | 'otp' | 'register' | 'success';

export function LoginModal() {
  const { loginModalOpen, closeLoginModal, login } = useAuth();
  const { t, isRTL } = useTranslations();

  // Step state
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  // Mutations
  const loginByPhone = useLoginByPhone();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const registerUser = useRegisterUser();

  // Reset state when modal closes
  useEffect(() => {
    if (!loginModalOpen) {
      // Delay reset to allow for closing animation
      const timer = setTimeout(() => {
        setStep('phone');
        setPhoneNumber('');
        setOtp('');
        setFirstName('');
        setLastName('');
        setError('');
        setResendTimer(0);
        setIsNewUser(false);
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

  // Handle phone submission
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setError(t('errors.generic'));
      return;
    }

    try {
      const result = await loginByPhone.mutateAsync({ phoneNumber });

      if (result.requiresOtp) {
        setStep('otp');
        setResendTimer(60);
      } else if (result.token && result.refreshToken) {
        // Direct login (existing user with saved session)
        login({
          accessToken: result.token,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn || 3600,
        });
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      }

      if (result.isNewUser) {
        setIsNewUser(true);
      }
    } catch (err: any) {
      setError(err?.message || t('errors.generic'));
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError(t('errors.generic'));
      return;
    }

    try {
      const result = await verifyOtp.mutateAsync({ phoneNumber, otp });

      if (result.isNewUser) {
        setIsNewUser(true);
        setStep('register');
      } else if (result.token && result.refreshToken) {
        login(
          {
            accessToken: result.token,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn || 3600,
          },
          result.user
        );
        setStep('success');
        setTimeout(closeLoginModal, 1500);
      }
    } catch (err: any) {
      setError(err?.message || t('errors.generic'));
    }
  };

  // Handle registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError(t('errors.generic'));
      return;
    }

    try {
      const result = await registerUser.mutateAsync({
        phoneNumber,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      login(
        {
          accessToken: result.token,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn || 3600,
        },
        result.user
      );
      setStep('success');
      setTimeout(closeLoginModal, 1500);
    } catch (err: any) {
      setError(err?.message || t('errors.generic'));
    }
  };

  // Handle resend OTP
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

  // Go back handler
  const handleBack = () => {
    setError('');
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
    } else if (step === 'register') {
      setStep('otp');
    }
  };

  const isLoading = loginByPhone.isPending || verifyOtp.isPending || registerUser.isPending;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <Dialog open={loginModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent size="sm" className="p-0 overflow-hidden rounded-[20px]">
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
              {step === 'phone' && t('auth.login')}
              {step === 'otp' && t('auth.otp')}
              {step === 'register' && t('auth.register')}
              {step === 'success' && ''}
            </DialogTitle>
            {step === 'otp' && (
              <DialogDescription className="text-center text-[14px] text-[#6B7280] mt-2">
                {t('auth.otpSent')}
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
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">
                  {t('auth.phone')}
                </label>
                <div className="relative">
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#6B7280]",
                    isRTL ? "right-4" : "left-4"
                  )}>
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
                      "transition-all",
                      isRTL ? "pr-[100px] pl-4" : "pl-[100px] pr-4"
                    )}
                    dir="ltr"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-[13px] text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className={cn(
                  "w-full h-[52px] rounded-full text-white text-[16px] font-semibold",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('common.next')
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2 text-center">
                  {t('auth.otpPlaceholder')}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className={cn(
                    "w-full h-[52px] rounded-full bg-[#F0F0F0]",
                    "text-[24px] text-[#1A1A1A] text-center tracking-[0.5em] font-bold",
                    "placeholder-[#D0D0D0]",
                    "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                    "transition-all"
                  )}
                  dir="ltr"
                  autoFocus
                  maxLength={6}
                />
              </div>

              {/* Resend button */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-[13px] text-[#6B7280]">
                    {t('auth.resendOtp')} ({resendTimer}s)
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendOtp.isPending}
                    className="text-[13px] font-medium hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {resendOtp.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      t('auth.resendOtp')
                    )}
                  </button>
                )}
              </div>

              {error && (
                <p className="text-[13px] text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className={cn(
                  "w-full h-[52px] rounded-full text-white text-[16px] font-semibold",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('auth.verifyOtp')
                )}
              </button>
            </form>
          )}

          {/* Registration Step */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">
                  {isRTL ? 'الاسم الأول' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={isRTL ? 'أدخل اسمك الأول' : 'Enter first name'}
                  className={cn(
                    "w-full h-[52px] rounded-full bg-[#F0F0F0] px-5",
                    "text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF]",
                    "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                    "transition-all"
                  )}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-2">
                  {isRTL ? 'الاسم الأخير' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={isRTL ? 'أدخل اسمك الأخير' : 'Enter last name'}
                  className={cn(
                    "w-full h-[52px] rounded-full bg-[#F0F0F0] px-5",
                    "text-[15px] text-[#1A1A1A] placeholder-[#9CA3AF]",
                    "outline-none focus:ring-2 focus:ring-[var(--color-primary)]",
                    "transition-all"
                  )}
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !firstName.trim() || !lastName.trim()}
                className={cn(
                  "w-full h-[52px] rounded-full text-white text-[16px] font-semibold",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
                )}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('auth.register')
                )}
              </button>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
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
