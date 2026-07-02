/**
 * ChildFormModal.jsx — sdílený obal formulářových modálů karty dítěte
 * (Tailwind migrace ChildDetailPage.jsx, 2026-07-02). Nahrazuje MUI <Dialog>
 * pevným overlay panelem dle DESIGN.md — zavření klikem na backdrop nebo
 * křížkem, formulář a tlačítka dodává volající.
 */

import React from 'react';
import { X } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

export default function ChildFormModal({
  title,
  onClose,
  onSubmit,
  submitting,
  submitError,
  submitLabel = 'Uložit',
  children,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !submitting && onClose()}
    >
      <Card
        className="max-h-[90vh] w-full max-w-md overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">{title}</h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Zavřít"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>
          )}

          {children}

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Zrušit
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Ukládám…' : submitLabel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
