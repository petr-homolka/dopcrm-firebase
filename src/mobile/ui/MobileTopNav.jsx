/**
 * MobileTopNav.jsx — iOS nav bar (STRICT UI/UX DESIGN MANDATE, 2026-07-05).
 * Přesná Apple konstanta: 44pt výška, título na střed, žádný stín — jen 1px
 * `native.separator` dole. `onBack` volitelné (ne každá obrazovka má kam se
 * vracet — Rodiny/Kalendář/Profil jsou tab root, žádné "Zpět").
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

export default function MobileTopNav({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-10 flex h-11 items-center border-b border-native-separator bg-native-surface px-2">
      <div className="flex w-16 items-center">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Zpět" className="flex h-11 items-center text-native-primary">
            <ChevronLeft size={26} strokeWidth={2} />
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-[17px] font-semibold text-native-text">{title}</h1>
      <div className="flex w-16 items-center justify-end">{right}</div>
    </div>
  );
}
