import React, { useEffect, useRef, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { sanitizeSlugInput, validateSlugFormat } from '../../shared/slugUtils.js';

const STATUS_ICON = {
  checking: <Loader2 size={16} className="animate-spin text-stone-400" />,
  ok: <Check size={16} className="text-green-600" />,
  taken: <X size={16} className="text-red-600" />,
  invalid: <X size={16} className="text-red-600" />,
};

const MESSAGE_CLASS = {
  ok: 'text-green-600',
  taken: 'text-red-600',
  invalid: 'text-red-600',
  checking: 'text-stone-400',
  idle: 'text-stone-400',
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
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  function report(next, msg) {
    setStatus(next);
    setMessage(msg);
    onStatusChange?.(next);
  }

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (!value) {
      report('idle', '');
      return undefined;
    }

    const formatError = validateSlugFormat(value);
    if (formatError) {
      report('invalid', formatError);
      return undefined;
    }

    if (value === currentSlug) {
      report('ok', 'Stávající adresa organizace.');
      return undefined;
    }

    report('checking', '');
    timerRef.current = setTimeout(async () => {
      try {
        const available = await checkAvailable(value);
        report(available ? 'ok' : 'taken', available ? 'Tato adresa je volná.' : 'Tato adresa je již obsazená.');
      } catch (err) {
        console.error('[SlugField] kontrola dostupnosti selhala:', err);
        report('invalid', 'Nepodařilo se ověřit dostupnost, zkuste to znovu.');
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currentSlug, checkAvailable]);

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
      <div className="flex items-center gap-2 rounded-xl bg-stone-100 px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary-600">
        <span className="text-sm text-stone-400">doprovazeni.com/</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none"
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
