/**
 * MobileChildParticipantsTab.jsx — záložka „Účastníci" v detailu dítěte
 * (2026-07-06, docs/domain/externi-ucastnici.md §3). KO pozve externího
 * účastníka (biologický rodič, psycholog, škola…) magic linkem; každý
 * účastník je obecný účet BEZ implicitní role — význam dá až vztah + granty.
 * Správa oprávnění je na samostatné obrazovce (…/ucastnici/:epId).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Users } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import { listExternalParticipantsForChild, createExternalParticipant } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import NativeSheet from '../../ui/NativeSheet.jsx';
import NativeButton from '../../ui/NativeButton.jsx';
import { NativeFormGroup, NativeFormRow, RowInput } from '../../ui/NativeFormRow.jsx';
import { NativeChip, NativeEmptyState } from '../../ui/NativeBits.jsx';

const STATUS_TONE = { invited: 'warning', active: 'primary', suspended: 'muted' };
const STATUS_LABEL = { invited: 'Pozván', active: 'Aktivní', suspended: 'Pozastaven' };

export default function MobileChildParticipantsTab({ child, canManage }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ displayName: '', email: '', phone: '', relationLabel: '' });
  const childName = `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim();

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listExternalParticipantsForChild(child.id, child.organizationId)); }
    catch (err) { console.error('[Participants] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [child.id, child.organizationId]);

  useEffect(() => { load(); }, [load]);

  async function handleInvite() {
    setSubmitting(true);
    try {
      await createExternalParticipant({
        organizationId: child.organizationId, childId: child.id, childName,
        relationLabel: form.relationLabel, displayName: form.displayName, email: form.email, phone: form.phone,
      });
      toast.info(`Pozvánka odeslána na ${form.email}. Účastník zatím nemá žádná oprávnění.`);
      setOpen(false);
      setForm({ displayName: '', email: '', phone: '', relationLabel: '' });
      await load();
    } catch (err) {
      console.error('[Participants] Pozvání selhalo:', err);
      toast.error(err.message ?? 'Pozvání se nezdařilo.');
    } finally {
      setSubmitting(false);
    }
  }

  const valid = form.displayName.trim() && form.email.trim();

  return (
    <div className="flex flex-col gap-3 px-4 pb-6 pt-3">
      <p className="text-[13px] text-native-textMuted">
        Externí účastníci případu (rodič, prarodič, psycholog, škola…). Každý má vlastní
        přihlášení a přesně ta oprávnění, která mu schválíte — nic víc.
      </p>

      {loading && <p className="py-6 text-center text-[15px] text-native-textMuted">Načítám…</p>}

      {!loading && items.length === 0 && (
        <NativeEmptyState icon={Users} title="Žádní účastníci" description="Pozvěte prvního externího účastníka case managementu." />
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-native-card bg-native-surface">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/admin/terenni/${child.fosterFamilyId}/deti/${child.id}/ucastnici/${p.id}`)}
              className="flex w-full items-center gap-3 pl-4 text-left active:bg-native-bg"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-native-primary/10 text-native-primary">
                <Users size={18} strokeWidth={1.75} />
              </span>
              <div className={cn('flex min-w-0 flex-1 items-center gap-2 py-3 pr-4', i < items.length - 1 && 'border-b border-native-separator')}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-native-text">{p.displayName}</p>
                  <p className="truncate text-[13px] text-native-textMuted">{p.relationLabel || 'bez popisu vztahu'}</p>
                </div>
                <NativeChip tone={STATUS_TONE[p.status] ?? 'muted'}>{STATUS_LABEL[p.status] ?? p.status}</NativeChip>
                <ChevronRight size={18} strokeWidth={2} className="shrink-0 text-native-textMuted" />
              </div>
            </button>
          ))}
        </div>
      )}

      {canManage && (
        <NativeButton variant="secondary" className="mt-1 h-12" onClick={() => setOpen(true)}>
          <UserPlus size={16} strokeWidth={2} /> Pozvat účastníka
        </NativeButton>
      )}

      {open && (
        <NativeSheet
          title="Pozvat účastníka"
          onClose={() => !submitting && setOpen(false)}
          submitting={submitting}
          footer={<NativeButton onClick={handleInvite} disabled={submitting || !valid}>{submitting ? 'Odesílám…' : 'Poslat pozvánku'}</NativeButton>}
        >
          <p className="text-[13px] text-native-textMuted">
            Účastník dostane jednorázový přihlašovací odkaz. Popis vztahu je jen informativní —
            žádná práva z něj neplynou, ta se přidělují samostatně.
          </p>
          <NativeFormGroup>
            <NativeFormRow label="Jméno"><RowInput value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} autoFocus /></NativeFormRow>
            <NativeFormRow label="Vztah (popis)"><RowInput value={form.relationLabel} onChange={(e) => setForm((f) => ({ ...f, relationLabel: e.target.value }))} placeholder="např. matka, psycholog" /></NativeFormRow>
            <NativeFormRow label="E-mail"><RowInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></NativeFormRow>
            <NativeFormRow label="Telefon" isLast><RowInput type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></NativeFormRow>
          </NativeFormGroup>
        </NativeSheet>
      )}
    </div>
  );
}
