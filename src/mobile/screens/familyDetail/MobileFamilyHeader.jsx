/**
 * MobileFamilyHeader.jsx — hlavička Detailu rodiny.
 *
 * v4 (2026-07-06, Lidl Plus vzor — závazná zpětná vazba): modrý hero blok
 * s velkým jménem rodiny, chipy péče/stavu a kruhovými akcemi přímo na modré
 * (Zavolat / E-mail / Mapa / Naplánovat); obsah stránky pak najíždí zaoblenou
 * hranou přes spodek modré (HeroBody v MobileFamilyDetailScreen). Chybějící
 * údaj akci jen ztlumí. „Naplánovat" zakládá událost typu `visit` přímo odsud.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, CalendarPlus } from 'lucide-react';
import { careLabel } from '../../../shared/domainConstants.js';
import { toDateInputValue } from '../../../shared/rcUtils.js';
import { createEvent } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import { useAuthStore } from '../../../store/authStore.js';
import NativeHero, { HeroAction } from '../../ui/NativeHero.jsx';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };

/** Chip na modré ploše hero — bílý tint, ne barevné tóny z NativeChip. */
function HeroChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-semibold text-white">
      {children}
    </span>
  );
}

export default function MobileFamilyHeader({ family, familyId, canManage }) {
  const { t } = useTranslation();
  const { currentUser, organizationId } = useAuthStore();
  const [planOpen, setPlanOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planForm, setPlanForm] = useState(() => ({
    title: t('m.famDetail.planDefaultTitle', 'Návštěva rodiny'), date: toDateInputValue(new Date()), from: '09:00', to: '10:00',
  }));

  async function handlePlanVisit() {
    setPlanSubmitting(true);
    try {
      const start = new Date(`${planForm.date}T${planForm.from}`);
      const end = new Date(`${planForm.date}T${planForm.to || planForm.from}`);
      await createEvent(organizationId, {
        title: planForm.title.trim(), type: 'visit', start, end,
        assignedTo: currentUser.uid, fosterFamilyId: familyId, location: family?.address ?? '',
      });
      setPlanOpen(false);
      toast.info(t('m.famDetail.planSuccess', 'Návštěva naplánována na {{date}} v {{time}}.', { date: start.toLocaleDateString('cs-CZ'), time: planForm.from }));
    } catch (err) {
      console.error('[MobileFamilyHeader] Naplánování selhalo:', err);
      toast.error(err.message ?? t('m.famDetail.planFailed', 'Naplánování se nezdařilo.'));
    } finally {
      setPlanSubmitting(false);
    }
  }

  return (
    <>
      <NativeHero
        title={family.name}
        subtitle={
          <>
            <HeroChip>{careLabel(family.careType)}</HeroChip>
            <HeroChip>{STATUS_LABEL[family.status] ?? family.status}</HeroChip>
          </>
        }
      >
        <HeroAction
          icon={Phone}
          label={t('m.famDetail.actionCall', 'Zavolat')}
          href={family.contactPhone ? `tel:${family.contactPhone.replace(/\s/g, '')}` : undefined}
          disabled={!family.contactPhone}
        />
        <HeroAction
          icon={Mail}
          label={t('m.famDetail.actionEmail', 'E-mail')}
          href={family.contactEmail ? `mailto:${family.contactEmail}` : undefined}
          disabled={!family.contactEmail}
        />
        <HeroAction
          icon={MapPin}
          label={t('m.famDetail.actionMap', 'Mapa')}
          href={family.address ? `https://www.google.com/maps?q=${encodeURIComponent(family.address)}` : undefined}
          disabled={!family.address}
        />
        {canManage && <HeroAction icon={CalendarPlus} label={t('m.famDetail.actionPlan', 'Naplánovat')} onClick={() => setPlanOpen(true)} />}
      </NativeHero>

      {planOpen && (
        <NativeSheet
          title={t('m.famDetail.planSheetTitle', 'Naplánovat návštěvu')}
          onClose={() => !planSubmitting && setPlanOpen(false)}
          submitting={planSubmitting}
          footer={
            <NativeButton
              onClick={handlePlanVisit}
              disabled={planSubmitting || !planForm.title.trim() || !planForm.date || !planForm.from}
            >
              {planSubmitting ? t('m.famDetail.saving', 'Ukládám…') : t('m.famDetail.actionPlan', 'Naplánovat')}
            </NativeButton>
          }
        >
          <NativeFormGroup>
            <NativeFormRow label={t('m.famDetail.planTitleLabel', 'Název')}>
              <RowInput value={planForm.title} onChange={(e) => setPlanForm((f) => ({ ...f, title: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.famDetail.planDateLabel', 'Datum')}>
              <RowInput type="date" value={planForm.date} onChange={(e) => setPlanForm((f) => ({ ...f, date: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.famDetail.planFromLabel', 'Od')}>
              <RowInput type="time" value={planForm.from} onChange={(e) => setPlanForm((f) => ({ ...f, from: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label={t('m.famDetail.planToLabel', 'Do')} isLast>
              <RowInput type="time" value={planForm.to} onChange={(e) => setPlanForm((f) => ({ ...f, to: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </>
  );
}
