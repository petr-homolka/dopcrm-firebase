/**
 * MobileEventSheet.jsx — založení A ÚPRAVA kalendářní události z mobilu
 * (2026-07-05/06, Connecteam + Lidl v4). Bez `event` propu zakládá (datum
 * a čas z klepnutého dne/hodiny), s ním edituje (updateEvent). Typ se čte
 * z číselníku organizace (vestavěné EVENT_TYPES + vlastní z
 * `codelists/eventTypes` — Lidl v4 bod 3: výčet nesmí být konečný);
 * management může přidat nový typ přímo ze selectu („+ Nový typ…").
 * U vlastních typů se do události denormalizuje `typeLabel` (karty pak
 * nemusí číst číselník). `location` se přepisuje adresou rodiny jen když se
 * rodina ZMĚNILA — ručně nastavené místo z desktopu jinak zůstává.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/authStore.js';
import {
  createEvent, updateEvent, listFostersAssignedTo, listFostersByOrg,
  getEventTypes, addEventType,
} from '../../../services/orgService.js';
import { EVENT_TYPES } from '../../../shared/domainConstants.js';
import { toDateInputValue } from '../../../shared/rcUtils.js';
import { toJsDate, EVENT_MANAGEMENT_ROLES } from '../../../modules/calendar/calendarShared.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowSelect } from '../../ui/NativeFormRow.jsx';

const ADD_TYPE = '__add__';

/** `HH:MM` + n hodin (přetečení dne nechává 23:00 — konec pracovního dne). */
function hourPlus(time, n) {
  const h = Math.min(23, Number(time.slice(0, 2)) + n);
  return `${String(h).padStart(2, '0')}${time.slice(2)}`;
}

function toTimeInputValue(date) {
  return date.toTimeString().slice(0, 5);
}

