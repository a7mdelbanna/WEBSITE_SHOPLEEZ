'use client';

/**
 * Profile Page
 *
 * Main profile page displaying:
 * - User avatar, name, email
 * - Wallet balance badge
 * - Account menu (Orders, Transactions, Favorites, Loyalty)
 * - Settings menu (Password, Language, Notifications, Text Size)
 * - Support menu (Help & Support)
 * - Logout and Delete Account actions
 *
 * Based on Flutter app Profile module documentation.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Receipt,
  Heart,
  Gift,
  Lock,
  Globe,
  Bell,
  Type,
  Headphones,
  Share2,
  LogOut,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useTranslations } from '@/lib/hooks/use-translations';
import { useAuth } from '@/lib/contexts/auth-context';
import { useProfile, useDeleteAccount } from '@/lib/services/auth';
import { useWallet } from '@/lib/services/profile';
import { ProfileHeader, ProfileLoginRequired } from '@/components/profile/profile-header';
import { MenuSection, MenuItem, MenuButton } from '@/components/profile/profile-menu';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { t, isRTL } = useTranslations();
  const { isAuthenticated, logout, openLoginModal, isLoading: authLoading } = useAuth();

  // Fetch profile and wallet data
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const deleteAccountMutation = useDeleteAccount();

  // Local state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isLoading = authLoading || profileLoading || walletLoading;

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Not authenticated - show login required
  if (!authLoading && !isAuthenticated) {
    return (
      <AppShell>
        <div className="flex-1 min-w-0 bg-[#F5F5F7] px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-[#F0F0F0] transition-colors"
            >
              <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
            </Link>
            <h1 className="text-[24px] font-bold text-[#1A1A1A]">
              {isRTL ? 'الملف الشخصي' : 'Profile'}
            </h1>
          </div>

          <ProfileLoginRequired onLogin={openLoginModal} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex-1 min-w-0 bg-[#F5F5F7] px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-[#F0F0F0] transition-colors"
          >
            <BackIcon className="w-5 h-5 text-[#1A1A1A]" />
          </Link>
          <h1 className="text-[24px] font-bold text-[#1A1A1A]">
            {isRTL ? 'الملف الشخصي' : 'Profile'}
          </h1>
        </div>

        {/* Profile Header Card */}
        <ProfileHeader
          fullName={profile?.fullName}
          email={profile?.email}
          walletBalance={wallet?.data?.balance || 0}
          isLoading={isLoading}
        />

        {/* Account Section */}
        <MenuSection title={isRTL ? 'الحساب' : 'Account'}>
          <MenuItem
            icon={ShoppingBag}
            label={isRTL ? 'طلباتي' : 'My Orders'}
            href="/orders"
          />
          <MenuItem
            icon={Receipt}
            label={isRTL ? 'سجل المعاملات' : 'Transactions History'}
            href="/profile/transactions"
          />
          <MenuItem
            icon={Heart}
            label={isRTL ? 'المفضلة' : 'Favorites'}
            href="/profile/favorites"
          />
          <MenuItem
            icon={Gift}
            label={isRTL ? 'نقاط الولاء' : 'Loyalty Points'}
            href="/profile/loyalty"
            badge={profile?.myPoints}
            badgeColor="var(--color-primary)"
          />
        </MenuSection>

        {/* Settings Section */}
        <MenuSection title={isRTL ? 'الإعدادات' : 'Settings'}>
          <MenuItem
            icon={Lock}
            label={isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
            href="/profile/change-password"
          />
          <MenuItem
            icon={Globe}
            label={isRTL ? 'اللغة' : 'Language'}
            href="/profile/language"
          />
          <MenuItem
            icon={Bell}
            label={isRTL ? 'الإشعارات' : 'Notifications'}
            href="/profile/notifications"
          />
          <MenuItem
            icon={Type}
            label={isRTL ? 'حجم النص' : 'Text Size'}
            href="/profile/text-size"
          />
        </MenuSection>

        {/* Support Section */}
        <MenuSection title={isRTL ? 'الدعم' : 'Support'}>
          <MenuItem
            icon={Headphones}
            label={isRTL ? 'المساعدة والدعم' : 'Help & Support'}
            href="/profile/chatbot"
          />
          <MenuItem
            icon={Share2}
            label={isRTL ? 'دعوة صديق' : 'Refer & Earn'}
            href="/profile/referral"
          />
        </MenuSection>

        {/* Action Buttons */}
        <div className="space-y-[12px] mt-[32px]">
          {/* Logout Button */}
          <MenuButton
            label={isRTL ? 'تسجيل الخروج' : 'Logout'}
            variant="primary"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          />

          {/* Delete Account Button */}
          <MenuButton
            label={isRTL ? 'حذف الحساب' : 'Delete Account'}
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          />
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className={cn(
              "bg-white rounded-[20px] p-[24px] mx-4 max-w-[400px] w-full",
              "animate-in fade-in zoom-in-95 duration-200"
            )}>
              {/* Warning Icon */}
              <div className="w-[64px] h-[64px] mx-auto rounded-full bg-[#FEE2E2] flex items-center justify-center mb-[16px]">
                <AlertTriangle className="w-[32px] h-[32px] text-[#F44336]" />
              </div>

              {/* Title */}
              <h3 className="text-[18px] font-bold text-[#1A1A1A] text-center mb-[8px]">
                {isRTL ? 'حذف الحساب' : 'Delete Account'}
              </h3>

              {/* Description */}
              <p className="text-[14px] text-[#6B7280] text-center mb-[24px]">
                {isRTL
                  ? 'هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Are you sure you want to delete your account? This action cannot be undone.'}
              </p>

              {/* Buttons */}
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-[14px] rounded-[12px] text-[16px] font-semibold text-[#1A1A1A] bg-[#F5F5F7] hover:bg-[#ECECEC] transition-colors"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                  className="flex-1 py-[14px] rounded-[12px] text-[16px] font-semibold text-white bg-[#F44336] hover:bg-[#E53935] transition-colors disabled:opacity-50"
                >
                  {deleteAccountMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                  ) : (
                    isRTL ? 'حذف' : 'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
