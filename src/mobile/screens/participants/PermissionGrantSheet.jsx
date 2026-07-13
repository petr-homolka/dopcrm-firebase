/**
 * PermissionGrantSheet.jsx — správa JEDNOHO oprávnění externího účastníka
 * (2026-07-06, docs/domain/externi-ucastnici.md §4). Necitlivé = zapnout/
 * odvolat jedním krokem. Citlivé = tříkrokové schválení (Požádat s dokladem →
 * Schválit → Aktivovat) + platnost od–do + časová okna komunikace.
 */

import React, { useState } from 'react';
import { permissionLabel, isSensitivePermission, REASON_TYPES } from '../../../shared/externalPermissions.js';
import { requestGrant, approveGrant, activateGrant, revokeGrant, grantDirect } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowSelect, RowTextarea } from '../../ui/NativeFormRow.jsx';

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

function toTs(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function PermissionGrantSheet({ epId, childId, permissionKey, grant, onClose, onChanged }) {
  const sensitive = isSensitivePermission(permissionKey);
  const status = grant?.status ?? 'none';
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ reason: '', reasonType: 'court', sourceType: '', validFrom: '', validTo: '' });
  const [windows, setWindows] = useState([]);
  const [win, setWin] = useState({ type: 'daily', from: '15:00', to: '18:00', weekday: 1, weekParity: 'all' });

  async function run(fn, okMsg) {
    setBusy(true);
    try { await fn(); toast.info(okMsg); await onChanged(); onClose(); }
    catch (err) { console.error('[PermissionGrantSheet]', err); toast.error(err.message ?? 'Akce selhala.'); setBusy(false); }
  }

  function addWindow() {
    const w = win.type === 'weekly'
      ? { type: 'weekly', from: win.from, to: win.to, days: [Number(win.weekday)], weekParity: win.weekParity }
      : { type: 'daily', from: win.from, to: win.to };
    setWindows((ws) => [...ws, w]);
  }

  const validity = { validFrom: toTs(form.validFrom), validTo: toTs(form.validTo), timeWindows: windows };

  const doRequest = () => run(() => requestGrant(epId, {
    childId, permissionKey, reason: form.reason, reasonType: form.reasonType, sourceType: form.sourceType, ...validity,
  }), 'Žádost zaznamenána.');
  const doApprove = () => run(() => approveGrant(epId, grant.id), 'Schváleno.');
  const doActivate = () => run(() => activateGrant(epId, grant.id, { validFrom: toTs(form.validFrom) }), 'Aktivováno.');
  const doRevoke = () => run(() => revokeGrant(epId, grant.id), 'Oprávnění odvoláno.');
  const doDirect = () => run(() => grantDirect(epId, { childId, permissionKey, ...validity }), 'Oprávnění zapnuto.');

  return (
    <NativeSheet title={permissionLabel(permissionKey)} onClose={() => !busy && onClose()} submitting={busy}>
      {sensitive && (
        <p className="rounded-native-card bg-native-warning/10 p-3 text-[13px] text-native-warning">
          Citlivé oprávnění — vyžaduje doklad a tříkrokové schválení (Požádat → Schválit → Aktivovat).
        </p>
      )}

      {/* Aktivní grant → jen odvolání + přehled platnosti */}
      {status === 'active' && (
        <>
          <NativeFormGroup>
            <NativeFormRow label="Stav" isLast><span className="text-[15px] text-native-primary">Aktivní</span></NativeFormRow>
          </NativeFormGroup>
          <NativeButton variant="danger" onClick={doRevoke} disabled={busy}>Odvolat oprávnění</NativeButton>
        </>
      )}

      {/* Necitlivé, ještě nezapnuté → zapnout jedním krokem (volitelně platnost) */}
      {!sensitive && status !== 'active' && (
        <>
          <NativeFormGroup>
            <NativeFormRow label="Platnost od"><RowInput type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} /></NativeFormRow>
            <NativeFormRow label="Platnost do" isLast hint="Prázdné = bez omezení."><RowInput type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} /></NativeFormRow>
          </NativeFormGroup>
          <NativeButton onClick={doDirect} disabled={busy}>Zapnout oprávnění</NativeButton>
        </>
      )}

      {/* Citlivé — krok dle stavu */}
      {sensitive && (status === 'none' || status === 'revoked' || status === 'expired') && (
        <>
          <NativeFormGroup>
            <NativeFormRow label="Typ dokladu">
              <RowSelect value={form.reasonType} onChange={(e) => setForm((f) => ({ ...f, reasonType: e.target.value }))}>
                {Object.entries(REASON_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </RowSelect>
            </NativeFormRow>
            <NativeFormRow label="Zdroj / odkaz"><RowInput value={form.sourceType} onChange={(e) => setForm((f) => ({ ...f, sourceType: e.target.value }))} placeholder="č. j. rozhodnutí, dokument…" /></NativeFormRow>
            <NativeFormRow label="Platnost od"><RowInput type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} /></NativeFormRow>
            <NativeFormRow label="Platnost do"><RowInput type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} /></NativeFormRow>
            <NativeFormRow label="Důvod" isLast stacked><RowTextarea rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Odůvodnění aktivace…" /></NativeFormRow>
          </NativeFormGroup>

          <div className="rounded-native-card bg-native-surface p-4">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-native-textMuted">Časová okna (volitelné)</p>
            {windows.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {windows.map((w, i) => (
                  <span key={i} className="rounded-full bg-native-primary/15 px-2.5 py-1 text-[12px] text-native-primary">
                    {w.type === 'weekly' ? `${WEEKDAYS[w.days[0]]}${w.weekParity !== 'all' ? ` (${w.weekParity === 'odd' ? 'liché' : 'sudé'})` : ''} ` : 'Denně '}{w.from}–{w.to}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <select value={win.type} onChange={(e) => setWin((w) => ({ ...w, type: e.target.value }))} className="rounded-native-input bg-native-bg px-2 py-2 text-[14px]">
                <option value="daily">Denně</option><option value="weekly">Týdně</option>
              </select>
              {win.type === 'weekly' && (
                <>
                  <select value={win.weekday} onChange={(e) => setWin((w) => ({ ...w, weekday: e.target.value }))} className="rounded-native-input bg-native-bg px-2 py-2 text-[14px]">
                    {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                  <select value={win.weekParity} onChange={(e) => setWin((w) => ({ ...w, weekParity: e.target.value }))} className="rounded-native-input bg-native-bg px-2 py-2 text-[14px]">
                    <option value="all">každý</option><option value="odd">lichý</option><option value="even">sudý</option>
                  </select>
                </>
              )}
              <input type="time" value={win.from} onChange={(e) => setWin((w) => ({ ...w, from: e.target.value }))} className="rounded-native-input bg-native-bg px-2 py-2 text-[14px]" />
              <input type="time" value={win.to} onChange={(e) => setWin((w) => ({ ...w, to: e.target.value }))} className="rounded-native-input bg-native-bg px-2 py-2 text-[14px]" />
              <button type="button" onClick={addWindow} className="rounded-full bg-native-primary/10 px-3 py-2 text-[13px] font-medium text-native-primary">Přidat</button>
            </div>
          </div>

          <NativeButton onClick={doRequest} disabled={busy || !form.reason.trim()}>Požádat o oprávnění</NativeButton>
        </>
      )}
      {sensitive && status === 'requested' && (
        <NativeButton onClick={doApprove} disabled={busy}>Schválit (vedení)</NativeButton>
      )}
      {sensitive && status === 'approved' && (
        <NativeButton onClick={doActivate} disabled={busy}>Aktivovat (klíčová osoba)</NativeButton>
      )}
    </NativeSheet>
  );
}
