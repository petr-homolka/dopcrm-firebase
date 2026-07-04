import React from 'react';
import { cn } from './cn.js';

// Barevné kódování entit dle DESIGN.md §2.3 (Connecteam-friendly, přebarveno
// z Amie, stejná sémantika) + tinted pilulky pro stavy dle §5.4.
const TONES = {
  family: 'text-entity-family-text bg-entity-family-bg',
  ospod: 'text-entity-ospod-text bg-entity-ospod-bg',
  court: 'text-entity-court-text bg-entity-court-bg',
  bio: 'text-entity-bio-text bg-entity-bio-bg',
  crisis: 'text-entity-crisis-text bg-entity-crisis-bg',
  success: 'text-success-700 bg-success-50',
  error: 'text-danger-700 bg-danger-50',
  warning: 'text-warning-700 bg-warning-50',
  info: 'text-brand-700 bg-brand-50',
  neutral: 'text-ink-500 bg-surface-muted',
};

export default function Badge({ tone = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONES[tone] ?? TONES.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
