/**
 * useSlugStatus.js — debounced kontrola formátu/dostupnosti slugu, vytažené
 * z SlugField.jsx (2026-07-06) aby ji mohl použít i mobilní native formulář
 * (MobileSettingsScreen.jsx) beze sdílení JSX s desktopem — čistá logika,
 * žádná vizuální vrstva. Chování 1:1 shodné s původní verzí.
 */

import { useEffect, useRef, useState } from 'react';
import { validateSlugFormat } from './slugUtils.js';

export default function useSlugStatus(value, currentSlug, checkAvailable) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (!value) {
      setStatus('idle');
      setMessage('');
      return undefined;
    }

    const formatError = validateSlugFormat(value);
    if (formatError) {
      setStatus('invalid');
      setMessage(formatError);
      return undefined;
    }

    if (value === currentSlug) {
      setStatus('ok');
      setMessage('Stávající adresa organizace.');
      return undefined;
    }

    setStatus('checking');
    setMessage('');
    timerRef.current = setTimeout(async () => {
      try {
        const available = await checkAvailable(value);
        setStatus(available ? 'ok' : 'taken');
        setMessage(available ? 'Tato adresa je volná.' : 'Tato adresa je již obsazená.');
      } catch (err) {
        console.error('[useSlugStatus] kontrola dostupnosti selhala:', err);
        setStatus('invalid');
        setMessage('Nepodařilo se ověřit dostupnost, zkuste to znovu.');
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [value, currentSlug, checkAvailable]);

  return { status, message };
}
