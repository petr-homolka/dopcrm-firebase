/**
 * NativeListRow.jsx + NativeGroupedList.jsx — iOS "grouped list" (STRICT
 * UI/UX DESIGN MANDATE §3C, 2026-07-05). Separator je 1px linka, která
 * NEDOSAHUJE k levému okraji — začíná až za ikonou. Řešeno tak, že border
 * patří vnitřnímu flex-1 divu (obsah), ne celému řádku — ikona je mimo něj,
 * takže border ho neprotíná. Chevron vpravo = jde na to kliknout dál.
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';

export function NativeGroupedList({ children }) {
  return <div className="overflow-hidden rounded-native-card bg-native-surface">{children}</div>;
}

export function NativeListRow({ icon: Icon, iconBg, label, trailing, onClick, danger, showChevron = true, isLast = false }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg">
      {Icon && (
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', iconBg ?? 'bg-native-textMuted')}>
          <Icon size={16} strokeWidth={2} className="text-white" />
        </span>
      )}
      <div className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', !isLast && 'border-b border-native-separator')}>
        <span className={cn('flex-1 truncate text-[17px]', danger ? 'text-native-danger font-medium' : 'text-native-text')}>
          {label}
        </span>
        {trailing}
        {showChevron && !danger && <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />}
      </div>
    </button>
  );
}
