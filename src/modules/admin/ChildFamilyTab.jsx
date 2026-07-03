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
import ChildFormModal from './ChildFormModal.jsx';
import AddRelativeModal from './AddRelativeModal.jsx';
import { REL_TYPES, relLegalLabel, relLegalColor } from '../../shared/domainConstants.js';
import { fieldClass, labelClass, legalBadgeTone } from './childDetailShared.js';

export default function ChildFamilyTab({
  child,
  previousFosters,
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

  return (
    <div className="flex flex-col gap-4">
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
                <Badge tone={legalBadgeTone(relLegalColor(rel.legal))} className="shrink-0">
                  {relLegalLabel(rel.legal)}
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
