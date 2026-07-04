import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from './cn.js';
import { useToastStore } from '../../store/toastStore.js';

const TYPE_META = {
  success: { icon: CheckCircle2, stripe: 'bg-success-500', iconColor: 'text-success-600' },
  info: { icon: Info, stripe: 'bg-brand-500', iconColor: 'text-brand-600' },
  warning: { icon: AlertTriangle, stripe: 'bg-warning-500', iconColor: 'text-warning-600' },
  error: { icon: XCircle, stripe: 'bg-danger-500', iconColor: 'text-danger-600' },
};

function ToastCard({ toast: t, onDismiss }) {
  const timerRef = useRef(null);
  const remainingRef = useRef(t.duration ?? 4500);
  const startRef = useRef(0);

  useEffect(() => {
    startRef.current = Date.now();
    timerRef.current = setTimeout(onDismiss, remainingRef.current);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseEnter() {
    clearTimeout(timerRef.current);
    remainingRef.current -= Date.now() - startRef.current;
  }

  function handleMouseLeave() {
    startRef.current = Date.now();
    timerRef.current = setTimeout(onDismiss, Math.max(remainingRef.current, 500));
  }

  const meta = TYPE_META[t.type] ?? TYPE_META.info;
  const Icon = meta.icon;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      aria-live="polite"
      className="relative flex w-80 items-start gap-3 overflow-hidden rounded-[10px] bg-white py-3 pl-4 pr-3 shadow-lg ring-1 ring-border-subtle"
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', meta.stripe)} />
      <Icon size={18} strokeWidth={1.75} className={cn('mt-0.5 shrink-0', meta.iconColor)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink-800">{t.message}</p>
        {t.undo && (
          <button
            type="button"
            onClick={() => { t.undo(); onDismiss(); }}
            className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
          >
            Vrátit zpět
          </button>
        )}
      </div>
      <button type="button" onClick={onDismiss} aria-label="Zavřít" className="shrink-0 rounded p-0.5 text-ink-400 hover:bg-surface-muted">
        <X size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

/**
 * Globální kontejner toastů — vykreslit JEDNOU v App.js. DESIGN.md §5.11/§7.7:
 * bottom-left, max 3 ve frontě (viz toastStore), auto-dismiss 4–5 s, hover pauzuje.
 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[100] flex flex-col gap-2.5">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
