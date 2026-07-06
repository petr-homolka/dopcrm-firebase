/**
 * MobileEventSheet.jsx — založení A ÚPRAVA kalendářní události z mobilu
 * (2026-07-05/06, Connecteam vzor „bottom sheet jako standard pro mobilní
 * formuláře"). Bez `event` propu zakládá (datum z klepnutého dne), s ním
 * edituje existující událost (updateEvent). Typ z EVENT_TYPES, rodina
 * volitelná (org-wide události jako porada rodinu nemají), přiřazeno vždy
 * aktuálnímu uživateli — matici přiřazování jiným koordinátorkám řeší
 * desktop týdenní grid. `location` se přepisuje adresou rodiny jen když se
 * rodina ZMĚNILA — ručně nastavené místo z desktopu jinak zůstává.
 */

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore.js';
import { createEvent, updateEvent, listFostersAssignedTo, listFostersByOrg } from '../../../services/orgService.js';
import { EVENT_TYPES } from '../../../shared/domainConstants.js';
import { toDateInputValue } from '../../../shared/rcUtils.js';
import { toJsDate } from '../../../modules/calendar/calendarShared.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput, RowSelect } from '../../ui/NativeFormRow.jsx';

function toTimeInputValue(date) {
  return date.toTimeString().slice(0, 5);
}

export default function MobileEventSheet({ defaultDate, event = null, onClose, onCreated }) {
  const { role, currentUser, organizationId } = useAuthStore();
  const [families, setFamilies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
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
    return {
      title: '',
      type: 'visit',
      familyId: '',
      date: toDateInputValue(defaultDate ?? new Date()),
      from: '09:00',
      to: '10:00',
    };
  });

  useEffect(() => {
    if (!organizationId) return;
    const loader = role === 'klicova_osoba'
      ? listFostersAssignedTo(currentUser.uid, organizationId)
      : listFostersByOrg(organizationId);
    loader.then(setFamilies).catch((err) => {
      console.error('[MobileEventSheet] Načtení rodin selhalo:', err);
    });
  }, [role, currentUser, organizationId]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  const selectedFamily = families.find((f) => f.id === form.familyId);
  const effectiveTitle = form.title.trim()
    || (form.type === 'visit' && selectedFamily ? `Návštěva — ${selectedFamily.name}` : EVENT_TYPES[form.type]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const start = new Date(`${form.date}T${form.from}`);
      const end = new Date(`${form.date}T${form.to || form.from}`);
      if (event) {
        const patch = { title: effectiveTitle, type: form.type, start, end, fosterFamilyId: form.familyId || null };
        if ((event.fosterFamilyId ?? '') !== form.familyId) patch.location = selectedFamily?.address ?? '';
        await updateEvent(organizationId, event.id, patch);
        toast.info('Událost upravena.');
      } else {
        await createEvent(organizationId, {
          title: effectiveTitle,
          type: form.type,
          start,
          end,
          assignedTo: currentUser.uid,
          fosterFamilyId: form.familyId || null,
          location: selectedFamily?.address ?? '',
        });
        toast.info(`Událost naplánována na ${start.toLocaleDateString('cs-CZ')} v ${form.from}.`);
      }
      onCreated();
    } catch (err) {
      console.error('[MobileEventSheet] Uložení události selhalo:', err);
      toast.error(err.message ?? 'Uložení se nezdařilo.');
      setSubmitting(false);
    }
  }

  return (
    <NativeSheet
      title={event ? 'Upravit událost' : 'Nová událost'}
      onClose={() => !submitting && onClose()}
      submitting={submitting}
      footer={
        <NativeButton onClick={handleSubmit} disabled={submitting || !form.date || !form.from}>
          {submitting ? 'Ukládám…' : event ? 'Uložit změny' : 'Naplánovat'}
        </NativeButton>
      }
    >
      <NativeFormGroup>
        <NativeFormRow label="Typ">
          <RowSelect value={form.type} onChange={set('type')}>
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </RowSelect>
        </NativeFormRow>
        <NativeFormRow label="Rodina (volitelné)">
          <RowSelect value={form.familyId} onChange={set('familyId')}>
            <option value="">Bez rodiny</option>
            {families.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </RowSelect>
        </NativeFormRow>
        <NativeFormRow label="Název" hint={form.title.trim() ? undefined : `Bez názvu se použije: ${effectiveTitle}`}>
          <RowInput value={form.title} onChange={set('title')} placeholder={effectiveTitle} />
        </NativeFormRow>
        <NativeFormRow label="Datum">
          <RowInput type="date" value={form.date} onChange={set('date')} />
        </NativeFormRow>
        <NativeFormRow label="Od">
          <RowInput type="time" value={form.from} onChange={set('from')} />
        </NativeFormRow>
        <NativeFormRow label="Do" isLast>
          <RowInput type="time" value={form.to} onChange={set('to')} />
        </NativeFormRow>
      </NativeFormGroup>
    </NativeSheet>
  );
}
