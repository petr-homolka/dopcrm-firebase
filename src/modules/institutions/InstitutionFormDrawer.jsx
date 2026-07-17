/**
 * InstitutionFormDrawer.jsx — založení / úprava instituce (2026-07-13).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createInstitution, updateInstitution, INSTITUTION_TYPES } from '../../services/orgService.js';
import { toast } from '../../store/toastStore.js';
import Drawer from '../../components/ui/Drawer.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const fieldClass = 'h-10 w-full rounded-lg border border-border-strong bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const textareaClass = 'w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
const labelClass = 'mb-1 block text-[13px] font-medium text-ink-700';

export default function InstitutionFormDrawer({ organizationId, institution = null, onClose, onSaved }) {
  const { t } = useTranslation();
  const editing = !!institution;
  const [form, setForm] = useState({
    name: institution?.name ?? '',
    type: institution?.type ?? 'ospod',
    contactPerson: institution?.contactPerson ?? '',
    phone: institution?.phone ?? '',
    email: institution?.email ?? '',
    address: institution?.address ?? '',
    note: institution?.note ?? '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      if (editing) await updateInstitution(institution.id, form);
      else await createInstitution({ organizationId, ...form });
      onSaved?.();
    } catch (err) {
      console.error('[InstitutionFormDrawer] Uložení selhalo:', err);
      toast.error(err.message ?? t('dsk.inst.saveFailed', 'Instituci se nepodařilo uložit.'));
      setBusy(false);
    }
  }

  return (
    <Drawer
      title={editing ? t('dsk.inst.editTitle', 'Upravit instituci') : t('dsk.inst.newTitle', 'Nová instituce')}
      onClose={() => !busy && onClose()}
      footer={<Button type="submit" form="inst-form" disabled={busy || !form.name.trim()}>{busy ? t('dsk.common.saving', 'Ukládám…') : (editing ? t('dsk.common.save', 'Uložit') : t('dsk.inst.add', 'Přidat instituci'))}</Button>}
    >
      <form id="inst-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label={t('dsk.inst.name', 'Název')} value={form.name} onChange={set('name')} autoFocus placeholder={t('dsk.inst.namePlaceholder', 'např. OSPOD Praha 4')} />
        <div>
          <span className={labelClass}>{t('dsk.inst.type', 'Typ')}</span>
          <select className={fieldClass} value={form.type} onChange={set('type')}>
            {Object.entries(INSTITUTION_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <Input label={t('dsk.inst.contactPerson', 'Kontaktní osoba')} value={form.contactPerson} onChange={set('contactPerson')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('dsk.common.phone', 'Telefon')} type="tel" value={form.phone} onChange={set('phone')} />
          <Input label={t('dsk.common.email', 'E-mail')} type="email" value={form.email} onChange={set('email')} />
        </div>
        <Input label={t('dsk.common.address', 'Adresa')} value={form.address} onChange={set('address')} />
        <div>
          <span className={labelClass}>{t('dsk.common.note', 'Poznámka')}</span>
          <textarea rows={3} className={textareaClass} value={form.note} onChange={set('note')} placeholder={t('dsk.inst.notePlaceholder', 'Doplňující informace…')} />
        </div>
      </form>
    </Drawer>
  );
}
