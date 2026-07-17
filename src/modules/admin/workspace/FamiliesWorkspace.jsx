/**
 * FamiliesWorkspace.jsx — desktopový „case-management" workspace (2026-07-13).
 * Třípanel dle DESIGN.md §4.1: vlevo sidebar (AdminSidebar), uprostřed
 * MASTER seznam rodin (hledání + segment Aktivní/Archiv + výběr), vpravo
 * DETAIL vybrané rodiny/dítěte/dokumentu/účastníka přes <Outlet>. Seznam
 * zůstává namontovaný při přepínání mezi rodinami (plynulé, „profi" chování).
 *
 * Role-aware načtení: klíčová osoba vidí své přiřazené rodiny, ostatní role
 * s organizací celou organizaci; superadmin (bez org kontextu) prázdný seznam
 * — do detailu se dostane prokliky z OrganizationDetailPage a seznam mu jen
 * nepřekáží. Data z `orgService` (stejná vrstva jako původní panel).
 *
 * MOBIL: workspace je čistě desktopová konstrukce — na mobilu se vykreslí jen
 * <Outlet> (každá mobilní obrazovka má vlastní full-screen layout v MobileShell).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Loader2, Users } from 'lucide-react';
import { cn } from '../../../components/ui/cn.js';
import Avatar from '../../../components/ui/Avatar.jsx';
import { useAuthStore } from '../../../store/authStore.js';
import { isReadOnlyManager } from '../../../services/orgAuth.js';
import {
  listFostersByOrg, listFostersAssignedTo, listKlicoveOsobyByOrg, createFoster,
} from '../../../services/orgService.js';
import { careLabel } from '../../../shared/domainConstants.js';
import useIsMobile from '../../../mobile/useIsMobile.js';
import NewFamilyModal from '../NewFamilyModal.jsx';

const STATUS_DOT = { active: 'bg-success-500', paused: 'bg-warning-500', exited: 'bg-ink-300' };
const emptyForm = { name: '', address: '', contactPhone: '', careType: 'long', assignedTo: '' };

function MasterRow({ family, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
        active ? 'bg-surface-tint' : 'hover:bg-surface-muted'
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-brand-500" />}
      <Avatar name={family.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm', active ? 'font-semibold text-brand-700' : 'font-medium text-ink-900')}>{family.name}</p>
        <p className="truncate text-xs text-ink-500">{careLabel(family.careType)}</p>
      </div>
      <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_DOT[family.status] ?? 'bg-ink-300')} title={family.status} />
    </button>
  );
}

export default function FamiliesWorkspace() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { familyId } = useParams();
  const { currentUser, role, organizationId } = useAuthStore();

  const [families, setFamilies] = useState([]);
  const [kos, setKos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('active');
  // Klíčová osoba smí přepnout na celou organizaci (hierarchická viditelnost).
  const [scope, setScope] = useState('mine'); // 'mine' | 'org' — jen pro klicova_osoba
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canCreate = !!organizationId && !isReadOnlyManager(role);

  const load = useCallback(async () => {
    if (!organizationId) { setLoading(false); return; }
    setLoading(true);
    try {
      const mine = role === 'klicova_osoba' && scope === 'mine';
      const [fams, kosData] = await Promise.all([
        mine
          ? listFostersAssignedTo(currentUser.uid, organizationId)
          : listFostersByOrg(organizationId),
        listKlicoveOsobyByOrg(organizationId).catch(() => []),
      ]);
      setFamilies(fams);
      setKos(kosData);
    } catch (err) {
      console.error('[FamiliesWorkspace] Načtení rodin selhalo:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, role, currentUser, scope]);

  useEffect(() => { if (!isMobile) load(); }, [isMobile, load]);

  const filtered = useMemo(() => {
    const byTab = families.filter((f) => (tab === 'active' ? f.status === 'active' : f.status !== 'active'));
    const needle = search.trim().toLowerCase();
    const list = needle ? byTab.filter((f) => f.name?.toLowerCase().includes(needle)) : byTab;
    return [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'cs'));
  }, [families, tab, search]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitError('');
    if (!form.name.trim()) { setSubmitError(t('dsk.ws.enterName', 'Zadejte název rodiny.')); return; }
    setSubmitting(true);
    try {
      const id = await createFoster({
        organizationId,
        name: form.name.trim(),
        address: form.address.trim(),
        contactPhone: form.contactPhone.trim(),
        careType: form.careType,
        assignedTo: form.assignedTo || null,
      });
      setModalOpen(false);
      setForm(emptyForm);
      await load();
      if (id) navigate(`/admin/terenni/${id}`);
    } catch (err) {
      console.error('[FamiliesWorkspace] Založení rodiny selhalo:', err);
      setSubmitError(err.message ?? t('dsk.ws.createFailed', 'Založení se nezdařilo.'));
    } finally {
      setSubmitting(false);
    }
  }

  // Na mobilu je workspace průchozí — child route se vykreslí přímo v MobileShell.
  if (isMobile) return <Outlet />;

  const countWord = filtered.length === 1
    ? t('dsk.ws.family1', 'rodina')
    : (filtered.length >= 2 && filtered.length <= 4 ? t('dsk.ws.family234', 'rodiny') : t('dsk.ws.family5', 'rodin'));

  return (
    <div className="flex h-full min-h-0">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-border-default bg-white">
        <div className="border-b border-border-subtle px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">{t('dsk.ws.families', 'Rodiny')}</h2>
            {canCreate && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                <Plus size={14} strokeWidth={2.25} /> {t('dsk.ws.new', 'Nová')}
              </button>
            )}
          </div>
          {role === 'klicova_osoba' && (
            <div className="mt-2.5 flex gap-3 text-xs font-medium">
              {[['mine', t('dsk.ws.mine', 'Moje rodiny')], ['org', t('dsk.ws.org', 'Celá organizace')]].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setScope(key)}
                  className={cn('border-b-2 pb-0.5 transition-colors', scope === key ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-400 hover:text-ink-600')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="relative mt-3">
            <Search size={15} strokeWidth={1.75} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dsk.ws.searchPlaceholder', 'Hledat rodinu…')}
              className="h-9 w-full rounded-lg border border-transparent bg-surface-canvas pl-8 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="mt-3 flex gap-1 rounded-lg bg-surface-canvas p-0.5">
            {[['active', t('dsk.ws.active', 'Aktivní')], ['archived', t('dsk.ws.archived', 'Archiv')]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  tab === key ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-ink-400">
              <Loader2 size={18} strokeWidth={1.75} className="animate-spin" />
              <span className="text-sm">{t('dsk.common.loading', 'Načítám…')}</span>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Users size={28} strokeWidth={1.5} className="text-ink-300" />
              <p className="text-sm text-ink-500">
                {families.length === 0 ? t('dsk.ws.emptyNone', 'Zatím žádné rodiny.') : t('dsk.ws.emptyFilter', 'Nic neodpovídá filtru.')}
              </p>
            </div>
          )}
          {!loading && filtered.map((f) => (
            <MasterRow
              key={f.id}
              family={f}
              active={f.id === familyId}
              onClick={() => navigate(`/admin/terenni/${f.id}`)}
            />
          ))}
        </div>

        {!loading && (
          <div className="border-t border-border-subtle px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">
            {filtered.length} {countWord}
          </div>
        )}
      </aside>

      <section className="min-w-0 flex-1 overflow-y-auto bg-surface-canvas">
        <Outlet />
      </section>

      {modalOpen && (
        <NewFamilyModal
          form={form}
          kos={kos}
          submitting={submitting}
          submitError={submitError}
          onChange={(field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
          onSubmit={handleCreate}
          onClose={() => !submitting && setModalOpen(false)}
        />
      )}
    </div>
  );
}
