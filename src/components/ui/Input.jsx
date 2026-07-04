import React from 'react';
import { cn } from './cn.js';

/**
 * Textové pole dle DESIGN.md §5.2. Label vždy nad polem (nikdy placeholder
 * jako label, §8 bod 7). `icon` = volitelná ikona vlevo (search inputy mají
 * `bg-surface-canvas` bez borderu podle §5.2 — předat přes `className`).
 */
export default function Input({ label, error, icon, className, id, ...props }) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="block">
      {label && <span className="mb-1 block text-[13px] font-medium text-ink-700">{label}</span>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'h-10 w-full rounded-lg border bg-white text-sm text-ink-800 placeholder:text-ink-400',
            icon ? 'pl-9 pr-3.5' : 'px-3.5',
            'focus:outline-none focus:ring-2 disabled:bg-surface-muted disabled:opacity-50',
            error
              ? 'border-danger-500 focus:ring-danger-50'
              : 'border-border-strong focus:border-brand-500 focus:ring-brand-100',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </label>
  );
}
