'use client';

/**
 * Bot Choice Chips Component
 *
 * Displays clickable choice chips for bot messages.
 * Matches Flutter's BotChoiceChipsMobile implementation exactly.
 */

import { cn } from '@/lib/utils';

interface ChoiceChipsProps {
  choices: string[];
  onChoiceSelected: (index: number, choiceText: string) => void;
  isRTL: boolean;
}

export function ChoiceChips({ choices, onChoiceSelected, isRTL }: ChoiceChipsProps) {
  if (!choices || choices.length === 0) {
    return null;
  }

  // Filter out empty choices for display
  const nonEmptyChoices = choices.filter(choice => choice.trim() !== '');
  const hasEmptyChoices = choices.some(choice => choice.trim() === '');

  if (nonEmptyChoices.length === 0) {
    return null;
  }

  // Instruction label
  const instructionText = hasEmptyChoices
    ? (isRTL ? 'اختر خياراً أو اكتب رسالة' : 'Select an option or type')
    : (isRTL ? 'الرجاء اختيار خيار' : 'Please select an option');

  return (
    <div className={cn("px-4 py-3", isRTL && "text-right")}>
      {/* Instruction Label */}
      <p className="text-[12px] font-medium text-[#6B7280] mb-2">
        {instructionText}
      </p>

      {/* Choice Chips */}
      <div className="flex flex-wrap gap-2">
        {nonEmptyChoices.map((choice, displayIndex) => {
          // Get original index from full choices array
          const originalIndex = choices.indexOf(choice);

          return (
            <button
              key={originalIndex}
              onClick={() => onChoiceSelected(originalIndex, choice)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px]",
                "bg-[var(--color-primary)] bg-opacity-10 border border-[var(--color-primary)] border-opacity-30",
                "hover:bg-opacity-20 transition-all",
                "text-[14px] font-medium text-[var(--color-primary)]",
                isRTL && "flex-row-reverse"
              )}
            >
              {/* Dot indicator */}
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />

              {/* Choice text */}
              <span className="whitespace-normal text-left">
                {choice}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
