/**
 * MobileTopNav.jsx — iOS nav bar (STRICT UI/UX DESIGN MANDATE, 2026-07-05).
 * Přesná Apple konstanta: 44pt výška, título na střed, žádný stín — jen 1px
 * `native.separator` dole. `onBack` volitelné (ne každá obrazovka má kam se
 * vracet — Rodiny/Kalendář/Profil jsou tab root, žádné "Zpět").
 *
 * v4 (2026-07-06, Lidl vzor): `variant="hero"` — modré pozadí bez vlásečnice,
 * bílý text; použít na detailech, kde pod nav barem pokračuje NativeHero,
 * aby modrá tekla od horní hrany displeje v jednom kuse.
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';

export default function MobileTopNav({ title, onBack, right, variant = 'surface' }) {
  const hero = variant === 'hero';
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex h-11 items-center px-2',
        hero ? 'bg-native-primary' : 'border-b border-native-separator bg-native-surface'
      )}
    >
      <div className="flex w-16 items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Zpět"
            className={cn('flex h-11 items-center', hero ? 'text-white' : 'text-native-primary')}
          >
            <ChevronLeft size={26} strokeWidth={2} />
          </button>
        )}
      </div>
      <h1 className={cn('flex-1 truncate text-center text-[17px] font-semibold', hero ? 'text-white' : 'text-native-text')}>
        {title}
      </h1>
      <div className="flex w-16 items-center justify-end">{right}</div>
    </div>
  );
}
