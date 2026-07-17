/**
 * MobileFostersTab.jsx — záložka "Pěstouni" v mobilním Detailu rodiny.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): údaje pěstouna NEJSOU
 * nahusto v jednom řádku („RČ hned vedle telefonu = hnusné") — každý pěstoun
 * je karta se jménem nahoře a přehlednou tabulkou název vlevo / hodnota
 * vpravo (NativeInfoRow). Telefon/e-mail jsou proklikávací hodnoty.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Plus } from 'lucide-react';
import { parseRc } from '../../../shared/rcUtils.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';
import InviteFosterButton from './InviteFosterButton.jsx';

export default function MobileFostersTab({
  familyId, organizationId,
  fosters, fosterCourses, requiredHours, onAddFoster, canManage,
  fosterForm, setFosterForm, submitting, submitError,
  courseDialogFor, setCourseDialogFor, courseForm, setCourseForm, onAddCourse,
}) {
  const { t } = useTranslation();
  const [sheet, setSheet] = useState(null); // null | 'foster'
  const rcCheck = parseRc(fosterForm.rc);

  function handleAddFoster() {
    onAddFoster();
    setSheet(null);
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      {fosters.length === 0 && (
        <p className="py-6 text-center text-[15px] text-native-textMuted">{t('m.fosters.empty', 'Zatím žádní pěstouni.')}</p>
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
            <NativeInfoRow label={t('m.fosters.rc', 'Rodné číslo')} value={foster.rc} />
            <NativeInfoRow
              label={t('m.fosters.phone', 'Telefon')}
              value={foster.phone ? (
                <a href={`tel:${foster.phone.replace(/\s/g, '')}`} className="text-native-primary">{foster.phone}</a>
              ) : ''}
            />
            <NativeInfoRow
              label={t('m.fosters.email', 'E-mail')}
              value={foster.email ? (
                <a href={`mailto:${foster.email}`} className="break-all text-native-primary">{foster.email}</a>
              ) : ''}
            />
            <NativeInfoRow
              label={t('m.fosters.education', 'Vzdělávání')}
              value={t('m.fosters.hoursValue', '{{hours}} / {{required}} h', { hours, required: requiredHours })}
              tone={meetsHours ? undefined : 'warning'}
              isLast={!canManage}
            />
            {canManage && (
              <button
                type="button"
                onClick={() => setCourseDialogFor(foster.id)}
                className="flex w-full items-center gap-1.5 py-3.5 text-[15px] font-medium text-native-primary"
              >
                <Plus size={16} strokeWidth={2} /> {t('m.fosters.addCourse', 'Zapsat kurz')}
              </button>
            )}
          </div>
        );
      })}

      {canManage && (
        <NativeButton variant="secondary" className="mt-1 h-12" onClick={() => setSheet('foster')}>
          {t('m.fosters.addFoster', 'Přidat pěstouna')}
        </NativeButton>
      )}

      {canManage && <InviteFosterButton familyId={familyId} organizationId={organizationId} />}

      {sheet === 'foster' && (
        <NativeSheet
          title={t('m.fosters.addFoster', 'Přidat pěstouna')}
          onClose={() => setSheet(null)}
          submitting={submitting}
          footer={<NativeButton onClick={handleAddFoster} disabled={submitting || !fosterForm.name.trim()}>{submitting ? t('m.fosters.saving', 'Ukládám…') : t('m.fosters.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.fosters.name', 'Jméno')}>
              <RowInput value={fosterForm.name} onChange={(e) => setFosterForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow
              label={t('m.fosters.rc', 'Rodné číslo')}
              hint={rcCheck.error ?? (rcCheck.checksumWarning ? t('m.fosters.rcChecksumWarn', 'Kontrolní součet RČ nesedí — zkontrolujte, prosím.') : undefined)}
              hintTone={rcCheck.error ? 'danger' : 'warning'}
            >
              <RowInput value={fosterForm.rc} onChange={(e) => setFosterForm((f) => ({ ...f, rc: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.fosters.phone', 'Telefon')}>
              <RowInput type="tel" value={fosterForm.phone} onChange={(e) => setFosterForm((f) => ({ ...f, phone: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.fosters.email', 'E-mail')} isLast>
              <RowInput type="email" value={fosterForm.email} onChange={(e) => setFosterForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}

      {courseDialogFor && (
        <NativeSheet
          title={t('m.fosters.addCourse', 'Zapsat kurz')}
          onClose={() => setCourseDialogFor(null)}
          submitting={submitting}
          footer={<NativeButton onClick={onAddCourse} disabled={submitting || !courseForm.kod.trim()}>{submitting ? t('m.fosters.saving', 'Ukládám…') : t('m.fosters.save', 'Uložit')}</NativeButton>}
        >
          {submitError && <p className="text-[14px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.fosters.courseCode', 'Kód kurzu')}>
              <RowInput value={courseForm.kod} onChange={(e) => setCourseForm((f) => ({ ...f, kod: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.fosters.courseWhere', 'Kde')}>
              <RowInput value={courseForm.kde} onChange={(e) => setCourseForm((f) => ({ ...f, kde: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.fosters.courseWhen', 'Kdy')}>
              <RowInput type="date" value={courseForm.kdy} onChange={(e) => setCourseForm((f) => ({ ...f, kdy: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.fosters.courseHours', 'Hodiny')} isLast>
              <RowInput type="number" value={courseForm.hodiny} onChange={(e) => setCourseForm((f) => ({ ...f, hodiny: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
