/**
 * InstitutionsPage.jsx — adresář „Ostatní" / instituce organizace (2026-07-13,
 * vzor: stránka Ostatní z prototypu). Seznam seskupený dle typu (OSPOD, soud,
 * škola, lékař, jiné) + hledání + založení/úprava/smazání. Data z `institutions`
 * (org-scoped); mutace jen pro role, které nejsou jen ke čtení.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Phone, Mail, MapPin, Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '../../components/ui/cn.js';
import { useAuthStore } from '../../store/authStore.js';
import { isReadOnlyManager } from '../../services/orgAuth.js';
import { listInstitutionsByOrg, deleteInstitution, INSTITUTION_TYPES } from '../../services/orgService.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import InstitutionFormDrawer from './InstitutionFormDrawer.jsx';

const TYPE_TONE = { ospod: 'ospod', soud: 'court', skola: 'info', lekar: 'success', jine: 'neutral' };

export default function InstitutionsPage() {
  const { t } = useTranslation();
  const { role, organizationId } = useAuthStore();
  const canManage = !isReadOnlyManager(role);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null); // null | 'new' | institution

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try { setItems(await listInstitutionsByOrg(organizationId)); }
    catch (err) { console.error('[InstitutionsPage] Načtení selhalo:', err); }
    finally { setLoading(false); }
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.name, i.contactPerson, i.email, i.address].some((v) => (v ?? '').toLowerCase().includes(q)));
  }, [items, search]);

  const groups = useMemo(() => {
    const by = {};
    filtered.forEach((i) => { (by[i.type] ??= []).push(i); });
    return by;
  }, [filtered]);

  async function remove(inst) {
    if (!canManage) return;
    setItems((prev) => prev.filter((i) => i.id !== inst.id));
    try { await deleteInstitution(inst.id); } catch { load(); }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{t('dsk.inst.pageTitle', 'Ostatní kontakty')}</h1>
          <p className="mt-0.5 text-sm text-ink-500">{t('dsk.inst.pageSubtitle', 'Instituce: OSPOD, soudy, školy, lékaři a další.')}</p>
        </div>
        {canManage && <Button size="sm" onClick={() => setDrawer('new')}><Plus size={15} strokeWidth={2} /> {t('dsk.inst.newTitle', 'Nová instituce')}</Button>}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} strokeWidth={1.75} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('dsk.inst.searchPlaceholder', 'Hledat instituci…')}
          className="h-9 w-full rounded-lg border border-transparent bg-surface-canvas pl-8 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {loading && <div className="flex items-center justify-center gap-2 py-16 text-ink-500"><Loader2 size={22} strokeWidth={1.75} className="animate-spin text-brand-600" /></div>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-border-subtle bg-white shadow-sm">
          <EmptyState icon={<Building2 size={28} strokeWidth={1.5} />} title={t('dsk.inst.emptyTitle', 'Žádné instituce')} description={t('dsk.inst.emptyDesc', 'Přidejte OSPOD, soud, školu nebo jiný kontakt, na který se v agendě odkazujete.')} action={canManage && <Button size="sm" onClick={() => setDrawer('new')}><Plus size={15} strokeWidth={2} /> {t('dsk.inst.newTitle', 'Nová instituce')}</Button>} />
        </div>
      )}

      {!loading && items.length > 0 && filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-400">{t('dsk.common.noSearchMatch', 'Nic neodpovídá hledání.')}</p>
      )}

      {!loading && Object.keys(INSTITUTION_TYPES).filter((type) => groups[type]?.length).map((type) => (
        <div key={type} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">{INSTITUTION_TYPES[type]}</p>
          <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-sm">
            {groups[type].map((inst, i) => (
              <div key={inst.id} className={cn('group flex items-start gap-3 px-4 py-3', i > 0 && 'border-t border-border-subtle')}>
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tint text-brand-600">
                  <Building2 size={17} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink-900">{inst.name}</p>
                    <Badge tone={TYPE_TONE[inst.type] ?? 'neutral'}>{INSTITUTION_TYPES[inst.type]}</Badge>
                  </div>
                  {inst.contactPerson && <p className="mt-0.5 text-xs text-ink-500">{inst.contactPerson}</p>}
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                    {inst.phone && <span className="inline-flex items-center gap-1"><Phone size={12} strokeWidth={1.75} className="text-ink-400" />{inst.phone}</span>}
                    {inst.email && <span className="inline-flex items-center gap-1"><Mail size={12} strokeWidth={1.75} className="text-ink-400" />{inst.email}</span>}
                    {inst.address && <span className="inline-flex items-center gap-1"><MapPin size={12} strokeWidth={1.75} className="text-ink-400" />{inst.address}</span>}
                  </div>
                  {inst.note && <p className="mt-1 text-xs text-ink-400">{inst.note}</p>}
                </div>
                {canManage && (
                  <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" onClick={() => setDrawer(inst)} aria-label={t('dsk.common.edit', 'Upravit')} className="rounded-md p-1.5 text-ink-400 hover:bg-surface-muted hover:text-ink-700"><Pencil size={15} strokeWidth={1.75} /></button>
                    <button type="button" onClick={() => remove(inst)} aria-label={t('dsk.common.delete', 'Smazat')} className="rounded-md p-1.5 text-ink-400 hover:bg-surface-muted hover:text-danger-600"><Trash2 size={15} strokeWidth={1.75} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {drawer && (
        <InstitutionFormDrawer
          organizationId={organizationId}
          institution={drawer === 'new' ? null : drawer}
          onClose={() => setDrawer(null)}
          onSaved={() => { setDrawer(null); load(); }}
        />
      )}
    </div>
  );
}
