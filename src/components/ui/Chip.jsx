import React from 'react';
import { cn } from './cn.js';

export default function Chip({ active = false, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'bg-brand-500 text-white'
          : 'bg-surface-muted text-ink-600 hover:bg-border-default',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
