/**
 * NativeFormRow.jsx — formulářové řádky uvnitř jedné iOS grouped-list karty
 * (2026-07-06, oprava "upatlané" zpětné vazby): žádné jednotlivé krabičky
 * pole od pole s velkými gapy — jeden `NativeFormGroup` (rounded-native-card),
 * uvnitř řádky oddělené jen vlásečnicí (`native.separator`), popisek malý
 * a tlumený nad hodnotou, vstup samotný bez vlastního rámečku/pozadí. Přesně
 * vzor Apple Reminders/Contacts "Nový záznam" — ne samostatné boxy.
 *
 * Text vstupu zůstává 16px (iOS Safari jinak při focusu automaticky zoomuje
 * stránku pod 16px) — to je jediné místo, kde se NEpřebírá menší Connecteam
 * velikost písma (14px), technické omezení webu, ne estetická volba.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

export function NativeFormGroup({ children }) {
  return <div className="overflow-hidden rounded-native-card bg-native-surface px-4">{children}</div>;
}

export function NativeFormRow({ label, children, isLast, hint, hintTone = 'muted' }) {
  return (
    <div className={cn('flex flex-col gap-0.5 py-2.5', !isLast && 'border-b border-native-separator')}>
      <label className="text-[12px] font-medium text-native-textMuted">{label}</label>
      {children}
      {hint && (
        <p className={cn('mt-0.5 text-[12px]', hintTone === 'danger' ? 'text-native-danger' : hintTone === 'warning' ? 'text-native-warning' : 'text-native-textMuted')}>
          {hint}
        </p>
      )}
    </div>
  );
}

const rowFieldClass = 'w-full bg-transparent p-0 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none disabled:text-native-textMuted';

export function RowInput(props) {
  return <input {...props} className={rowFieldClass} />;
}

export function RowTextarea({ rows = 3, ...props }) {
  return <textarea {...props} rows={rows} className={cn(rowFieldClass, 'resize-none leading-normal')} />;
}

export function RowSelect({ children, ...props }) {
  return <select {...props} className={rowFieldClass}>{children}</select>;
}

/** Samostatný "composer" box (mimo FormGroup) — např. trvalá poznámka v kartě. */
export function ComposerTextarea({ rows = 2, ...props }) {
  return (
    <textarea
      {...props}
      rows={rows}
      className="w-full resize-none rounded-native-input border border-native-separator bg-native-bg px-3.5 py-2.5 text-[16px] leading-normal text-native-text placeholder:text-native-textMuted focus:outline-none focus:border-native-primary"
    />
  );
}
