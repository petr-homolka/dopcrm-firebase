import React from 'react';
import { ChevronDown } from 'lucide-react';

// Sdílené tlačítko "Načíst další" pro stránkované podkolekce (audit nálezu #7).
export default function LoadMoreButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50"
    >
      <ChevronDown size={16} strokeWidth={1.75} />
      Načíst další
    </button>
  );
}
