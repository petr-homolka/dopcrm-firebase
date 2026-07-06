/**
 * NativeBits.jsx — drobné sdílené prvky mobilní appky (DESIGN.md §12.4).
 * Vzniklo při redesignu v3 (2026-07-05): SectionLabel, NativeChip,
 * NativeEmptyState a StatTile žily zkopírované v pěti obrazovkách, každá
 * s trochu jinými velikostmi — přesně to dělalo appku „upatlanou".
 * Odteď VÝHRADNĚ odsud; lokální kopie jsou zakázané.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

/** Sekční nadpis nad kartami — 13px uppercase muted (§12.2). */
export function SectionLabel({ children, className }) {
  return (
    <p className={cn('mb-2 mt-6 text-[13px] font-semibold uppercase tracking-wide text-native-textMuted', className)}>
      {children}
    </p>
  );
}

const CHIP_TONE = {
  primary: 'bg-native-primary/15 text-native-primary',
  warning: 'bg-native-warning/15 text-native-warning',
  danger: 'bg-native-danger/15 text-native-danger',
  muted: 'bg-native-textMuted/15 text-native-textMuted',
};

/** Stavový chip — tint /15, pill, 12px semibold (§12.4). */
export function NativeChip({ tone = 'muted', children, className }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold', CHIP_TONE[tone], className)}>
      {children}
    </span>
  );
}

/** Prázdný stav — VŽDY s radou co dál (§12.5), volitelně CTA přes children. */
export function NativeEmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-native-card bg-native-surface px-6 py-10 text-center">
      {Icon && <Icon size={28} strokeWidth={1.75} className="text-native-textMuted" />}
      <p className="text-[15px] font-medium text-native-text">{title}</p>
      {description && <p className="text-[13px] text-native-textMuted">{description}</p>}
      {children && <div className="mt-2 w-full">{children}</div>}
    </div>
  );
}

const STAT_TONE = {
  primary: 'text-native-primary',
  warning: 'text-native-warning',
  danger: 'text-native-danger',
  text: 'text-native-text',
};

/**
 * Mobilní přemapování barevného proužku události: `visit` je na desktopu
 * zelený (shift-visit), ale mobil je BEZ zelené (§12.1) — návštěva zde nese
 * primární modrou. Ostatní typy si nechávají sémantické barvy z
 * EVENT_BORDER_CLASS (rozlišitelnost dle §8 nesmí regresovat).
 */
// eslint-disable-next-line react-refresh/only-export-components -- datová konstanta vedle komponent (stejný vzor jako MVP_NAV v router.jsx)
export const NATIVE_EVENT_BORDER = { visit: 'border-native-primary' };

/** Statistická dlaždice — velké tučné číslo tam, kde má číslo váhu (Connecteam vzor). */
export function StatTile({ label, value, sub, tone = 'text' }) {
  return (
    <div className="flex-1 rounded-native-card bg-native-surface p-4">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-native-textMuted">{label}</p>
      <p className={cn('mt-1 text-[28px] font-bold leading-tight tabular-nums', STAT_TONE[tone])}>{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-native-textMuted">{sub}</p>}
    </div>
  );
}
