import React from 'react';
import { X } from 'lucide-react';
import { cn } from './cn.js';

/**
 * Drawer zprava dle DESIGN.md §5.11 — šířka 480px (`wide` → 640px pro edit
 * rodiny), sticky header/footer. Pro cokoli komplexnějšího než jednoduchý
 * CRUD formulář (§8 bod 8: modaly max 640 px).
 */
export default function Drawer({ title, onClose, children, footer, wide = false, className }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex h-full w-full flex-col bg-white shadow-lg',
          wide ? 'max-w-[640px]' : 'max-w-[480px]',
          className
        )}
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
