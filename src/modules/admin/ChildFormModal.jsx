/**
 * ChildFormModal.jsx — sdílený obal formulářových modálů karty dítěte
 * (Tailwind migrace ChildDetailPage.jsx, 2026-07-02). Nahrazuje MUI <Dialog>
 * pevným overlay panelem dle DESIGN.md — zavření klikem na backdrop nebo
 * křížkem, formulář a tlačítka dodává volající.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

export default function ChildFormModal({
  title,
  onClose,
  onSubmit,
  submitting,
  submitError,
  submitLabel,
  children,
}) {
  const { t } = useTranslation();
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
          <h2 className="text-base font-semibold text-ink-800">{title}</h2>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label={t('common.close')}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {submitError && (
            <div className="rounded-xl bg-danger-50 px-3.5 py-2.5 text-sm text-danger-700">{submitError}</div>
          )}

          {children}

          <div className="mt-1 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : (submitLabel ?? t('common.save'))}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
