/**
 * ChildOspodCourtTab.jsx — tab "OSPOD a soud" karty dítěte, vytaženo z
 * ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02). Čistě
 * prezentační komponenta, logika a stav zůstávají v rodiči.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function ChildOspodCourtTab({
  child,
  courtVerdicts,
  hasMoreVerdicts,
  onLoadMoreVerdicts,
  ospodDialogOpen,
  ospodForm,
  setOspodForm,
  onOpenOspod,
  onCloseOspod,
  onSaveOspod,
  courtDialogOpen,
  courtForm,
  setCourtForm,
  onOpenCourt,
  onCloseCourt,
  onSaveCourt,
  verdictDialogOpen,
  verdictForm,
  setVerdictForm,
  onOpenVerdict,
  onCloseVerdict,
  onAddVerdict,
  submitting,
  submitError,
}) {
  const rozsudky = courtVerdicts ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Příslušnost OSPOD</h2>
          <Button variant="secondary" size="sm" onClick={onOpenOspod}>
            {child.ospod ? 'Upravit' : 'Doplnit'}
          </Button>
        </div>
        {child.ospod ? (
          <p className="text-sm text-stone-800">{child.ospod.nazev} — kontaktní osoba: {child.ospod.osoba || '—'}</p>
        ) : (
          <p className="text-sm text-stone-500">Zatím nevyplněno.</p>
        )}
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Soud</h2>
          <Button variant="secondary" size="sm" onClick={onOpenCourt}>
            {child.courtCase ? 'Upravit' : 'Doplnit'}
          </Button>
        </div>
        {child.courtCase ? (
          <div className="mb-4 flex flex-col gap-0.5">
            <p className="text-sm text-stone-800">Spisová značka: <span className="font-semibold">{child.courtCase.spisZnacka || '—'}</span></p>
            <p className="text-sm text-stone-800">{child.courtCase.soudNazev}</p>
            <p className="text-sm text-stone-500">{child.courtCase.soudAdresa}</p>
            <p className="text-sm text-stone-800">Kontaktní osoba: {child.courtCase.kontaktniOsoba || '—'}</p>
          </div>
        ) : (
          <p className="mb-4 text-sm text-stone-500">Zatím nevyplněno.</p>
        )}

        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-stone-800">Rozsudky a usnesení</h3>
          <Button variant="ghost" size="sm" onClick={onOpenVerdict}>
            <Plus size={16} strokeWidth={1.75} />
            Přidat
          </Button>
        </div>
        {rozsudky.length === 0 && <p className="py-1 text-sm text-stone-500">Žádné záznamy.</p>}
        <ul>
          {rozsudky.map((v) => (
            <li key={v.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
              <p className="text-sm text-stone-800">{v.popis}</p>
              <p className="text-xs text-stone-400">{v.datum}</p>
            </li>
          ))}
        </ul>
        {hasMoreVerdicts && <LoadMoreButton onClick={onLoadMoreVerdicts} />}
      </Card>

      {ospodDialogOpen && (
        <ChildFormModal title="Příslušnost OSPOD" onClose={onCloseOspod} onSubmit={onSaveOspod} submitting={submitting} submitError={submitError}>
          <div>
            <label className={labelClass}>Název OSPOD</label>
            <input className={fieldClass} value={ospodForm.nazev} onChange={(e) => setOspodForm((f) => ({ ...f, nazev: e.target.value }))} required disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Kontaktní osoba</label>
            <input className={fieldClass} value={ospodForm.osoba} onChange={(e) => setOspodForm((f) => ({ ...f, osoba: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}

      {courtDialogOpen && (
        <ChildFormModal title="Soud" onClose={onCloseCourt} onSubmit={onSaveCourt} submitting={submitting} submitError={submitError}>
          <div>
            <label className={labelClass}>Spisová značka</label>
            <input className={fieldClass} value={courtForm.spisZnacka} onChange={(e) => setCourtForm((f) => ({ ...f, spisZnacka: e.target.value }))} disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Název soudu</label>
            <input className={fieldClass} value={courtForm.soudNazev} onChange={(e) => setCourtForm((f) => ({ ...f, soudNazev: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Adresa soudu</label>
            <input className={fieldClass} value={courtForm.soudAdresa} onChange={(e) => setCourtForm((f) => ({ ...f, soudAdresa: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Kontaktní osoba</label>
            <input className={fieldClass} value={courtForm.kontaktniOsoba} onChange={(e) => setCourtForm((f) => ({ ...f, kontaktniOsoba: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}

      {verdictDialogOpen && (
        <ChildFormModal title="Přidat rozsudek / usnesení" onClose={onCloseVerdict} onSubmit={onAddVerdict} submitting={submitting} submitError={submitError} submitLabel="Přidat">
          <div>
            <label className={labelClass}>Datum</label>
            <input type="date" className={fieldClass} value={verdictForm.datum} onChange={(e) => setVerdictForm((f) => ({ ...f, datum: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Popis</label>
            <textarea className={fieldClass} rows={3} value={verdictForm.popis} onChange={(e) => setVerdictForm((f) => ({ ...f, popis: e.target.value }))} required disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </div>
  );
}
