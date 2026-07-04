import React from 'react';
import { cn } from './cn.js';

/**
 * Data tabulka dle DESIGN.md §5.6 — skládá se z malých dílů, ne monolitický
 * data-grid. Header `bg-surface-muted` uppercase, řádek 56px, hover
 * `bg-surface-muted`, oddělovač `border-subtle`.
 */
export function Table({ className, children }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border-subtle', className)}>
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-surface-muted">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className, children }) {
  return (
    <th className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400', className)}>
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-border-subtle">{children}</tbody>;
}

export function Tr({ className, ...props }) {
  return <tr className={cn('h-14 hover:bg-surface-muted', className)} {...props} />;
}

export function Td({ className, children }) {
  return <td className={cn('px-4 py-3 text-sm text-ink-700', className)}>{children}</td>;
}
