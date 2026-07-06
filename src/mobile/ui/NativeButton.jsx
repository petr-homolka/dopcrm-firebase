/**
 * NativeButton.jsx — primární CTA pro mobilní appku (STRICT UI/UX DESIGN
 * MANDATE, 2026-07-05). Pill tvar (border-radius 9999px), masivní dotyková
 * plocha (56px), bez stínu (flat), tučný bílý text. `variant="secondary"`
 * pro sekundární akce (outline, ne plná výplň) — pořád pill, pořád 56px.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

// Secondary = měkká tintová výplň (Connecteam --ct-color-surface-brand-soft
// vzor), NE outline border — 2px rámeček působil tvrdě/zastarale (v3, §12.4).
const VARIANTS = {
  primary: 'bg-native-primary text-white',
  secondary: 'bg-native-primary/10 text-native-primary',
  danger: 'bg-native-danger text-white',
};

export default function NativeButton({ variant = 'primary', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[17px] font-semibold',
        'transition-transform duration-100 active:scale-[0.97] disabled:active:scale-100',
        'disabled:border-native-separator disabled:bg-native-separator disabled:text-native-textMuted',
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
