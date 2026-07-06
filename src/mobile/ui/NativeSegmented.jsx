/**
 * NativeSegmented.jsx — horizontálně scrollovatelný pill-přepínač (STRICT
 * UI/UX DESIGN MANDATE, 2026-07-05). Použito pro sekundární přepínání UVNITŘ
 * obrazovky (taby detailu rodiny, filtry Osy) — NENÍ to hlavní navigace
 * (ta je výhradně spodní tab bar, mandát bod 2), proto je zde horizontální
 * scroll/swipe v pořádku (Apple HIG segmented control vzor).
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

// Dvě úrovně přepínačů (DESIGN.md §12.4): `primary` = hlavní taby obrazovky
// (aktivní plná modrá), `filter` = druhotné filtry (aktivní jen tint /15,
// menší). Dvě řady PLNÝCH pillů pod sebou byly vizuální šum — proto varianty.
const VARIANTS = {
  primary: {
    base: 'px-4 py-2 text-[15px] font-semibold',
    active: 'bg-native-primary text-white',
    inactive: 'bg-native-surface text-native-textMuted',
  },
  filter: {
    base: 'px-3 py-1.5 text-[13px] font-medium',
    active: 'bg-native-primary/15 text-native-primary',
    inactive: 'bg-transparent text-native-textMuted',
  },
};

export default function NativeSegmented({ items, value, onChange, variant = 'primary' }) {
  const v = VARIANTS[variant];
  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full transition-transform duration-100 active:scale-[0.96]',
              v.base,
              active ? v.active : v.inactive
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
