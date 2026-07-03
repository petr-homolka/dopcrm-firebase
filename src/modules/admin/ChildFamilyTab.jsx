/**
 * ChildFamilyTab.jsx — tab "Biologická rodina" karty dítěte: evidovaní
 * příbuzní (REL_TYPES) a předchozí pěstounské rodiny. Vytaženo z
 * ChildDetailPage.jsx při přechodu na Tailwind (2026-07-02).
 */

import React from 'react';
import { UserPlus, Plus } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import LoadMoreButton from '../../components/ui/LoadMoreButton.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import AddRelativeModal from './AddRelativeModal.jsx';
import { REL_TYPES, legalWeightLabel, legalWeightTone } from '../../shared/domainConstants.js';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function ChildFamilyTab({
  child,
  family,
  previousFosters,
  hasMorePreviousFosters,
  onLoadMorePreviousFosters,
  relGroupsData,
  relDialogOpen,
  relForm,
  setRelForm,
  onOpenRel,
  onCloseRel,
  onAddRelative,
  fosterHistDialogOpen,
  fosterHistForm,
  setFosterHistForm,
  onOpenFosterHist,
  onCloseFosterHist,
  onAddFosterHist,
  submitting,
  submitError,
}) {
  const relatives = child.relatives ?? [];
  const fosters = family?.fosters ?? [];
  const caregiverIds = child.custody?.caregivers ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-1 text-base font-semibold text-stone-800">
          Pěstouni a svěření ({fosters.length})
        </h2>
        <p className="mb-2 text-xs text-stone-500">
          {child.custody
            ? `${child.custody.type === 'spolecne' ? 'Společné svěření (manželé)' : 'Individuální svěření'}${child.custody.caseNumber ? ` · sp. zn. ${child.custody.caseNumber}` : ''}${child.custody.court ? ` · ${child.custody.court}` : ''}`
            : 'Svěření zatím nezaznamenáno.'}
        </p>

        {fosters.length === 0 && <p className="py-2 text-sm text-stone-500">Rodina zatím nemá evidovaného pěstouna.</p>}

        <ul>
          {fosters.map((p) => {
            const weight = caregiverIds.includes(p.id) ? 'pecujici' : 'bez_prav';
            return (
              <li key={p.id} className="flex items-start justify-between gap-3 border-t border-stone-100 py-2.5 first:border-t-0">
                <div>
                  <p className="text-sm font-semibold text-stone-800">{p.name}</p>
                  <p className="text-xs text-stone-500">{[p.rc && `RČ ${p.rc}`, p.phone, p.email].filter(Boolean).join(' · ')}</p>
                </div>
                <Badge tone={legalWeightTone(weight)} className="shrink-0">
                  {weight === 'pecujici' ? legalWeightLabel(weight) : 'Bez svěření (partner)'}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Biologická rodina ({relatives.length})</h2>
          <Button variant="secondary" size="sm" onClick={onOpenRel}>
            <UserPlus size={16} strokeWidth={1.75} />
            Přidat příbuzného
          </Button>
        </div>

        {relatives.length === 0 && <p className="py-2 text-sm text-stone-500">Zatím žádní evidovaní příbuzní.</p>}

        <ul>
          {relatives.map((rel, idx) => {
            const relType = REL_TYPES.find((r) => r.key === rel.rel);
            return (
              <li key={rel.id ?? idx} className="flex items-start justify-between gap-3 border-t border-stone-100 py-2.5 first:border-t-0">
                <div>
                  <p className="text-sm font-semibold text-stone-800">{rel.name}</p>
                  <p className="text-xs text-stone-500">
                    {[relType?.label ?? rel.rel, rel.rc && `RČ ${rel.rc}`, rel.phone, rel.email, rel.note].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Badge tone={legalWeightTone(relType?.legalWeight)} className="shrink-0">
                  {legalWeightLabel(relType?.legalWeight)}
                </Badge>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">Předchozí pěstounské rodiny ({previousFosters.length})</h2>
          <Button variant="ghost" size="sm" onClick={onOpenFosterHist}>
            <Plus size={16} strokeWidth={1.75} />
            Přidat
          </Button>
        </div>

        {previousFosters.length === 0 && <p className="py-2 text-sm text-stone-500">Žádné předchozí umístění v evidenci.</p>}

        <ul>
          {previousFosters.map((pf) => (
            <li key={pf.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
              <p className="text-sm font-semibold text-stone-800">{pf.name}</p>
              <p className="text-xs text-stone-500">{[pf.from && `od ${pf.from}`, pf.to && `do ${pf.to}`, pf.note].filter(Boolean).join(' · ')}</p>
            </li>
          ))}
        </ul>
        {hasMorePreviousFosters && <LoadMoreButton onClick={onLoadMorePreviousFosters} />}
      </Card>

      {relDialogOpen && (
        <AddRelativeModal
          form={relForm}
          setForm={setRelForm}
          groups={relGroupsData}
          onClose={onCloseRel}
          onSubmit={onAddRelative}
          submitting={submitting}
          submitError={submitError}
        />
      )}

      {fosterHistDialogOpen && (
        <ChildFormModal title="Předchozí pěstounská rodina" onClose={onCloseFosterHist} onSubmit={onAddFosterHist} submitting={submitting} submitError={submitError} submitLabel="Přidat">
          <div>
            <label className={labelClass}>Rodina / pěstoun</label>
            <input className={fieldClass} value={fosterHistForm.name} onChange={(e) => setFosterHistForm((f) => ({ ...f, name: e.target.value }))} required disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Od</label>
            <input type="date" className={fieldClass} value={fosterHistForm.from} onChange={(e) => setFosterHistForm((f) => ({ ...f, from: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Do</label>
            <input type="date" className={fieldClass} value={fosterHistForm.to} onChange={(e) => setFosterHistForm((f) => ({ ...f, to: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Poznámka</label>
            <textarea className={fieldClass} rows={2} value={fosterHistForm.note} onChange={(e) => setFosterHistForm((f) => ({ ...f, note: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </div>
  );
}
