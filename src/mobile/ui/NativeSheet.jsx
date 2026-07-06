/**
 * NativeSheet.jsx — modál jako bottom sheet s úchytovým pilulkovým pruhem
 * nahoře (STRICT UI/UX DESIGN MANDATE §3A, 2026-07-05: "Modals as bottom
 * sheets with drag-handle pill"). Zavření klikem na scrim, křížkem nebo
 * klávesou Escape. Formulář/tlačítka dodává volající přes children/footer.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function NativeSheet({ title, onClose, submitting, children, footer }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="max-h-[88vh] w-full overflow-y-auto rounded-t-native-card bg-native-surface pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-10 rounded-full bg-native-separator" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <p className="text-[17px] font-semibold text-native-text">{title}</p>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            aria-label="Zavřít"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-native-bg text-native-textMuted"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 pb-4">{children}</div>

        {footer && <div className="border-t border-native-separator px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
