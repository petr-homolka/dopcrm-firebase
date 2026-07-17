/**
 * ChildParticipantsTab.jsx (desktop) — záložka „Účastníci" v detailu dítěte
 * (2026-07-13, desktop varianta MobileChildParticipantsTab). KO pozve externího
 * účastníka (biologický rodič, psycholog, škola…) magic linkem; každý účastník
 * je obecný účet BEZ implicitní role — význam dá až vztah + granty. Správa
 * oprávnění je v ParticipantDetailPanel (…/ucastnici/:epId).
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronRight, Users } from 'lucide-react';
import { listExternalParticipantsForChild, createExternalParticipant } from '../../../services/orgService.js';
import { toast } from '../../../store/toastStore.js';
import Badge from '../../../components/ui/Badge.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import Drawer from '../../../components/ui/Drawer.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';

const STATUS_TONE = { invited: 'warning', active: 'info', suspended: 'neutral' };
const STATUS_LABEL = { invited: 'Pozván', active: 'Aktivní', suspended: 'Pozastaven' };

export default function ChildParticipantsTab({ child, canManage }) {
  const { t } = useTranslation();
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
    catch (err) { console.error('[ChildParticipantsTab] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [child.id, child.organizationId]);

  useEffect(() => { load(); }, [load]);

  async function handleInvite(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createExternalParticipant({
        organizationId: child.organizationId, childId: child.id, childName,
        relationLabel: form.relationLabel, displayName: form.displayName, email: form.email, phone: form.phone,
      });
      toast.info(t('dsk.ep.invited', 'Pozvánka odeslána na {{email}}. Účastník zatím nemá žádná oprávnění.', { email: form.email }));
      setOpen(false);
      setForm({ displayName: '', email: '', phone: '', relationLabel: '' });
      await load();
    } catch (err) {
      console.error('[ChildParticipantsTab] Pozvání selhalo:', err);
      toast.error(err.message ?? t('dsk.ep.inviteFailed', 'Pozvání se nezdařilo.'));
    } finally {
      setSubmitting(false);
    }
  }

  const valid = form.displayName.trim() && form.email.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-ink-500">
          {t('dsk.ep.intro', 'Externí účastníci případu (rodič, prarodič, psycholog, škola…). Každý má vlastní přihlášení a přesně ta oprávnění, která mu schválíte — nic víc.')}
        </p>
        {canManage && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <UserPlus size={15} strokeWidth={1.75} /> {t('dsk.ep.invite', 'Pozvat účastníka')}
          </Button>
        )}
      </div>

      {loading && <p className="py-8 text-center text-sm text-ink-400">{t('dsk.common.loading', 'Načítám…')}</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-white shadow-sm">
          <EmptyState icon={<Users size={28} strokeWidth={1.5} />} title={t('dsk.ep.emptyTitle', 'Žádní účastníci')} description={t('dsk.ep.emptyDesc', 'Pozvěte prvního externího účastníka case managementu.')} />
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
          {items.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => navigate(`/admin/terenni/${child.fosterFamilyId}/deti/${child.id}/ucastnici/${p.id}`)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted ${i > 0 ? 'border-t border-border-subtle' : ''}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-tint text-brand-600">
                <Users size={17} strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-900">{p.displayName}</p>
                <p className="truncate text-xs text-ink-500">{p.relationLabel || t('dsk.ep.noRelation', 'bez popisu vztahu')}</p>
              </div>
              <Badge tone={STATUS_TONE[p.status] ?? 'neutral'}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
              <ChevronRight size={17} strokeWidth={2} className="shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <Drawer
          title={t('dsk.ep.invite', 'Pozvat účastníka')}
          onClose={() => !submitting && setOpen(false)}
          footer={<Button type="submit" form="invite-ep-form" disabled={submitting || !valid}>{submitting ? t('dsk.ep.sending', 'Odesílám…') : t('dsk.ep.sendInvite', 'Poslat pozvánku')}</Button>}
        >
          <form id="invite-ep-form" onSubmit={handleInvite} className="flex flex-col gap-4">
            <p className="text-xs leading-relaxed text-ink-500">
              {t('dsk.ep.inviteIntro', 'Účastník dostane jednorázový přihlašovací odkaz. Popis vztahu je jen informativní — žádná práva z něj neplynou, ta se přidělují samostatně.')}
            </p>
            <Input label={t('dsk.common.fullName', 'Jméno')} value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} autoFocus />
            <Input label={t('dsk.ep.relation', 'Vztah (popis)')} value={form.relationLabel} onChange={(e) => setForm((f) => ({ ...f, relationLabel: e.target.value }))} placeholder={t('dsk.ep.relationPlaceholder', 'např. matka, psycholog')} />
            <Input label={t('dsk.common.email', 'E-mail')} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label={t('dsk.common.phone', 'Telefon')} type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </form>
        </Drawer>
      )}
    </div>
  );
}
