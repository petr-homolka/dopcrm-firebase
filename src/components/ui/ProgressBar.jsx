import React from 'react';
import { cn } from './cn.js';

/** Segmentovaný progress bar (onboarding "1/6") — DESIGN.md §5.8. */
export function SegmentedProgress({ total, completed, className }) {
  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn('h-1.5 flex-1 rounded-full', i < completed ? 'bg-brand-500' : 'bg-border-default')}
        />
      ))}
    </div>
  );
}

/**
 * Plynulý progress/capacity bar (0–100 %) — DESIGN.md §5.8. Šířka výplně je
 * za běhu spočítané procento, které Tailwind nedokáže vyjádřit statickou
 * třídou — `style` je zde jediná správná cesta, ne obcházení Tailwindu.
 */
export default function ProgressBar({ value, max = 100, colorClassName = 'bg-brand-500', trackClassName = 'bg-border-default', className }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full', trackClassName, className)}>
      <div className={cn('h-full rounded-full transition-all', colorClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
