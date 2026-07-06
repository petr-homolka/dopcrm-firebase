import React, { useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { sanitizeSlugInput } from '../../shared/slugUtils.js';
import useSlugStatus from '../../shared/useSlugStatus.js';

const STATUS_ICON = {
  checking: <Loader2 size={16} className="animate-spin text-ink-400" />,
  ok: <Check size={16} className="text-success-600" />,
  taken: <X size={16} className="text-danger-600" />,
  invalid: <X size={16} className="text-danger-600" />,
};

const MESSAGE_CLASS = {
  ok: 'text-success-600',
  taken: 'text-danger-600',
  invalid: 'text-danger-600',
  checking: 'text-ink-400',
  idle: 'text-ink-400',
};

/**
 * Editace slugu organizace s debounced kontrolou dostupnosti (Krok 1, 2026-07-03).
 * @param {string} value
 * @param {(v:string)=>void} onChange
 * @param {(slug:string)=>Promise<boolean>} checkAvailable — true = volný
 * @param {string} [currentSlug] — stávající slug organizace (bere se jako "OK", i když je jinak obsazený sám sebou)
 * @param {(status:'idle'|'checking'|'ok'|'taken'|'invalid')=>void} [onStatusChange] — pro gating submit tlačítka v rodiči
 */
export default function SlugField({ value, onChange, checkAvailable, currentSlug = '', disabled, label = 'Adresa URL organizace', onStatusChange }) {
  const { status, message } = useSlugStatus(value, currentSlug, checkAvailable);

  useEffect(() => { onStatusChange?.(status); }, [status, onStatusChange]);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink-500">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-600">
        <span className="text-sm text-ink-400">doprovazeni.com/</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(sanitizeSlugInput(e.target.value))}
          disabled={disabled}
          placeholder="nazev-organizace"
        />
        {STATUS_ICON[status]}
      </div>
      {message && <p className={`mt-1 text-xs ${MESSAGE_CLASS[status]}`}>{message}</p>}
    </label>
  );
}
