/**
 * MobileFamilyHeader.jsx — hlavička Detailu rodiny (2026-07-05): chipy typu
 * péče/stavu + karta rychlých akcí (iOS Kontakty / Connecteam vzor) místo
 * trvale zobrazené adresy a telefonu (zabíraly místo). Zavolat = tel:,
 * E-mail = mailto:, Mapa = adresa v mapách; chybějící údaj akci jen ztlumí.
 * „Naplánovat" otevírá sheet a zakládá událost typu `visit` PŘÍMO odsud —
 * dřívější odskok na /kalendar nikam nevedl (mobilní kalendář zatím
 * události zakládat neumí). Vytaženo z MobileFamilyDetailScreen.jsx
 * (CLAUDE.md limit 300 řádků).
 */

import React, { useState } from 'react';
import { MapPin, Phone, Mail, CalendarPlus } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { careLabel } from '../../../shared/domainConstants.js';
import { toDateInputValue } from '../../../shared/rcUtils.js';
import { createEvent } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import { useAuthStore } from '../../../store/authStore.js';
import { NativeChip } from '../../ui/NativeBits.jsx';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';

const STATUS_LABEL = { active: 'Aktivní', paused: 'Pozastaveno', exited: 'Ukončeno' };
const STATUS_TONE = { active: 'primary', paused: 'warning', exited: 'muted' };

function QuickAction({ icon: Icon, label, onClick, href, disabled }) {
  const content = (
    <>
      <span
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full',
          disabled ? 'bg-native-textMuted/10 text-native-textMuted' : 'bg-native-primary/10 text-native-primary'
        )}
      >
        <Icon size={20} strokeWidth={2} />
      </span>
      <span className={cn('text-[12px] font-medium', disabled ? 'text-native-textMuted' : 'text-native-primary')}>{label}</span>
    </>
  );
  const cls = 'flex flex-1 flex-col items-center gap-1.5 transition-transform duration-100 active:scale-[0.96]';
  if (href && !disabled) {
    const external = href.startsWith('http');
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={cn(cls, disabled && 'active:scale-100')}>
      {content}
    </button>
  );
}

export default function MobileFamilyHeader({ family, familyId, canManage }) {
  const { currentUser, organizationId } = useAuthStore();
  const [planOpen, setPlanOpen] = useState(false);
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [planForm, setPlanForm] = useState(() => ({
    title: 'Návštěva rodiny', date: toDateInputValue(new Date()), from: '09:00', to: '10:00',
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
      toast.info(`Návštěva naplánována na ${start.toLocaleDateString('cs-CZ')} v ${planForm.from}.`);
    } catch (err) {
      console.error('[MobileFamilyHeader] Naplánování selhalo:', err);
      toast.error(err.message ?? 'Naplánování se nezdařilo.');
    } finally {
      setPlanSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
        <NativeChip tone="muted">{careLabel(family.careType)}</NativeChip>
        <NativeChip tone={STATUS_TONE[family.status] ?? 'muted'}>
          {STATUS_LABEL[family.status] ?? family.status}
        </NativeChip>
      </div>

      <div className="mx-4 mt-3 flex rounded-native-card bg-native-surface px-2 py-3">
        <QuickAction
          icon={Phone}
          label="Zavolat"
          href={family.contactPhone ? `tel:${family.contactPhone.replace(/\s/g, '')}` : undefined}
          disabled={!family.contactPhone}
        />
        <QuickAction
          icon={Mail}
          label="E-mail"
          href={family.contactEmail ? `mailto:${family.contactEmail}` : undefined}
          disabled={!family.contactEmail}
        />
        <QuickAction
          icon={MapPin}
          label="Mapa"
          href={family.address ? `https://www.google.com/maps?q=${encodeURIComponent(family.address)}` : undefined}
          disabled={!family.address}
        />
        {canManage && (
          <QuickAction icon={CalendarPlus} label="Naplánovat" onClick={() => setPlanOpen(true)} />
        )}
      </div>

      {planOpen && (
        <NativeSheet
          title="Naplánovat návštěvu"
          onClose={() => !planSubmitting && setPlanOpen(false)}
          submitting={planSubmitting}
          footer={
            <NativeButton
              onClick={handlePlanVisit}
              disabled={planSubmitting || !planForm.title.trim() || !planForm.date || !planForm.from}
            >
              {planSubmitting ? 'Ukládám…' : 'Naplánovat'}
            </NativeButton>
          }
        >
          <NativeFormGroup>
            <NativeFormRow label="Název">
              <RowInput value={planForm.title} onChange={(e) => setPlanForm((f) => ({ ...f, title: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Datum">
              <RowInput type="date" value={planForm.date} onChange={(e) => setPlanForm((f) => ({ ...f, date: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Od">
              <RowInput type="time" value={planForm.from} onChange={(e) => setPlanForm((f) => ({ ...f, from: e.target.value }))} />
            </NativeFormRow>
            <NativeFormRow label="Do" isLast>
              <RowInput type="time" value={planForm.to} onChange={(e) => setPlanForm((f) => ({ ...f, to: e.target.value }))} />
            </NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </>
  );
}
