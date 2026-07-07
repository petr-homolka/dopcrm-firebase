/**
 * MagicLinkScreen.jsx — dokončení přihlášení jednorázovým odkazem (2026-07-06
 * §A, docs/domain/dokumenty-workflow-a-prihlaseni.md). Veřejná route
 * `/prihlaseni`, na kterou míří odkaz z e-mailu. Když odkaz otevře pěstoun na
 * jiném zařízení (prázdný localStorage), doptáme se na e-mail. Po úspěchu
 * (a případném bootstrapu profilu z pozvánky) přesměruje na jeho appku.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { isMagicLink, completeMagicLink } from '../../services/orgAuth.js';

export default function MagicLinkScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('working'); // working | needEmail | error
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const tried = useRef(false);

  async function finish(fallbackEmail = '') {
    setPhase('working');
    setError('');
    try {
      await completeMagicLink(fallbackEmail);
      navigate('/', { replace: true }); // role-guard přesměruje pěstouna na /moje
    } catch (err) {
      if (!fallbackEmail && /e-mail/i.test(err.message ?? '')) {
        setPhase('needEmail');
      } else {
        setError(err.message ?? 'Přihlášení se nezdařilo.');
        setPhase('error');
      }
    }
  }

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    if (!isMagicLink()) {
      setError('Tento odkaz už není platný nebo byl použit. Požádejte o nový.');
      setPhase('error');
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-native-bg px-6 font-native">
      <div className="w-full max-w-sm rounded-native-card bg-native-surface p-6 text-center">
        {phase === 'working' && (
          <>
            <Loader2 size={28} strokeWidth={2} className="mx-auto animate-spin text-native-primary" />
            <p className="mt-3 text-[15px] text-native-textMuted">Přihlašuji vás…</p>
          </>
        )}

        {phase === 'needEmail' && (
          <>
            <MailCheck size={28} strokeWidth={1.75} className="mx-auto text-native-primary" />
            <p className="mt-3 text-[17px] font-semibold text-native-text">Potvrďte svůj e-mail</p>
            <p className="mt-1 text-[13px] text-native-textMuted">Zadejte e-mail, na který vám odkaz přišel.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              className="mt-4 w-full rounded-native-input bg-native-bg px-3.5 py-3 text-[16px] text-native-text placeholder:text-native-textMuted focus:outline-none"
            />
            <button
              type="button"
              onClick={() => finish(email)}
              disabled={!email.trim()}
              className="mt-3 h-12 w-full rounded-full bg-native-primary text-[17px] font-semibold text-white disabled:bg-native-separator disabled:text-native-textMuted"
            >
              Přihlásit se
            </button>
          </>
        )}

        {phase === 'error' && (
          <>
            <p className="text-[17px] font-semibold text-native-text">Přihlášení se nezdařilo</p>
            <p className="mt-1 text-[14px] text-native-textMuted">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-4 h-12 w-full rounded-full bg-native-primary/10 text-[17px] font-semibold text-native-primary"
            >
              Zpět na přihlášení
            </button>
          </>
        )}
      </div>
    </div>
  );
}
