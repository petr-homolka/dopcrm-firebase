/**
 * MobileFostersTab.jsx — záložka "Pěstouni" v mobilním Detailu rodiny.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje pěstouna NEJSOU
 * nahusto v jednom řádku („RČ hned vedle telefonu = hnusné") — každý pěstoun
 * je karta se jménem nahoře a přehlednou tabulkou název vlevo / hodnota
 * vpravo (NativeInfoRow). Telefon/e-mail jsou proklikávací hodnoty.
 */

import React, { useState } from 'react';
import { User, Plus } from 'lucide-react';
import { parseRc } from '../../../shared/rcUtils.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';

export default function MobileFostersTab({
  fosters, fosterCourses, requiredHours, onAddFoster, canManage,
  fosterForm, setFosterForm, submitting, submitError,
  courseDialogFor, setCourseDialogFor, courseForm, setCourseForm, onAddCourse,
}) {
  const [sheet, setSheet] = useState(null); // null | 'foster'
  const rcCheck = parseRc(fosterForm.rc);

  function handleAddFoster() {
    onAddFoster();
    setSheet(null);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      {fosters.length === 0 && (
        <p className="py-6 text-center text-[15px] text-native-textMuted">Zatím žádní pěstouni.</p>
      )}

      {fosters.map((foster) => {
        const courses = (fosterCourses ?? []).filter((c) => c.personId === foster.id);
        const hours = courses.reduce((sum, c) => sum + (Number(c.hodiny) || 0), 0);
        const meetsHours = hours >= requiredHours;
        return (
          <div key={foster.id} className="rounded-native-card bg-native-surface px-4">
            <div className="flex items-center gap-3 border-b border-native-separator py-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                <User size={22} strokeWidth={1.75} />
              </span>
              <p className="min-w-0 flex-1 truncate text-[17px] font-bold text-native-text">{foster.name}</p>
            </div>
            <NativeInfoRow label="Rodné číslo" value={foster.rc} />
            <NativeInfoRow
              label="Telefon"
              value={foster.phone ? (
                <a href={`tel:${foster.phone.replace(/\s/g, '')}`} className="text-native-primary">{foster.phone}</a>
              ) : ''}
            />
            <NativeInfoRow
              label="E-mail"
              value={foster.email ? (
                <a href={`mailto:${foster.email}`} className="break-all text-native-primary">{foster.email}</a>
              ) : ''}
            />
            <NativeInfoRow
              label="Vzdělávání"
              value={`${hours} / ${requiredHours} h`}
              tone={meetsHours ? undefined : 'warning'}
              isLast={!canManage}
            />
            {canManage && (
              <button
                type="button"
                onClick={() => setCourseDialogFor(foster.id)}
                className="flex w-full items-center gap-1.5 py-3.5 text-[15px] font-medium text-native-primary"
              >
                <Plus size={16} strokeWidth={2} /> Zapsat kurz
              </button>
            )}
          </div>
        );
      })}

      {canManage && (
        <NativeButton variant="secondary" className="mt-1 h-12" onClick={() => setSheet('foster')}>
          Přidat pěstouna
        </NativeButton>
      )}

      {sheet === 'foster' && (
        <NativeSheet
          title="Přidat pěstouna"
          onClose={() => setSheet(null)}
          submitting={submitting}
          footer={<NativeButton onClick={handleAddFoster} disabled={submitting || !fosterForm.name.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Jméno">
              <RowInput value={fosterForm.name} onChange={(e) => setFosterForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow
              label="Rodné číslo"
              hint={rcCheck.error ?? (rcCheck.checksumWarning ? 'Kontrolní součet RČ nesedí — zkontrolujte, prosím.' : undefined)}
              hintTone={rcCheck.error ? 'danger' : 'warning'}
            >
              <RowInput value={fosterForm.rc} onChange={(e) => setFosterForm((f) => ({ ...f, rc: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Telefon">
              <RowInput type="tel" value={fosterForm.phone} onChange={(e) => setFosterForm((f) => ({ ...f, phone: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="E-mail" isLast>
              <RowInput type="email" value={fosterForm.email} onChange={(e) => setFosterForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {courseDialogFor && (
        <NativeSheet
          title="Zapsat kurz"
          onClose={() => setCourseDialogFor(null)}
          submitting={submitting}
          footer={<NativeButton onClick={onAddCourse} disabled={submitting || !courseForm.kod.trim()}>{submitting ? 'Ukládám…' : 'Uložit'}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label="Kód kurzu">
              <RowInput value={courseForm.kod} onChange={(e) => setCourseForm((f) => ({ ...f, kod: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label="Kde">
              <RowInput value={courseForm.kde} onChange={(e) => setCourseForm((f) => ({ ...f, kde: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Kdy">
              <RowInput type="date" value={courseForm.kdy} onChange={(e) => setCourseForm((f) => ({ ...f, kdy: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Hodiny" isLast>
              <RowInput type="number" value={courseForm.hodiny} onChange={(e) => setCourseForm((f) => ({ ...f, hodiny: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
