/**
 * ChildSocialSpaceTab.jsx — tab "Sociální prostor" karty dítěte (osoby bez
 * biologické vazby — kmotři, rodinní přátelé…). Vytaženo z ChildDetailPage.jsx
 * při přechodu na Tailwind (2026-07-02).
 */

import React from 'react';
import { UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ChildFormModal from './ChildFormModal.jsx';
import { fieldClass, labelClass } from './childDetailShared.js';

export default function ChildSocialSpaceTab({
  child,
  socialDialogOpen,
  socialForm,
  setSocialForm,
  onOpen,
  onClose,
  onAdd,
  submitting,
  submitError,
}) {
  const socialSpace = child.socialSpace ?? [];

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-800">Sociální prostor ({socialSpace.length})</h2>
        <Button variant="secondary" size="sm" onClick={onOpen}>
          <UserPlus size={16} strokeWidth={1.75} />
          Přidat osobu
        </Button>
      </div>
      <p className="mb-1 text-sm text-stone-500">
        Osoby v okolí dítěte bez biologické vazby — kmotři, blízcí rodinní přátelé, širší okolí.
      </p>

      {socialSpace.length === 0 && <p className="py-2 text-sm text-stone-500">Zatím nikdo evidován.</p>}

      <ul>
        {socialSpace.map((p) => (
          <li key={p.id} className="border-t border-stone-100 py-2.5 first:border-t-0">
            <p className="text-sm font-semibold text-stone-800">{p.name}</p>
            <p className="text-xs text-stone-500">{[p.vztah, p.phone, p.email, p.note].filter(Boolean).join(' · ')}</p>
          </li>
        ))}
      </ul>

      {socialDialogOpen && (
        <ChildFormModal title="Přidat do sociálního prostoru" onClose={onClose} onSubmit={onAdd} submitting={submitting} submitError={submitError} submitLabel="Přidat">
          <div>
            <label className={labelClass}>Jméno a příjmení</label>
            <input className={fieldClass} value={socialForm.name} onChange={(e) => setSocialForm((f) => ({ ...f, name: e.target.value }))} required disabled={submitting} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Vztah k dítěti</label>
            <input className={fieldClass} placeholder="např. kmotra, rodinná přítelkyně" value={socialForm.vztah} onChange={(e) => setSocialForm((f) => ({ ...f, vztah: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={fieldClass} value={socialForm.phone} onChange={(e) => setSocialForm((f) => ({ ...f, phone: e.target.value }))} disabled={submitting} />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input className={fieldClass} value={socialForm.email} onChange={(e) => setSocialForm((f) => ({ ...f, email: e.target.value }))} disabled={submitting} />
          </div>
        </ChildFormModal>
      )}
    </Card>
  );
}
