/**
 * MobileSocialSpaceTab.jsx — "Sociální prostor" v mobilním Detailu dítěte.
 *
 * v4 (2026-07-06, Lidl vzor — závazná zpětná vazba): osoby bez biologické
 * vazby (kmotři, rodinní přátelé…) NEJSOU nahusto v jednom řádku — každá
 * osoba je karta se jménem (17px semibold) nahoře a tabulkou název vlevo /
 * hodnota vpravo (NativeInfoRow), viz MobileFostersTab.jsx.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, User } from 'lucide-react';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { SectionLabel } from '../../ui/NativeBits.jsx';
import { NativeFormGroup, NativeFormRow, NativeInfoRow, RowInput } from '../../ui/NativeFormRow.jsx';

/** Telefon/e-mail jako proklikávací hodnota v NativeInfoRow; prázdné → pomlčka. */
function phoneValue(phone) {
  return phone ? <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-native-primary">{phone}</a> : '';
}

function emailValue(email) {
  return email ? <a href={`mailto:${email}`} className="break-all text-native-primary">{email}</a> : '';
}

export default function MobileSocialSpaceTab({ child, socialDialogOpen, socialForm, setSocialForm, onOpen, onClose, onAdd, submitting, submitError, canManage }) {
  const { t } = useTranslation();
  const socialSpace = child.socialSpace ?? [];

  return (
    <div className="flex flex-col px-4 pb-6 pt-1">
      <div className="flex items-center justify-between">
        <SectionLabel>{t('m.socialCh.title', 'Sociální prostor ({{n}})', { n: socialSpace.length })}</SectionLabel>
        {canManage && (
          <button type="button" onClick={onOpen} className="flex items-center gap-1 text-[13px] font-medium text-native-primary">
            <UserPlus size={15} strokeWidth={2} /> {t('m.socialCh.add', 'Přidat')}
          </button>
        )}
      </div>
      <p className="mb-3 text-[13px] text-native-textMuted">{t('m.socialCh.description', 'Osoby bez biologické vazby — kmotři, rodinní přátelé a další blízké osoby.')}</p>

      {socialSpace.length === 0 && <p className="text-[15px] text-native-textMuted">{t('m.socialCh.empty', 'Zatím nikdo.')}</p>}
      <div className="flex flex-col gap-3">
        {socialSpace.map((p) => (
          <div key={p.id} className="rounded-native-card bg-native-surface px-4">
            <div className="flex items-center gap-3 border-b border-native-separator py-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                <User size={22} strokeWidth={1.75} />
              </span>
              <p className="min-w-0 flex-1 truncate text-[17px] font-semibold text-native-text">{p.name}</p>
            </div>
            <NativeInfoRow label={t('m.socialCh.relation', 'Vztah k dítěti')} value={p.vztah} />
            <NativeInfoRow label={t('m.socialCh.phone', 'Telefon')} value={phoneValue(p.phone)} />
            <NativeInfoRow label={t('m.socialCh.email', 'E-mail')} value={emailValue(p.email)} isLast={!p.note} />
            {p.note && <NativeInfoRow label={t('m.socialCh.note', 'Poznámka')} value={p.note} isLast />}
          </div>
        ))}
      </div>

      {socialDialogOpen && (
        <NativeSheet
          title={t('m.socialCh.addTitle', 'Přidat osobu')}
          onClose={onClose}
          submitting={submitting}
          footer={<NativeButton onClick={() => onAdd({ preventDefault: () => {} })} disabled={submitting || !socialForm.name.trim()}>{submitting ? t('m.socialCh.saving', 'Ukládám…') : t('m.socialCh.add', 'Přidat')}</NativeButton>}
        >
          {submitError && <p className="text-[13px] text-native-danger">{submitError}</p>}
          <NativeFormGroup>
            <NativeFormRow label={t('m.socialCh.name', 'Jméno')}>
              <RowInput value={socialForm.name} onChange={(e) => setSocialForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </NativeFormRow>
            <NativeFormRow label={t('m.socialCh.relation', 'Vztah k dítěti')}>
              <RowInput placeholder={t('m.socialCh.relationPlaceholder', 'např. kmotra, rodinná přítelkyně')} value={socialForm.vztah} onChange={(e) => setSocialForm((f) => ({ ...f, vztah: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.socialCh.phone', 'Telefon')}>
              <RowInput type="tel" value={socialForm.phone} onChange={(e) => setSocialForm((f) => ({ ...f, phone: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.socialCh.email', 'E-mail')} isLast>
              <RowInput type="email" value={socialForm.email} onChange={(e) => setSocialForm((f) => ({ ...f, email: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
