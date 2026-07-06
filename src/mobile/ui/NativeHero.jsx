/**
 * NativeHero.jsx — modrá hlavička profilu (2026-07-06, Lidl Plus vzor —
 * závazná zpětná vazba): velké bílé jméno na primární modré, pod ním chipy
 * a řada kruhových rychlých akcí, obsah stránky pak najíždí zaoblenou horní
 * hranou přes spodek modré (`HeroBody`). Používat s
 * `<MobileTopNav variant="hero">`, aby modrá tekla od horní hrany displeje.
 */

import React from 'react';
import { cn } from '../../components/ui/cn.js';

export default function NativeHero({ title, subtitle, children }) {
  return (
    <div className="bg-native-primary px-4 pb-9 pt-3">
      <p className="text-[22px] font-bold leading-tight text-white">{title}</p>
      {subtitle && <div className="mt-1.5 flex flex-wrap items-center gap-2">{subtitle}</div>}
      {children && <div className="mt-4 flex gap-2">{children}</div>}
    </div>
  );
}

/** Kruhová rychlá akce na modré ploše hero (telefon, e-mail, mapa…). */
export function HeroAction({ icon: Icon, label, onClick, href, disabled }) {
  const inner = (
    <>
      <span
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          disabled ? 'bg-white/10 text-white/40' : 'bg-white/20 text-white'
        )}
      >
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className={cn('text-[12px] font-medium', disabled ? 'text-white/40' : 'text-white')}>{label}</span>
    </>
  );
  const cls = 'flex flex-1 flex-col items-center gap-1.5 transition-transform duration-100 active:scale-[0.95]';
  if (href && !disabled) {
    const external = href.startsWith('http');
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Obsah pod hero — zaoblená horní hrana najíždí přes spodek modré (Lidl). */
export function HeroBody({ children, className }) {
  return <div className={cn('relative -mt-5 rounded-t-native-card bg-native-bg pt-1', className)}>{children}</div>;
}
