/**
 * NativeFormRow.jsx — formulářové řádky uvnitř jedné iOS grouped-list karty.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba uživatele): řádek je
 * HORIZONTÁLNÍ — název pole vlevo, hodnota/vstup vpravo (zarovnaná doprava),
 * přesně jako iOS Nastavení a Lidl Plus profil. Vertikální variantu (label
 * nad hodnotou) drží jen `stacked` — pro textarey a vlastní obsah, kde se
 * hodnota vpravo nevejde. `NativeInfoRow` je čtecí sourozenec pro profily:
 * název vlevo / hodnota vpravo, bez inputu.
 *
 * Text vstupu zůstává 16px (iOS Safari jinak při focusu automaticky zoomuje
 * stránku pod 16px) — jediné místo, kde se nedrží menší velikost písma.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

export function NativeFormGroup({ children }) {
  return <div className="overflow-hidden rounded-native-card bg-native-surface px-4">{children}</div>;
}

export function NativeFormRow({ label, children, isLast, hint, hintTone = 'muted', stacked }) {
  return (
    <div className={cn('py-3', !isLast && 'border-b border-native-separator')}>
      {stacked ? (
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-native-textMuted">{label}</span>
          {children}
        </div>
      ) : (
        <label className="flex min-h-[28px] items-center justify-between gap-4">
          <span className="shrink-0 basis-[38%] text-[15px] text-native-text">{label}</span>
          <span className="flex min-w-0 flex-1 items-center justify-end">{children}</span>
        </label>
      )}
      {hint && (
        <p className={cn('mt-1 text-[12px]', hintTone === 'danger' ? 'text-native-danger' : hintTone === 'warning' ? 'text-native-warning' : 'text-native-textMuted')}>
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Čtecí řádek profilu (Lidl vzor): název vlevo tlumeně, hodnota vpravo
 * tučněji. `value` prázdné → pomlčka (údaj chybí, ne rozbité UI).
 */
export function NativeInfoRow({ label, value, isLast, tone }) {
  return (
    <div className={cn('flex min-h-[46px] items-center justify-between gap-4 py-3', !isLast && 'border-b border-native-separator')}>
      <span className="shrink-0 basis-[38%] text-[15px] text-native-textMuted">{label}</span>
      <span className={cn('min-w-0 flex-1 text-right text-[15px] font-medium', tone === 'danger' ? 'text-native-danger' : tone === 'warning' ? 'text-native-warning' : 'text-native-text')}>
        {value || value === 0 ? value : '—'}
      </span>
    </div>
  );
}

const rowFieldClass = 'w-full bg-transparent p-0 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none disabled:text-native-textMuted';

export function RowInput({ className, ...props }) {
  return <input {...props} className={cn(rowFieldClass, 'text-right', className)} />;
}

export function RowTextarea({ rows = 3, ...props }) {
  return <textarea {...props} rows={rows} className={cn(rowFieldClass, 'resize-none leading-normal')} />;
}

export function RowSelect({ children, className, ...props }) {
  // text-align-last zarovná vybranou hodnotu doprava (Chrome/Firefox);
  // Safari bez podpory nechá text vlevo — degradace, ne rozbití.
  return <select {...props} className={cn(rowFieldClass, 'appearance-none text-right [text-align-last:right]', className)}>{children}</select>;
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
