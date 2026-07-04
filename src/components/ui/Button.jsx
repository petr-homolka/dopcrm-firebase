import React from 'react';
import { cn } from './cn.js';

// Connecteam redesign (DESIGN.md §5.1) — radius 8 px na desktopu, primary =
// brand modrá. Na mobilu (<lg) plná kapsle (pill) dle §11.5, reálné
// Connecteam screenshoty 2026-07-04 — systémová vlastnost sdíleného
// Button.jsx, ne per-obrazovka výjimka, ať tlačítka nepůsobí nekonzistentně
// napříč obrazovkami.
const VARIANTS = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-white border border-border-strong text-ink-800 hover:bg-surface-muted',
  ghost: 'bg-transparent text-ink-700 hover:bg-surface-muted',
  danger: 'bg-white text-danger-600 border border-danger-200 hover:bg-danger-50',
};

// sm 32px, md 40px (default), lg 48px — DESIGN.md §5.1.
const SIZES = {
  sm: 'h-8 text-xs px-3',
  md: 'h-10 text-sm px-4',
  lg: 'h-12 text-base px-5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold lg:rounded-lg',
        'transition-colors duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus:ring-2 focus:ring-brand-200',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
