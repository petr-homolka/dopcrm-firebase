import React from 'react';

// Sdílený "hero" prázdný stav dle DESIGN.md §5.10/§7.4 — ikona v kolečku +
// nadpis + popisek + volitelná akce, místo holé prázdné tabulky.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-16">
      <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
      {action && <div className="mt-1.5 grid gap-2.5">{action}</div>}
    </div>
  );
}
