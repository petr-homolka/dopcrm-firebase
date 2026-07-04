import React from 'react';
import { cn } from './cn.js';

function initialsOf(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// Škála dle DESIGN.md §5.5: sm 24px, md 32px (default), lg 40px, xl 56px, hero 96px.
const SIZES = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-14 w-14 text-lg',
  hero: 'h-24 w-24 text-2xl',
};

// Kroužek double-avatar overlaye škáluje s velikostí avataru (§5.7: 16px na 32px avataru).
const BADGE_SIZES = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
  hero: 'h-8 w-8',
};

/**
 * Avatar s volitelným "double-avatar" overlayem (DESIGN.md §5.5/§5.7) — signature
 * Connecteam vzor v activity feedu: malý kroužek barvy modulu přes pravý dolní roh.
 * `moduleClassName` = Tailwind bg třída modulu (např. "bg-module-families"),
 * `moduleIcon` = lucide-react ikona komponenta (bílá, uvnitř kroužku).
 */
export default function Avatar({ name, src, size = 'md', moduleClassName, moduleIcon: ModuleIcon, className }) {
  const core = src ? (
    <img src={src} alt={name ?? ''} className={cn('rounded-full object-cover', SIZES[size], className)} />
  ) : (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-entity-family-bg font-semibold text-entity-family-text',
        SIZES[size],
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );

  if (!moduleClassName) return core;

  return (
    <span className="relative inline-flex shrink-0">
      {core}
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full border-2 border-white',
          BADGE_SIZES[size],
          moduleClassName
        )}
      >
        {ModuleIcon && <ModuleIcon className="h-2.5 w-2.5 text-white" strokeWidth={2} />}
      </span>
    </span>
  );
}
