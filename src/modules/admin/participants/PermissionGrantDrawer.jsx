/**
 * PermissionGrantDrawer.jsx (desktop) — správa JEDNOHO oprávnění externího
 * účastníka (2026-07-13, desktop varianta PermissionGrantSheet). Necitlivé =
 * zapnout/odvolat jedním krokem. Citlivé = tříkrokové schválení (Požádat s
 * dokladem → Schválit → Aktivovat) + platnost od–do + časová okna komunikace
 * (denně / týdně s lichou/sudou paritou).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { permissionLabel, isSensitivePermission, REASON_TYPES } from '../../../shared/externalPermissions.js';
import { requestGrant, approveGrant, activateGrant, revokeGrant, grantDirect } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import Drawer from '../../../components/ui/Drawer.jsx';
import Button from '../../../components/ui/Button.jsx';

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const fieldClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const smallField = 'h-9 rounded-lg border border-border-strong bg-white px-2.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

function toTs(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function PermissionGrantDrawer({ epId, childId, permissionKey, grant, onClose, onChanged }) {
  const { t } = useTranslation();
  const sensitive = isSensitivePermission(permissionKey);
  const status = grant?.status ?? 'none';
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ reason: '', reasonType: 'court', sourceType: '', validFrom: '', validTo: '' });
  const [windows, setWindows] = useState([]);
  const [win, setWin] = useState({ type: 'daily', from: '15:00', to: '18:00', weekday: 1, weekParity: 'all' });

  async function run(fn, okMsg) {
    setBusy(true);
    try { await fn(); toast.info(okMsg); await onChanged(); onClose(); }
    catch (err) { console.error('[PermissionGrantDrawer]', err); toast.error(err.message ?? t('dsk.common.actionFailed', 'Akce selhala.')); setBusy(false); }
  }

  function addWindow() {
    const w = win.type === 'weekly'
      ? { type: 'weekly', from: win.from, to: win.to, days: [Number(win.weekday)], weekParity: win.weekParity }
      : { type: 'daily', from: win.from, to: win.to };
    setWindows((ws) => [...ws, w]);
  }

  const validity = { validFrom: toTs(form.validFrom), validTo: toTs(form.validTo), timeWindows: windows };
  const doRequest = () => run(() => requestGrant(epId, { childId, permissionKey, reason: form.reason, reasonType: form.reasonType, sourceType: form.sourceType, ...validity }), t('dsk.grant.requested', 'Žádost zaznamenána.'));
  const doApprove = () => run(() => approveGrant(epId, grant.id), t('dsk.grant.approved', 'Schváleno.'));
  const doActivate = () => run(() => activateGrant(epId, grant.id, { validFrom: toTs(form.validFrom) }), t('dsk.grant.activated', 'Aktivováno.'));
  const doRevoke = () => run(() => revokeGrant(epId, grant.id), t('dsk.grant.revoked', 'Oprávnění odvoláno.'));
  const doDirect = () => run(() => grantDirect(epId, { childId, permissionKey, ...validity }), t('dsk.grant.enabled', 'Oprávnění zapnuto.'));

  const requestable = sensitive && (status === 'none' || status === 'revoked' || status === 'expired');

  return (
    <Drawer title={permissionLabel(permissionKey)} onClose={() => !busy && onClose()}>
      <div className="flex flex-col gap-4">
        {sensitive && (
          <p className="rounded-lg bg-warning-50 p-3 text-xs leading-relaxed text-warning-700">
            {t('dsk.grant.sensitiveNote', 'Citlivé oprávnění — vyžaduje doklad a tříkrokové schválení (Požádat → Schválit → Aktivovat).')}
          </p>
        )}

        {status === 'active' && (
          <>
            <p className="text-sm"><span className="text-ink-500">{t('dsk.grant.stateLabel', 'Stav: ')}</span><span className="font-semibold text-brand-700">{t('dsk.grant.active', 'Aktivní')}</span></p>
            <Button variant="danger" onClick={doRevoke} disabled={busy}>{t('dsk.grant.revoke', 'Odvolat oprávnění')}</Button>
          </>
        )}

        {!sensitive && status !== 'active' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div><span className={labelClass}>{t('dsk.grant.validFrom', 'Platnost od')}</span><input type="date" className={fieldClass} value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} /></div>
              <div><span className={labelClass}>{t('dsk.grant.validTo', 'Platnost do')}</span><input type="date" className={fieldClass} value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} /></div>
            </div>
            <p className="-mt-1 text-xs text-ink-400">{t('dsk.grant.noEndHint', 'Prázdné pole „do“ znamená bez časového omezení.')}</p>
            <Button onClick={doDirect} disabled={busy}>{t('dsk.grant.enable', 'Zapnout oprávnění')}</Button>
          </>
        )}

        {requestable && (
          <>
            <div>
              <span className={labelClass}>{t('dsk.grant.docType', 'Typ dokladu')}</span>
              <select className={fieldClass} value={form.reasonType} onChange={(e) => setForm((f) => ({ ...f, reasonType: e.target.value }))}>
                {Object.entries(REASON_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div><span className={labelClass}>{t('dsk.grant.source', 'Zdroj / odkaz')}</span><input className={fieldClass} value={form.sourceType} onChange={(e) => setForm((f) => ({ ...f, sourceType: e.target.value }))} placeholder={t('dsk.grant.sourcePlaceholder', 'č. j. rozhodnutí, dokument…')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><span className={labelClass}>{t('dsk.grant.validFrom', 'Platnost od')}</span><input type="date" className={fieldClass} value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} /></div>
              <div><span className={labelClass}>{t('dsk.grant.validTo', 'Platnost do')}</span><input type="date" className={fieldClass} value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} /></div>
            </div>
            <div><span className={labelClass}>{t('dsk.common.reason', 'Důvod')}</span><textarea rows={3} className={textareaClass} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder={t('dsk.grant.reasonPlaceholder', 'Odůvodnění aktivace…')} /></div>

            <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t('dsk.grant.windows', 'Časová okna komunikace (volitelné)')}</p>
              {windows.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {windows.map((w, i) => (
                    <span key={i} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">
                      {w.type === 'weekly' ? `${WEEKDAYS[w.days[0]]}${w.weekParity !== 'all' ? ` (${w.weekParity === 'odd' ? t('dsk.grant.odd', 'liché') : t('dsk.grant.even', 'sudé')})` : ''} ` : `${t('dsk.grant.daily', 'Denně')} `}{w.from}–{w.to}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <select value={win.type} onChange={(e) => setWin((w) => ({ ...w, type: e.target.value }))} className={smallField}>
                  <option value="daily">{t('dsk.grant.daily', 'Denně')}</option><option value="weekly">{t('dsk.grant.weekly', 'Týdně')}</option>
                </select>
                {win.type === 'weekly' && (
                  <>
                    <select value={win.weekday} onChange={(e) => setWin((w) => ({ ...w, weekday: e.target.value }))} className={smallField}>
                      {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                    <select value={win.weekParity} onChange={(e) => setWin((w) => ({ ...w, weekParity: e.target.value }))} className={smallField}>
                      <option value="all">{t('dsk.grant.every', 'každý')}</option><option value="odd">{t('dsk.grant.oddM', 'lichý')}</option><option value="even">{t('dsk.grant.evenM', 'sudý')}</option>
                    </select>
                  </>
                )}
                <input type="time" value={win.from} onChange={(e) => setWin((w) => ({ ...w, from: e.target.value }))} className={smallField} />
                <input type="time" value={win.to} onChange={(e) => setWin((w) => ({ ...w, to: e.target.value }))} className={smallField} />
                <button type="button" onClick={addWindow} className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100">{t('dsk.common.add', 'Přidat')}</button>
              </div>
            </div>

            <Button onClick={doRequest} disabled={busy || !form.reason.trim()}>{t('dsk.grant.request', 'Požádat o oprávnění')}</Button>
          </>
        )}

        {sensitive && status === 'requested' && (
          <Button onClick={doApprove} disabled={busy}>{t('dsk.grant.approve', 'Schválit (vedení)')}</Button>
        )}
        {sensitive && status === 'approved' && (
          <Button onClick={doActivate} disabled={busy}>{t('dsk.grant.activate', 'Aktivovat (klíčová osoba)')}</Button>
        )}
      </div>
    </Drawer>
  );
}
