import React from 'react';
import { cn } from './cn.js';

// Barevné kódování entit dle DESIGN.md §2.2 + sémantické stavy.
const TONES = {
  family: 'text-entity-family-text bg-entity-family-bg',
  ospod: 'text-entity-ospod-text bg-entity-ospod-bg',
  court: 'text-entity-court-text bg-entity-court-bg',
  bio: 'text-entity-bio-text bg-entity-bio-bg',
  crisis: 'text-entity-crisis-text bg-entity-crisis-bg',
  success: 'text-green-700 bg-green-50',
  error: 'text-red-700 bg-red-50',
  warning: 'text-amber-700 bg-amber-50',
  neutral: 'text-stone-600 bg-stone-100',
};

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONES[tone] ?? TONES.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
