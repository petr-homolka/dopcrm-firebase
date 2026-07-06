/**
 * EventTypesPanel.jsx — správa číselníku typů událostí v Nastavení organizace
 * (2026-07-06, Lidl v4 bod 3: „v administraci možnost definovat možnosti
 * rozevíracích menu"). Vestavěné typy (EVENT_TYPES) jsou jen ke čtení,
 * vlastní jdou přidat a odebrat. Zápis smí management (firestore.rules
 * `codelists`); panel se ale zobrazuje v Nastavení, které vidí org_admin.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { getCustomEventTypes, addEventType, removeEventType } from '../../services/orgService.js';
import { EVENT_TYPES } from '../../shared/domainConstants.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

export default function EventTypesPanel() {
  const { organizationId } = useAuthStore();
  const [custom, setCustom] = useState({});
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try {
      setCustom(await getCustomEventTypes(organizationId));
    } catch (err) {
      console.error('[EventTypesPanel] Načtení číselníku selhalo:', err);
      setMessage(err.message ?? 'Číselník se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!label.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      await addEventType(organizationId, label);
      setLabel('');
      await load();
    } catch (err) {
      setMessage(err.message ?? 'Přidání se nezdařilo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(key) {
    setBusy(true);
    setMessage('');
    try {
      await removeEventType(organizationId, key);
      await load();
    } catch (err) {
      setMessage(err.message ?? 'Odebrání se nezdařilo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-md">
      <h2 className="mb-1 text-sm font-semibold text-ink-800">Typy kalendářních událostí</h2>
      <p className="mb-4 text-xs text-ink-500">
        Vestavěné typy jsou pevné; vlastní typy uvidí všichni ve výběru při plánování.
      </p>

      {loading ? (
        <div className="flex justify-center py-6 text-ink-500">
          <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {Object.values(EVENT_TYPES).map((l) => (
              <span key={l} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs text-ink-600">{l}</span>
            ))}
            {Object.entries(custom).map(([key, l]) => (
              <span key={key} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {l}
                <button type="button" onClick={() => handleRemove(key)} disabled={busy} aria-label={`Odebrat typ ${l}`} className="text-brand-700/70 hover:text-brand-700">
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nový typ (např. Supervize)"
              className="h-9 flex-1 rounded-lg border border-ink-200 px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
            <Button type="submit" disabled={busy || !label.trim()}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={2} />}
              Přidat
            </Button>
          </form>
          {message && <p className="mt-2 text-xs text-danger-700">{message}</p>}
        </>
      )}
    </Card>
  );
}
