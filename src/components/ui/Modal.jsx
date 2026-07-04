import React from 'react';
import { X } from 'lucide-react';
import { cn } from './cn.js';

/**
 * Centrovaný modal dle DESIGN.md §5.11 — max-w 560px, radius 12px, backdrop
 * `bg-black/50`. Pro cokoli složitějšího než jednoduchý CRUD formulář použij
 * `Drawer.jsx` místo zvětšování modalu (§8 bod 8).
 */
export default function Modal({ title, onClose, children, footer, className }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={cn('flex max-h-[90vh] w-full max-w-[560px] flex-col rounded-xl bg-white shadow-lg', className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Zavřít" className="rounded-lg p-1.5 text-ink-500 hover:bg-surface-muted">
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex justify-end gap-2.5 border-t border-border-subtle px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
