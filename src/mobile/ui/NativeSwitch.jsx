/**
 * NativeSwitch.jsx — iOS systémový přepínač (STRICT UI/UX DESIGN MANDATE,
 * 2026-07-05 dodatek): pill dráha 51×31pt (Apple UISwitch rozměr), kulatý
 * thumb s posunem, OFF šedá dráha (native.separator), ON native.primary
 * (Connecteam přebarvuje z výchozí iOS zelené na firemní barvu — stejně
 * jako `native.primary` napříč appkou). Zatím bez napojení na reálné
 * nastavení — v appce není žádné on/off pole, které by tento primitiv řídilo.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

export default function NativeSwitch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-native-primary' : 'bg-native-separator',
        disabled && 'opacity-40'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}
