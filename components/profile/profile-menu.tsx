'use client';

/**
 * Profile Menu Components
 *
 * Reusable menu section and menu item components for the profile page.
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from '@/lib/hooks/use-translations';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Menu Section
// ============================================================================

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

export function MenuSection({ title, children }: MenuSectionProps) {
  const { isRTL } = useTranslations();

  return (
    <div className="mb-[24px]">
      <h3 className={cn(
        "text-[12px] font-semibold text-[var(--color-gray-400)] uppercase tracking-wider mb-[12px] px-[4px]",
        isRTL && "text-right"
      )}>
        {title}
      </h3>
      <div className="bg-white rounded-[16px] overflow-hidden divide-y divide-[var(--color-bg-input)]">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Menu Item (Link)
// ============================================================================

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  badgeColor?: string;
}

export function MenuItem({
  icon: Icon,
  label,
  href,
  onClick,
  badge,
  badgeColor = 'var(--color-primary)',
}: MenuItemProps) {
  const { isRTL } = useTranslations();

  const content = (
    <div className={cn(
      "flex items-center gap-[16px] px-[16px] py-[16px]",
      "hover:bg-[#F9FAFB] transition-colors cursor-pointer",
      isRTL && "flex-row-reverse"
    )}>
      {/* Icon */}
      <div className="w-[40px] h-[40px] rounded-[10px] bg-[var(--color-gray-50)] flex items-center justify-center">
        <Icon className="w-[20px] h-[20px] text-[var(--color-gray-500)]" />
      </div>

      {/* Label */}
      <span className={cn("flex-1 text-[14px] font-medium text-[var(--color-gray-900)]", isRTL && "text-right")}>
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && (
        <span
          className="px-[8px] py-[2px] rounded-full text-[11px] font-semibold text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
      )}

      {/* Arrow */}
      <ChevronRight
        className={cn("w-[18px] h-[18px] text-[var(--color-gray-400)]", isRTL && "rotate-180")}
      />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}

// ============================================================================
// Menu Button (Action)
// ============================================================================

interface MenuButtonProps {
  label: string;
  variant?: 'primary' | 'danger';
  onClick: () => void;
  isLoading?: boolean;
}

export function MenuButton({
  label,
  variant = 'primary',
  onClick,
  isLoading = false,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full py-[16px] rounded-[12px] text-[16px] font-semibold",
        "transition-opacity hover:opacity-90 disabled:opacity-50",
        variant === 'primary' && "bg-[var(--color-primary)] text-white",
        variant === 'danger' && "bg-transparent border-[1.5px] border-[#F44336] text-[#F44336]"
      )}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-[8px]">
          <span className="w-[16px] h-[16px] border-2 border-current border-t-transparent rounded-full animate-spin" />
          {label}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
