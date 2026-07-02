import React from 'react';
import { cn } from './cn.js';

export default function Chip({ active = false, className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'bg-primary-600 text-white'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