export default function MobileEventSheet({ defaultDate, defaultFrom, event = null, onClose, onCreated }) {
  const { t } = useTranslation();
  const { role, currentUser, organizationId } = useAuthStore();
  const [families, setFamilies] = useState([]);
  const [types, setTypes] = useState(EVENT_TYPES);
  const [newTypeLabel, setNewTypeLabel] = useState(null); // null = zavřeno
  const [submitting, setSubmitting] = useState(false);
  const canAddType = EVENT_MANAGEMENT_ROLES.includes(role);
  const [form, setForm] = useState(() => {
    if (event) {
      const start = toJsDate(event.start);
      const end = toJsDate(event.end ?? event.start);
      return {
        title: event.title ?? '',
        type: event.type ?? 'other',
        familyId: event.fosterFamilyId ?? '',
        date: toDateInputValue(start),
        from: toTimeInputValue(start),
        to: toTimeInputValue(end),
      };
    }
    const from = defaultFrom ?? '09:00';
    return {
      title: '', type: 'visit', familyId: '',
      date: toDateInputValue(defaultDate ?? new Date()),
      from, to: hourPlus(from, 1),
    };
  });

  useEffect(() => {
    if (!organizationId) return;
    const loader = role === 'klicova_osoba'
      ? listFostersAssignedTo(currentUser.uid, organizationId)
      : listFostersByOrg(organizationId);
    loader.then(setFamilies).catch((err) => console.error('[MobileEventSheet] Načtení rodin selhalo:', err));
    getEventTypes(organizationId).then(setTypes).catch((err) => console.error('[MobileEventSheet] Číselník typů selhal:', err));
  }, [role, currentUser, organizationId]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleTypeChange(e) {
    const value = e.target.value;
    if (value === ADD_TYPE) {
      setNewTypeLabel('');
      return;
    }
    setForm((f) => ({ ...f, type: value }));
  }

  async function handleAddType() {
    try {
      const key = await addEventType(organizationId, newTypeLabel);
      const fresh = await getEventTypes(organizationId);
      setTypes(fresh);
      setForm((f) => ({ ...f, type: key }));
      setNewTypeLabel(null);
    } catch (err) {
      toast.error(err.message ?? t('m.event.addTypeFailed', 'Typ se nepodařilo přidat.'));
    }
  }

  const selectedFamily = families.find((f) => f.id === form.familyId);
  const effectiveTitle = form.title.trim()
    || (form.type === 'visit' && selectedFamily ? t('m.event.visitTitle', 'Návštěva — {{name}}', { name: selectedFamily.name }) : types[form.type] ?? t('m.event.defaultTitle', 'Událost'));

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const start = new Date(`${form.date}T${form.from}`);
      const end = new Date(`${form.date}T${form.to || form.from}`);
      // Vlastní typ (mimo vestavěné) → denormalizovaný label do události.
      const typeLabel = EVENT_TYPES[form.type] ? null : types[form.type] ?? null;
      if (event) {
        const patch = { title: effectiveTitle, type: form.type, typeLabel, start, end, fosterFamilyId: form.familyId || null };
        if ((event.fosterFamilyId ?? '') !== form.familyId) patch.location = selectedFamily?.address ?? '';
        await updateEvent(organizationId, event.id, patch);
        toast.info(t('m.event.updatedToast', 'Událost upravena.'));
      } else {
        await createEvent(organizationId, {
          title: effectiveTitle, type: form.type, typeLabel, start, end,
          assignedTo: currentUser.uid,
          fosterFamilyId: form.familyId || null,
          location: selectedFamily?.address ?? '',
        });
        toast.info(t('m.event.scheduledToast', 'Událost naplánována na {{date}} v {{time}}.', { date: start.toLocaleDateString('cs-CZ'), time: form.from }));
      }
      onCreated();
    } catch (err) {
      console.error('[MobileEventSheet] Uložení události selhalo:', err);
      toast.error(err.message ?? t('m.event.saveFailed', 'Uložení se nezdařilo.'));
      setSubmitting(false);
    }
  }

  return (
    <NativeSheet
      title={event ? t('m.event.editTitle', 'Upravit událost') : t('m.event.newTitle', 'Nová událost')}
      onClose={() => !submitting && onClose()}
      submitting={submitting}
      footer={
        <NativeButton onClick={handleSubmit} disabled={submitting || !form.date || !form.from}>
          {submitting ? t('m.common.saving', 'Ukládám…') : event ? t('m.event.saveChanges', 'Uložit změny') : t('m.event.schedule', 'Naplánovat')}
        </NativeButton>
      }
    >
      <NativeFormGroup>
        <NativeFormRow label={t('m.event.typeLabel', 'Typ')}>
          <RowSelect value={form.type} onChange={handleTypeChange}>
            {Object.entries(types).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
            {canAddType && <option value={ADD_TYPE}>{t('m.event.addTypeOption', '+ Nový typ…')}</option>}
          </RowSelect>
        </NativeFormRow>
        <NativeFormRow label={t('m.event.familyLabel', 'Rodina')}>
          <RowSelect value={form.familyId} onChange={set('familyId')}>
            <option value="">{t('m.event.noFamily', 'Bez rodiny')}</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </RowSelect>
        </NativeFormRow>
        <NativeFormRow label={t('m.event.nameLabel', 'Název')} hint={form.title.trim() ? undefined : t('m.event.nameHint', 'Bez názvu se použije: {{title}}', { title: effectiveTitle })}>
          <RowInput value={form.title} onChange={set('title')} placeholder={effectiveTitle} />
        </NativeFormRow>
        <NativeFormRow label={t('m.event.dateLabel', 'Datum')}>
          <RowInput type="date" value={form.date} onChange={set('date')} />
        </NativeFormRow>
        <NativeFormRow label={t('m.event.fromLabel', 'Od')}>
          <RowInput type="time" value={form.from} onChange={set('from')} />
        </NativeFormRow>
        <NativeFormRow label={t('m.event.toLabel', 'Do')} isLast>
          <RowInput type="time" value={form.to} onChange={set('to')} />
        </NativeFormRow>
      </NativeFormGroup>

      {newTypeLabel !== null && (
        <NativeFormGroup>
          <NativeFormRow label={t('m.event.newTypeLabel', 'Nový typ')} isLast hint={t('m.event.newTypeHint', 'Uloží se do číselníku organizace — uvidí ho všichni.')}>
            <RowInput
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              placeholder={t('m.event.newTypePlaceholder', 'Např. Supervize')}
              autoFocus
            />
          </NativeFormRow>
          <div className="flex gap-2 pb-3">
            <NativeButton variant="secondary" className="h-11" onClick={() => setNewTypeLabel(null)}>{t('m.common.cancel', 'Zrušit')}</NativeButton>
            <NativeButton className="h-11" onClick={handleAddType} disabled={!newTypeLabel.trim()}>{t('m.event.addTypeButton', 'Přidat typ')}</NativeButton>
          </div>
        </NativeFormGroup>
      )}
    </NativeSheet>
  );
}
