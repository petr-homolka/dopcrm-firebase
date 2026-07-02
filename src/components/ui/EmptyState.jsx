import React from 'react';

// Sdílený "hero" prázdný stav dle DESIGN.md §7 — ikona v kolečku + nadpis +
// popisek + volitelná akce, místo holé prázdné tabulky.
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center sm:py-16">
      <div className="mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-stone-800">{title}</h3>
      <p className="max-w-sm text-sm text-stone-500">{description}</p>
      {action && <div className="mt-1.5 grid gap-2.5">{action}</div>}
    </div>
  );
}
