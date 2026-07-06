/**
 * NativeCard.jsx — základní karta pro mobilní appku (STRICT UI/UX DESIGN
 * MANDATE, 2026-07-05, "Connecteam Native Feel"). Bílá karta na `bg-native-bg`
 * plátně, 1px separator (NIKDY tvrdý webový box-shadow — jen `shadow-sm`
 * v Tailwindu, což je v tomto projektu naddefinováno na velmi měkký odstín).
 *
 * `accentClass` = volitelný 4px barevný levý pruh pro typové rozlišení
 * (návštěva/vzdělávání/krize…) — Connecteam vzor z reálných screenshotů.
 * Toto je JEDINÁ dovolená barevná signalizace na kartě kromě badge vpravo
 * nahoře, viz mandát bod 3B.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

export default function NativeCard({ children, accentClass, onClick, className }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full rounded-native-card border border-native-separator bg-native-surface text-left',
        accentClass && 'border-l-4',
        accentClass,
        onClick && 'transition-transform duration-100 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </Tag>
  );
}
