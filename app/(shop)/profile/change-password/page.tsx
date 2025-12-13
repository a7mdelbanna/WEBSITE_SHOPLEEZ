'use client';

/**
 * Change Password Page
 *
 * Form to change user password.
 * Features:
 * - Current password field with visibility toggle
 * - New password field with validation indicators
 * - Confirm password field with match validation
 * - Password strength indicator
 * - Submit button with loading state
 * - RTL support
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useChangePassword } from '@/lib/services/auth';
import { cn } from '@/lib/utils';

// Password validation rules
const PASSWORD_RULES = [
  { id: 'length', check: (p: string) => p.length >= 8, labelEn: 'At least 8 characters', labelAr: '8 أحرف على الأقل' },
  { id: 'uppercase', check: (p: string) => /[A-Z]/.test(p), labelEn: 'One uppercase letter', labelAr: 'حرف كبير واحد' },
  { id: 'lowercase', check: (p: string) => /[a-z]/.test(p), labelEn: 'One lowercase letter', labelAr: 'حرف صغير واحد' },
  { id: 'number', check: (p: string) => /[0-9]/.test(p), labelEn: 'One number', labelAr: 'رقم واحد' },
];

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isRTL } = useTranslations();
  const { isAuthenticated, isLoading: authLoading, openLoginModal } = useAuth();
  const changePasswordMutation = useChangePassword();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  // Check password rules
  const passedRules = PASSWORD_RULES.filter(rule => rule.check(newPassword));
  const allRulesPassed = passedRules.length === PASSWORD_RULES.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && allRulesPassed && passwordsMatch;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) return;

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setSuccess(true);
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Redirect after delay
      setTimeout(() => router.push('/profile'), 2000);
    } catch (err: any) {
      setError(err?.message || (isRTL ? 'حدث خطأ' : 'An error occurred'));
    }
  };

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
            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
          </h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[12px] flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-[14px] text-green-800">
              {isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[20px] p-6">
          {/* Current Password */}
          <div className="mb-6">
            <label className={cn(
              "block text-[14px] font-medium text-[#1A1A1A] mb-2",
              isRTL && "text-right"
            )}>
              {isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                className={cn(
                  "w-full px-4 py-3 rounded-[12px] border border-[#E5E7EB]",
                  "text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
                  isRTL ? "text-right pr-4 pl-12" : "pl-4 pr-12"
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-2 text-[#9CA3AF] hover:text-[#6B7280]",
                  isRTL ? "left-2" : "right-2"
                )}
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className={cn(
              "block text-[14px] font-medium text-[#1A1A1A] mb-2",
              isRTL && "text-right"
            )}>
              {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                className={cn(
                  "w-full px-4 py-3 rounded-[12px] border border-[#E5E7EB]",
                  "text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent",
                  isRTL ? "text-right pr-4 pl-12" : "pl-4 pr-12"
                )}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-2 text-[#9CA3AF] hover:text-[#6B7280]",
                  isRTL ? "left-2" : "right-2"
                )}
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Rules */}
          <div className="mb-6 space-y-2">
            {PASSWORD_RULES.map((rule) => {
              const passed = rule.check(newPassword);
              return (
                <div
                  key={rule.id}
                  className={cn(
                    "flex items-center gap-2",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  {passed ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-[#9CA3AF]" />
                  )}
                  <span className={cn(
                    "text-[12px]",
                    passed ? "text-green-600" : "text-[#9CA3AF]"
                  )}>
                    {isRTL ? rule.labelAr : rule.labelEn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className={cn(
              "block text-[14px] font-medium text-[#1A1A1A] mb-2",
              isRTL && "text-right"
            )}>
              {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                className={cn(
                  "w-full px-4 py-3 rounded-[12px] border",
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "border-red-300 focus:ring-red-500"
                    : passwordsMatch
                      ? "border-green-300 focus:ring-green-500"
                      : "border-[#E5E7EB]",
                  "text-[14px] text-[#1A1A1A] placeholder:text-[#9CA3AF]",
                  "focus:outline-none focus:ring-2 focus:border-transparent",
                  isRTL ? "text-right pr-4 pl-12" : "pl-4 pr-12"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 p-2 text-[#9CA3AF] hover:text-[#6B7280]",
                  isRTL ? "left-2" : "right-2"
                )}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className={cn(
                "mt-2 text-[12px] text-red-600",
                isRTL && "text-right"
              )}>
                {isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-[12px]">
              <p className="text-[14px] text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || changePasswordMutation.isPending}
            className={cn(
              "w-full py-4 rounded-[12px] text-[16px] font-semibold text-white",
              "transition-all duration-200",
              canSubmit
                ? "bg-[var(--color-primary)] hover:opacity-90"
                : "bg-[#D1D5DB] cursor-not-allowed",
              "disabled:opacity-50"
            )}
          >
            {changePasswordMutation.isPending ? (
              <Loader2 className="w-5 h-5 mx-auto animate-spin" />
            ) : (
              isRTL ? 'تغيير كلمة المرور' : 'Change Password'
            )}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
